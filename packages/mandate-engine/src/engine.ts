import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import type { MandateEngineConfig, RequestPaymentInput, EngineResult } from "./types.js";
import { runRequestPayment } from "./request-payment.js";
import {
  runApprovePending,
  runCancelCard,
  runCheckBalance,
  runGetCardDetails,
  runListActiveCards,
  runListTransactions,
} from "./card-ops.js";

export class MandateEngine {
  readonly supabase: SupabaseClient;
  readonly stripe: Stripe | null;
  readonly skipStripe: boolean;
  readonly cfg: MandateEngineConfig;

  constructor(cfg: MandateEngineConfig) {
    this.cfg = cfg;
    this.supabase = createClient(cfg.supabaseUrl, cfg.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const secret = cfg.stripeSecretKey ?? "";
    this.stripe = secret ? new Stripe(secret) : null;
    this.skipStripe = cfg.skipIssuing === true || !secret;
  }

  requestPayment(agentId: string, agentKeyPlain: string, input: RequestPaymentInput): Promise<EngineResult> {
    return runRequestPayment(this.supabase, this.stripe, this.skipStripe, this.cfg, agentId, agentKeyPlain, input);
  }

  listActiveCards(agentId: string, agentKeyPlain: string): Promise<EngineResult> {
    return runListActiveCards(this.supabase, agentId, agentKeyPlain);
  }

  cancelCard(agentId: string, agentKeyPlain: string, cardId: string, reason: string): Promise<EngineResult> {
    return runCancelCard(this.supabase, this.stripe, this.skipStripe, agentId, agentKeyPlain, cardId, reason);
  }

  getCardDetails(agentId: string, agentKeyPlain: string, cardId: string): Promise<EngineResult> {
    return runGetCardDetails(this.supabase, this.stripe, this.skipStripe, agentId, agentKeyPlain, cardId);
  }

  checkBalance(agentId: string, agentKeyPlain: string, cardId: string): Promise<EngineResult> {
    return runCheckBalance(this.supabase, this.stripe, this.skipStripe, agentId, agentKeyPlain, cardId);
  }

  listTransactions(agentId: string, agentKeyPlain: string, cardId: string, limit?: number): Promise<EngineResult> {
    return runListTransactions(this.supabase, this.stripe, this.skipStripe, agentId, agentKeyPlain, cardId, limit);
  }

  approvePending(agentId: string, agentKeyPlain: string, token: string, decision: "approved" | "denied"): Promise<EngineResult> {
    return runApprovePending(this.supabase, this.cfg, agentId, agentKeyPlain, token, decision);
  }
}

export function createMandateEngine(cfg: MandateEngineConfig): MandateEngine {
  return new MandateEngine(cfg);
}

/** Build config from process.env (MCP / Node scripts) */
export function mandateEngineConfigFromEnv(): MandateEngineConfig {
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const skipIssuing =
    process.env.STRIPE_SKIP_ISSUING === "1" || process.env.STRIPE_SKIP_ISSUING === "true" || !stripeSecretKey;
  return {
    supabaseUrl,
    serviceRoleKey,
    stripeSecretKey: stripeSecretKey || undefined,
    skipIssuing,
    approvalBaseUrl: process.env.APPROVAL_BASE_URL ?? "",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
    allowAgentApprovalTool:
      process.env.MANDATE_ALLOW_AGENT_APPROVAL === "1" || process.env.MANDATE_ALLOW_AGENT_APPROVAL === "true",
  };
}
