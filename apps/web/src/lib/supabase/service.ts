import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { readWorkerEnv } from "@/lib/env/worker-env";

let cached: SupabaseClient | null = null;

/** Server-only service-role client. Never expose to the browser. */
export function getServiceClient(): SupabaseClient {
  if (cached) return cached;
  const url = readWorkerEnv("NEXT_PUBLIC_SUPABASE_URL")!;
  const key = readWorkerEnv("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY or URL missing");
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

type Decision = "approved" | "denied";
type DecideVia = "dashboard" | "slack" | "whatsapp" | "magic_link";

export async function decideApprovalRpc(
  sb: SupabaseClient,
  args: { token: string; decision: Decision; via: DecideVia; actor: string },
): Promise<{ error: { message: string } | null }> {
  // Untyped rpc bag because we don't ship a generated Database type.
  const params = {
    p_token: args.token,
    p_decision: args.decision,
    p_via: args.via,
    p_actor: args.actor,
  } as never;
  const res = await sb.rpc("decide_pending_approval", params);
  return { error: res.error ? { message: res.error.message } : null };
}
