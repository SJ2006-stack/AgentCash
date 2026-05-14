import { createMandateEngine, type MandateEngine, type MandateEngineConfig } from "@mandate/mandate-engine";
import { readWorkerEnv, readWorkerEnvFlag } from "@/lib/env/worker-env";

let cached: MandateEngine | null = null;

export function getMandateEngine(): MandateEngine {
  if (cached) return cached;
  const url = readWorkerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readWorkerEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for the agent API");
  }
  const stripeSecretKey = readWorkerEnv("STRIPE_SECRET_KEY");
  const cfg: MandateEngineConfig = {
    supabaseUrl: url,
    serviceRoleKey: key,
    stripeSecretKey: stripeSecretKey || undefined,
    skipIssuing: readWorkerEnv("STRIPE_SKIP_ISSUING") === "1" || !stripeSecretKey,
    approvalBaseUrl:
      readWorkerEnv("APPROVAL_BASE_URL") ?? readWorkerEnv("NEXT_PUBLIC_SITE_URL") ?? "",
    twilioAccountSid: readWorkerEnv("TWILIO_ACCOUNT_SID"),
    twilioAuthToken: readWorkerEnv("TWILIO_AUTH_TOKEN"),
    twilioWhatsappFrom: readWorkerEnv("TWILIO_WHATSAPP_FROM"),
    allowAgentApprovalTool: readWorkerEnvFlag("MANDATE_ALLOW_AGENT_APPROVAL"),
  };
  cached = createMandateEngine(cfg);
  return cached;
}
