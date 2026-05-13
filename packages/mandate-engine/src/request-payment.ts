import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { MandateEngineConfig } from "./types.js";
import type { LedgerInsert, RequestPaymentInput, EngineResult } from "./types.js";
import { insertLedger, loadAgentName, loadMandate, monthlySpentCents, verifyMcpKey } from "./auth.js";
import { createPendingApproval, notifyApproval, waitForDecision, type CreateApprovalInput } from "./approvals.js";
import { createCard, ensureCardholder } from "./stripe-cards.js";

function baseLedgerRow(p: {
  amount_cents: number;
  merchant: string;
  intent: string;
  source_context: string | null;
  justification: string;
  card_kind: "single_use" | "subscription_lock";
  mode: "live" | "shadow";
}): Omit<LedgerInsert, "status" | "stripe_card_id" | "policy_error" | "merchant_lock" | "expires_at"> {
  return {
    amount_cents: p.amount_cents,
    merchant: p.merchant,
    intent: p.intent,
    source_context: p.source_context,
    justification: p.justification,
    mode: p.mode,
    card_kind: p.card_kind,
  };
}

function fail(policyViolation: string): EngineResult {
  return { ok: false, policyViolation };
}

function ok(data: Record<string, unknown>): EngineResult {
  return { ok: true, data };
}

function withCardAliases(data: Record<string, unknown>, stripeCardId: string | null, internalCardId?: string | null) {
  const out = { ...data };
  if (stripeCardId) {
    out.card_id = stripeCardId;
    out.stripe_card_id = stripeCardId;
  }
  if (internalCardId) out.internal_card_id = internalCardId;
  return out;
}

export async function runRequestPayment(
  supabase: SupabaseClient,
  stripe: Stripe | null,
  skipStripe: boolean,
  cfg: MandateEngineConfig,
  agentId: string,
  agentKeyPlain: string,
  input: RequestPaymentInput,
): Promise<EngineResult> {
  const card_kind = input.card_kind ?? "single_use";
  const periodDays = input.subscription_period_days ?? 30;
  const justificationText = input.justification?.trim() ? input.justification.trim() : input.intent;
  const merchantNorm = input.merchant.trim().toLowerCase();

  const keyOk = await verifyMcpKey(supabase, agentId, agentKeyPlain);
  if (!keyOk) {
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode: "live",
      }),
      merchant_lock: null,
      expires_at: null,
      status: "rejected",
      stripe_card_id: null,
      policy_error: "invalid_mcp_key",
    });
    return fail("Invalid MCP agent credentials. Regenerate MCP_AGENT_KEY in the dashboard.");
  }

  const mandate = await loadMandate(supabase, agentId);
  if (!mandate) {
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode: "live",
      }),
      merchant_lock: null,
      expires_at: null,
      status: "rejected",
      stripe_card_id: null,
      policy_error: "mandate_missing",
    });
    return fail("No mandate configured for this agent. Ask a human to set budgets and merchants.");
  }

  const shadowFromMandate = mandate.shadow_mode;
  const effectiveShadow = input.sandbox === true ? true : shadowFromMandate;
  const mode: "live" | "shadow" = effectiveShadow ? "shadow" : "live";

  const allowed = (mandate.allowed_merchants ?? []).map((m) => m.trim().toLowerCase());
  if (!allowed.includes(merchantNorm)) {
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode,
      }),
      merchant_lock: null,
      expires_at: null,
      status: "rejected",
      stripe_card_id: null,
      policy_error: "merchant_not_allowed",
    });
    return fail(
      `Merchant "${merchantNorm}" is not on the allowlist (${allowed.join(", ") || "empty"}). Ask a human to add it or use an allowed merchant.`,
    );
  }

  if (input.amount_cents > mandate.max_amount_cents_per_request) {
    const maxUsd = (mandate.max_amount_cents_per_request / 100).toFixed(2);
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode,
      }),
      merchant_lock: null,
      expires_at: null,
      status: "rejected",
      stripe_card_id: null,
      policy_error: "per_request_cap",
    });
    return fail(
      `Amount exceeds per-transaction limit ($${maxUsd}). Ask a human to raise the mandate or split the purchase.`,
    );
  }

  const spent = await monthlySpentCents(supabase, agentId);
  if (spent + input.amount_cents > mandate.monthly_max_cents) {
    const capUsd = (mandate.monthly_max_cents / 100).toFixed(2);
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode,
      }),
      merchant_lock: null,
      expires_at: null,
      status: "rejected",
      stripe_card_id: null,
      policy_error: "monthly_cap",
    });
    return fail(
      `Monthly cap exceeded (cap $${capUsd} this UTC month, already spent $${(spent / 100).toFixed(2)}). Ask a human for an override or wait until next month.`,
    );
  }

  const needsApproval =
    mode === "live" &&
    (mandate.always_require_approval ||
      (mandate.require_approval_above_cents !== null &&
        input.amount_cents > mandate.require_approval_above_cents));

  if (needsApproval) {
    if (mandate.approval_channel === "none") {
      return fail(
        "This payment requires human approval, but no approval channel is configured. Ask a human to set Slack or WhatsApp in the dashboard.",
      );
    }
    if (!cfg.approvalBaseUrl) {
      return fail(
        "APPROVAL_BASE_URL is not configured on the MCP server. Ask the operator to set the dashboard URL so approval links work.",
      );
    }
    const agentName = await loadAgentName(supabase, agentId);
    const approvalInput: CreateApprovalInput = {
      agentId,
      amountCents: input.amount_cents,
      merchant: merchantNorm,
      intent: input.intent,
      sourceContext: input.source_context,
      cardKind: card_kind,
      subscriptionPeriodDays: card_kind === "subscription_lock" ? periodDays : undefined,
      channel: mandate.approval_channel,
      slackWebhookUrl: mandate.slack_webhook_url,
      whatsappToE164: mandate.whatsapp_to_e164,
      agentName,
    };
    const row = await createPendingApproval(supabase, approvalInput);
    if (!row) {
      return fail("Failed to record approval request. Try again or escalate.");
    }
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode,
      }),
      merchant_lock: card_kind === "subscription_lock" ? merchantNorm : null,
      expires_at: null,
      status: "awaiting_approval",
      stripe_card_id: null,
      policy_error: null,
    });

    const sent = await notifyApproval(cfg, approvalInput, row);
    if (!sent.slack && !sent.whatsapp) {
      return fail(
        "Could not deliver approval message via configured channels. Verify Slack webhook / Twilio creds and retry.",
      );
    }

    const outcome = await waitForDecision(supabase, row.id, mandate.approval_timeout_seconds);
    if (outcome === "denied") {
      await insertLedger(supabase, agentId, {
        ...baseLedgerRow({
          amount_cents: input.amount_cents,
          merchant: merchantNorm,
          intent: input.intent,
          source_context: input.source_context,
          justification: justificationText,
          card_kind,
          mode,
        }),
        merchant_lock: null,
        expires_at: null,
        status: "approval_denied",
        stripe_card_id: null,
        policy_error: "human_denied",
      });
      return fail("A human denied this payment. Do not retry the same charge without new context.");
    }
    if (outcome === "timeout" || outcome === "cancelled") {
      await insertLedger(supabase, agentId, {
        ...baseLedgerRow({
          amount_cents: input.amount_cents,
          merchant: merchantNorm,
          intent: input.intent,
          source_context: input.source_context,
          justification: justificationText,
          card_kind,
          mode,
        }),
        merchant_lock: null,
        expires_at: null,
        status: "approval_timeout",
        stripe_card_id: null,
        policy_error: outcome,
      });
      return fail(
        `Approval ${outcome} after ${mandate.approval_timeout_seconds}s. Ask the human directly or queue the task for later.`,
      );
    }
  }

  if (mode === "shadow") {
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode: "shadow",
      }),
      merchant_lock: card_kind === "subscription_lock" ? merchantNorm : null,
      expires_at:
        card_kind === "subscription_lock"
          ? new Date(Date.now() + periodDays * 86_400_000).toISOString()
          : null,
      status: "shadow_approved",
      stripe_card_id: null,
      policy_error: null,
    });
    return ok(
      withCardAliases(
        {
          status: "shadow_approved",
          mode: "shadow",
          sandbox: input.sandbox === true,
          amount_cents: input.amount_cents,
          merchant: merchantNorm,
          intent: input.intent,
          card_kind,
          note: "Shadow mode: no real card was minted. Dashboard will tally this under simulated spend.",
        },
        null,
      ),
    );
  }

  const cardholderId = await ensureCardholder(supabase, stripe, skipStripe, agentId);
  if (!cardholderId && !skipStripe) {
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode,
      }),
      merchant_lock: null,
      expires_at: null,
      status: "stripe_failed",
      stripe_card_id: null,
      policy_error: "cardholder_failed",
    });
    return fail(
      "Could not create Stripe Issuing cardholder. Check Issuing is enabled, or set STRIPE_SKIP_ISSUING=1 for simulation.",
    );
  }

  try {
    const card = await createCard(stripe, skipStripe, {
      cardholderId: cardholderId ?? "sim",
      amountCents: input.amount_cents,
      kind: card_kind,
      periodDays,
    });
    const expiresAt =
      card_kind === "subscription_lock"
        ? new Date(Date.now() + periodDays * 86_400_000).toISOString()
        : null;
    const merchantLock = card_kind === "subscription_lock" ? merchantNorm : null;
    const ledgerId = await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode,
      }),
      merchant_lock: merchantLock,
      expires_at: expiresAt,
      status: "approved",
      stripe_card_id: card.id,
      policy_error: null,
    });
    const { data: insertedCard, error: acErr } = await supabase
      .from("agent_cards")
      .insert({
        agent_id: agentId,
        ledger_id: ledgerId,
        stripe_card_id: card.id,
        last4: card.last4 ?? null,
        card_kind,
        merchant_lock: merchantNorm,
        amount_cents: input.amount_cents,
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (acErr) console.error("[mandate-engine] agent_cards insert", acErr.message);
    return ok(
      withCardAliases(
        {
          status: "approved",
          mode,
          amount_cents: input.amount_cents,
          merchant: merchantNorm,
          intent: input.intent,
          card_kind,
          merchant_lock: merchantLock,
          expires_at: expiresAt,
          last4: card.last4,
          note: card.simulated
            ? "Simulated card (STRIPE_SKIP_ISSUING). Not a real PAN."
            : "Issuing card in test mode. Do not treat as production PCI scope.",
          pan_in_context: false,
          disclosure:
            "Full PAN/CVV are not returned to the LLM. Use the dashboard, Stripe test helpers, or a secure human channel to enter card data at checkout.",
        },
        card.id,
        insertedCard?.id as string | undefined,
      ),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mandate-engine] stripe issuing card error", msg);
    await insertLedger(supabase, agentId, {
      ...baseLedgerRow({
        amount_cents: input.amount_cents,
        merchant: merchantNorm,
        intent: input.intent,
        source_context: input.source_context,
        justification: justificationText,
        card_kind,
        mode,
      }),
      merchant_lock: null,
      expires_at: null,
      status: "stripe_failed",
      stripe_card_id: null,
      policy_error: msg.slice(0, 500),
    });
    return fail(
      `Stripe Issuing failed: ${msg}. Ask a human to check the Stripe dashboard (Issuing enabled, test mode, logs).`,
    );
  }
}
