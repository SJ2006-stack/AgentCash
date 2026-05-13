import type { SupabaseClient } from "@supabase/supabase-js";

export type MandateEngineConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  stripeSecretKey?: string;
  /** When true or no secret, skip real Issuing calls */
  skipIssuing?: boolean;
  approvalBaseUrl?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioWhatsappFrom?: string;
  /** If false, agents cannot call approve_pending via MCP/API (default false) */
  allowAgentApprovalTool?: boolean;
};

export type Mandate = {
  id: string;
  agent_id: string;
  user_id: string;
  max_amount_cents_per_request: number;
  monthly_max_cents: number;
  allowed_merchants: string[] | null;
  currency: string;
  updated_at: string;
  shadow_mode: boolean;
  require_approval_above_cents: number | null;
  always_require_approval: boolean;
  approval_channel: "none" | "slack" | "whatsapp" | "both";
  slack_webhook_url: string | null;
  whatsapp_to_e164: string | null;
  approval_timeout_seconds: number;
};

export type LedgerStatus =
  | "approved"
  | "rejected"
  | "stripe_failed"
  | "shadow_approved"
  | "awaiting_approval"
  | "approval_denied"
  | "approval_timeout";

export type LedgerInsert = {
  amount_cents: number;
  merchant: string;
  justification: string;
  intent: string;
  source_context: string | null;
  mode: "live" | "shadow";
  card_kind: "single_use" | "subscription_lock" | null;
  merchant_lock: string | null;
  expires_at: string | null;
  status: LedgerStatus;
  stripe_card_id: string | null;
  policy_error: string | null;
};

export type RequestPaymentInput = {
  amount_cents: number;
  merchant: string;
  intent: string;
  source_context: string;
  justification?: string;
  card_kind?: "single_use" | "subscription_lock";
  subscription_period_days?: number;
  /** Per-call shadow: overrides mandate.shadow_mode when true */
  sandbox?: boolean;
};

export type EngineResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; policyViolation: string };

export type EngineDeps = {
  supabase: SupabaseClient;
  stripe: import("stripe").default | null;
  skipStripe: boolean;
  cfg: MandateEngineConfig;
};
