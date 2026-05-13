import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MandateEngineConfig } from "./types.js";
import { sendSlackApproval, sendWhatsappApproval, type ApprovalMessage } from "./notifiers.js";

export type CreateApprovalInput = {
  agentId: string;
  amountCents: number;
  merchant: string;
  intent: string;
  sourceContext: string | null;
  cardKind: "single_use" | "subscription_lock";
  subscriptionPeriodDays?: number;
  channel: "none" | "slack" | "whatsapp" | "both";
  slackWebhookUrl: string | null;
  whatsappToE164: string | null;
  agentName: string;
};

export type ApprovalRow = {
  id: string;
  token: string;
  status: "pending" | "approved" | "denied" | "timeout" | "cancelled";
};

export async function createPendingApproval(supabase: SupabaseClient, input: CreateApprovalInput): Promise<ApprovalRow | null> {
  const token = `apr_${randomBytes(20).toString("base64url")}`;
  const { data, error } = await supabase
    .from("pending_approvals")
    .insert({
      agent_id: input.agentId,
      token,
      amount_cents: input.amountCents,
      merchant: input.merchant,
      intent: input.intent,
      source_context: input.sourceContext,
      card_kind: input.cardKind,
      subscription_period_days: input.subscriptionPeriodDays ?? null,
    })
    .select("id, token, status")
    .single();
  if (error) {
    console.error("[mandate-engine] approval insert error", error.message);
    return null;
  }
  return data as ApprovalRow;
}

export async function notifyApproval(
  cfg: MandateEngineConfig,
  input: CreateApprovalInput,
  row: ApprovalRow,
): Promise<{ slack: boolean; whatsapp: boolean }> {
  const baseUrl = (cfg.approvalBaseUrl ?? "").replace(/\/$/, "");
  const m: ApprovalMessage = {
    agentName: input.agentName,
    amountCents: input.amountCents,
    merchant: input.merchant,
    intent: input.intent,
    sourceContext: input.sourceContext,
    cardKind: input.cardKind,
    subscriptionPeriodDays: input.subscriptionPeriodDays,
    approveUrl: `${baseUrl}/approve/${row.token}?d=approve`,
    denyUrl: `${baseUrl}/approve/${row.token}?d=deny`,
    token: row.token,
  };

  let slackOk = false;
  let waOk = false;
  if ((input.channel === "slack" || input.channel === "both") && input.slackWebhookUrl) {
    slackOk = await sendSlackApproval(input.slackWebhookUrl, m);
  }
  if ((input.channel === "whatsapp" || input.channel === "both") && input.whatsappToE164) {
    waOk = await sendWhatsappApproval(cfg, input.whatsappToE164, m);
  }
  return { slack: slackOk, whatsapp: waOk };
}

export type WaitOutcome = "approved" | "denied" | "timeout" | "cancelled";

export async function waitForDecision(supabase: SupabaseClient, approvalId: string, timeoutSeconds: number): Promise<WaitOutcome> {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let intervalMs = 1500;
  while (Date.now() < deadline) {
    const { data, error } = await supabase
      .from("pending_approvals")
      .select("status")
      .eq("id", approvalId)
      .single();
    if (error) {
      console.error("[mandate-engine] approval poll error", error.message);
    } else if (data && data.status !== "pending") {
      return data.status as WaitOutcome;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
    if (intervalMs < 4000) intervalMs += 500;
  }
  await supabase
    .from("pending_approvals")
    .update({ status: "timeout", decided_at: new Date().toISOString(), decided_via: "magic_link" })
    .eq("id", approvalId)
    .eq("status", "pending");
  return "timeout";
}
