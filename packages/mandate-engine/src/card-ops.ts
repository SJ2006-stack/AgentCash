import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { MandateEngineConfig } from "./types.js";
import type { EngineResult } from "./types.js";
import { verifyMcpKey } from "./auth.js";
import { deactivateCard, listIssuingTransactions, retrieveIssuingCard } from "./stripe-cards.js";

async function resolveStripeCardId(
  supabase: SupabaseClient,
  agentId: string,
  cardId: string,
): Promise<{ stripe_card_id: string; internal_id: string } | null> {
  const trimmed = cardId.trim();
  if (trimmed.startsWith("ic_") || trimmed.startsWith("card_sim")) {
    const { data } = await supabase
      .from("agent_cards")
      .select("id, stripe_card_id")
      .eq("agent_id", agentId)
      .eq("stripe_card_id", trimmed)
      .maybeSingle();
    if (!data) return null;
    return { stripe_card_id: data.stripe_card_id as string, internal_id: data.id as string };
  }
  const { data } = await supabase
    .from("agent_cards")
    .select("id, stripe_card_id")
    .eq("agent_id", agentId)
    .eq("id", trimmed)
    .maybeSingle();
  if (!data) return null;
  return { stripe_card_id: data.stripe_card_id as string, internal_id: data.id as string };
}

function fail(msg: string): EngineResult {
  return { ok: false, policyViolation: msg };
}

function ok(data: Record<string, unknown>): EngineResult {
  return { ok: true, data };
}

export async function runListActiveCards(supabase: SupabaseClient, agentId: string, agentKey: string): Promise<EngineResult> {
  if (!(await verifyMcpKey(supabase, agentId, agentKey))) return fail("Invalid MCP credentials.");
  const { data, error } = await supabase
    .from("agent_cards")
    .select("id, stripe_card_id, last4, card_kind, merchant_lock, amount_cents, expires_at, status, created_at")
    .eq("agent_id", agentId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return fail(`Failed to list cards: ${error.message}`);
  const cards = (data ?? []).map((c) => ({
    ...c,
    card_id: c.stripe_card_id,
  }));
  return ok({ cards });
}

export async function runCancelCard(
  supabase: SupabaseClient,
  stripe: Stripe | null,
  skipStripe: boolean,
  agentId: string,
  agentKey: string,
  cardId: string,
  reason: string,
): Promise<EngineResult> {
  if (!(await verifyMcpKey(supabase, agentId, agentKey))) return fail("Invalid MCP credentials.");
  const resolved = await resolveStripeCardId(supabase, agentId, cardId);
  if (!resolved) return fail("No such card for this agent.");
  const { data: row } = await supabase
    .from("agent_cards")
    .select("id, status")
    .eq("id", resolved.internal_id)
    .maybeSingle();
  if (!row) return fail("No such card for this agent.");
  if (row.status !== "active") return fail(`Card is already in status="${row.status}"; nothing to cancel.`);
  const stripeOk = await deactivateCard(stripe, skipStripe, resolved.stripe_card_id);
  if (!stripeOk) return fail("Stripe refused to cancel the card. Check the Stripe dashboard.");
  await supabase.from("agent_cards").update({ status: "cancelled" }).eq("id", row.id);
  return ok({
    ok: true,
    card_id: resolved.stripe_card_id,
    stripe_card_id: resolved.stripe_card_id,
    internal_card_id: resolved.internal_id,
    reason,
    note: "Card cancelled. Future charges will fail.",
  });
}

export async function runGetCardDetails(
  supabase: SupabaseClient,
  stripe: Stripe | null,
  skipStripe: boolean,
  agentId: string,
  agentKey: string,
  cardId: string,
): Promise<EngineResult> {
  if (!(await verifyMcpKey(supabase, agentId, agentKey))) return fail("Invalid MCP credentials.");
  const resolved = await resolveStripeCardId(supabase, agentId, cardId);
  if (!resolved) return fail("No such card for this agent.");
  const { data: row } = await supabase
    .from("agent_cards")
    .select("*")
    .eq("id", resolved.internal_id)
    .single();
  if (!row) return fail("No such card for this agent.");
  const issuing = await retrieveIssuingCard(stripe, skipStripe, resolved.stripe_card_id);
  return ok({
    card_id: resolved.stripe_card_id,
    stripe_card_id: resolved.stripe_card_id,
    internal_card_id: resolved.internal_id,
    status: issuing.status,
    last4: issuing.last4,
    exp_month: issuing.exp_month,
    exp_year: issuing.exp_year,
    brand: issuing.brand,
    merchant_lock: row.merchant_lock,
    amount_cents: row.amount_cents,
    expires_at: row.expires_at,
    card_kind: row.card_kind,
    pan_in_context: false,
    note: "PCI: full PAN/CVV are never returned to the model. Use Stripe Issuing test flows or a human-operated checkout.",
  });
}

export async function runCheckBalance(
  supabase: SupabaseClient,
  stripe: Stripe | null,
  skipStripe: boolean,
  agentId: string,
  agentKey: string,
  cardId: string,
): Promise<EngineResult> {
  if (!(await verifyMcpKey(supabase, agentId, agentKey))) return fail("Invalid MCP credentials.");
  const resolved = await resolveStripeCardId(supabase, agentId, cardId);
  if (!resolved) return fail("No such card for this agent.");
  const { data: row } = await supabase
    .from("agent_cards")
    .select("amount_cents")
    .eq("id", resolved.internal_id)
    .single();
  if (!row) return fail("No such card for this agent.");
  const issued = row.amount_cents as number;
  const { transactions } = await listIssuingTransactions(stripe, skipStripe, resolved.stripe_card_id, 100);
  const spent = transactions.reduce((s, t) => s + Math.abs(t.amount), 0);
  const remaining_cents_estimate = Math.max(0, issued - spent);
  return ok({
    card_id: resolved.stripe_card_id,
    issued_cents: issued,
    spent_cents_estimate: spent,
    remaining_cents_estimate,
    transaction_count: transactions.length,
    note: "spent_cents_estimate sums Issuing transaction amounts for this card (absolute values).",
  });
}

export async function runListTransactions(
  supabase: SupabaseClient,
  stripe: Stripe | null,
  skipStripe: boolean,
  agentId: string,
  agentKey: string,
  cardId: string,
  limit?: number,
): Promise<EngineResult> {
  if (!(await verifyMcpKey(supabase, agentId, agentKey))) return fail("Invalid MCP credentials.");
  const resolved = await resolveStripeCardId(supabase, agentId, cardId);
  if (!resolved) return fail("No such card for this agent.");
  const lim = limit ?? 25;
  const { transactions } = await listIssuingTransactions(stripe, skipStripe, resolved.stripe_card_id, lim);
  return ok({ card_id: resolved.stripe_card_id, transactions });
}

export async function runApprovePending(
  supabase: SupabaseClient,
  cfg: MandateEngineConfig,
  agentId: string,
  agentKey: string,
  token: string,
  decision: "approved" | "denied",
): Promise<EngineResult> {
  if (!cfg.allowAgentApprovalTool) {
    return fail(
      "approve_pending is disabled. Humans approve via Slack, WhatsApp, magic link, or dashboard. Set MANDATE_ALLOW_AGENT_APPROVAL=1 on the server to enable (not recommended for production).",
    );
  }
  if (!(await verifyMcpKey(supabase, agentId, agentKey))) return fail("Invalid MCP credentials.");
  const { data: row, error } = await supabase
    .from("pending_approvals")
    .select("id, agent_id, status")
    .eq("token", token.trim())
    .maybeSingle();
  if (error || !row) return fail("Unknown approval token.");
  if (row.agent_id !== agentId) return fail("Token does not belong to this agent.");
  if (row.status !== "pending") return fail(`Approval already ${row.status}.`);
  const rpcParams = {
    p_token: token.trim(),
    p_decision: decision,
    p_via: "dashboard",
    p_actor: "agent_approve_pending_tool",
  } as never;
  const { error: rpcErr } = await supabase.rpc("decide_pending_approval", rpcParams);
  if (rpcErr) return fail(rpcErr.message);
  return ok({ ok: true, token: token.trim(), decision });
}
