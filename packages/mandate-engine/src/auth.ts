import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LedgerInsert, Mandate } from "./types.js";

export async function verifyMcpKey(supabase: SupabaseClient, agentId: string, agentKeyPlain: string): Promise<boolean> {
  const hash = createHash("sha256").update(agentKeyPlain, "utf8").digest("hex");
  const { data, error } = await supabase
    .from("agent_mcp_keys")
    .select("id")
    .eq("agent_id", agentId)
    .eq("secret_hash", hash)
    .maybeSingle();
  if (error) {
    console.error("[mandate-engine] key lookup error", error.message);
    return false;
  }
  return Boolean(data);
}

export async function monthlySpentCents(supabase: SupabaseClient, agentId: string): Promise<number> {
  const start = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
  ).toISOString();
  const { data, error } = await supabase
    .from("payment_ledger")
    .select("amount_cents")
    .eq("agent_id", agentId)
    .in("status", ["approved", "shadow_approved"])
    .gte("created_at", start);
  if (error) {
    console.error("[mandate-engine] monthly sum error", error.message);
    return 0;
  }
  return (data ?? []).reduce((s, r) => s + (r.amount_cents as number), 0);
}

export async function insertLedger(supabase: SupabaseClient, agentId: string, row: LedgerInsert): Promise<string | null> {
  const { data, error } = await supabase
    .from("payment_ledger")
    .insert({ agent_id: agentId, ...row })
    .select("id")
    .single();
  if (error) {
    console.error("[mandate-engine] ledger insert error", error.message);
    return null;
  }
  return data?.id as string;
}

export async function loadMandate(supabase: SupabaseClient, agentId: string): Promise<Mandate | null> {
  const { data, error } = await supabase.from("agent_mandates").select("*").eq("agent_id", agentId).single();
  if (error || !data) return null;
  return data as Mandate;
}

export async function loadAgentName(supabase: SupabaseClient, agentId: string): Promise<string> {
  const { data } = await supabase.from("agents").select("name").eq("id", agentId).single();
  return (data?.name as string) ?? "Agent";
}
