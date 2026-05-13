import { createMandateEngine, type MandateEngine, type MandateEngineConfig } from "@mandate/mandate-engine";

let cached: MandateEngine | null = null;

export function getMandateEngine(): MandateEngine {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for the agent API");
  }
  const cfg: MandateEngineConfig = {
    supabaseUrl: url,
    serviceRoleKey: key,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || undefined,
    skipIssuing: process.env.STRIPE_SKIP_ISSUING === "1" || !process.env.STRIPE_SECRET_KEY,
    approvalBaseUrl: process.env.APPROVAL_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
    allowAgentApprovalTool:
      process.env.MANDATE_ALLOW_AGENT_APPROVAL === "1" || process.env.MANDATE_ALLOW_AGENT_APPROVAL === "true",
  };
  cached = createMandateEngine(cfg);
  return cached;
}
