"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { decideApprovalRpc, getServiceClient } from "@/lib/supabase/service";

function parseDollars(value: FormDataEntryValue | null, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${field}`);
  return Math.round(n * 100);
}

function parseMerchants(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function parseChannel(value: FormDataEntryValue | null): "none" | "slack" | "whatsapp" | "both" {
  const v = String(value ?? "none");
  return v === "slack" || v === "whatsapp" || v === "both" ? v : "none";
}

function parseOptionalDollars(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export async function createAgentWithMandate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const perCents = parseDollars(formData.get("per_request_dollars"), "per-request budget");
  const monthCents = parseDollars(formData.get("monthly_max_dollars"), "monthly budget");
  const merchants = parseMerchants(formData.get("merchants"));
  if (merchants.length === 0) throw new Error("Add at least one allowed merchant token");
  if (perCents > monthCents) throw new Error("Per-request limit cannot exceed monthly cap");

  const shadowMode = formData.get("shadow_mode") === "on";
  const approvalChannel = parseChannel(formData.get("approval_channel"));
  const requireAbove = parseOptionalDollars(formData.get("require_approval_above_dollars"));
  const alwaysRequire = formData.get("always_require_approval") === "on";
  const slackWebhook = String(formData.get("slack_webhook_url") ?? "").trim() || null;
  const whatsappTo = String(formData.get("whatsapp_to_e164") ?? "").trim() || null;
  const timeout = Math.min(
    1800,
    Math.max(30, Number(formData.get("approval_timeout_seconds") ?? 180) || 180),
  );

  const { data: agent, error } = await supabase
    .from("agents")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: mErr } = await supabase.from("agent_mandates").insert({
    agent_id: agent.id,
    user_id: user.id,
    max_amount_cents_per_request: perCents,
    monthly_max_cents: monthCents,
    allowed_merchants: merchants,
    shadow_mode: shadowMode,
    require_approval_above_cents: requireAbove,
    always_require_approval: alwaysRequire,
    approval_channel: approvalChannel,
    slack_webhook_url: slackWebhook,
    whatsapp_to_e164: whatsappTo,
    approval_timeout_seconds: timeout,
  });
  if (mErr) throw new Error(mErr.message);

  revalidatePath("/dashboard");
  redirect(`/dashboard/agents/${agent.id}`);
}

export async function updateMandate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const agentId = String(formData.get("agent_id") ?? "");
  if (!agentId) throw new Error("Missing agent");

  const perCents = parseDollars(formData.get("per_request_dollars"), "per-request budget");
  const monthCents = parseDollars(formData.get("monthly_max_dollars"), "monthly budget");
  const merchants = parseMerchants(formData.get("merchants"));
  if (merchants.length === 0) throw new Error("Add at least one allowed merchant token");
  if (perCents > monthCents) throw new Error("Per-request limit cannot exceed monthly cap");

  const shadowMode = formData.get("shadow_mode") === "on";
  const approvalChannel = parseChannel(formData.get("approval_channel"));
  const requireAbove = parseOptionalDollars(formData.get("require_approval_above_dollars"));
  const alwaysRequire = formData.get("always_require_approval") === "on";
  const slackWebhook = String(formData.get("slack_webhook_url") ?? "").trim() || null;
  const whatsappTo = String(formData.get("whatsapp_to_e164") ?? "").trim() || null;
  const timeout = Math.min(
    1800,
    Math.max(30, Number(formData.get("approval_timeout_seconds") ?? 180) || 180),
  );

  const { error } = await supabase
    .from("agent_mandates")
    .update({
      max_amount_cents_per_request: perCents,
      monthly_max_cents: monthCents,
      allowed_merchants: merchants,
      shadow_mode: shadowMode,
      require_approval_above_cents: requireAbove,
      always_require_approval: alwaysRequire,
      approval_channel: approvalChannel,
      slack_webhook_url: slackWebhook,
      whatsapp_to_e164: whatsappTo,
      approval_timeout_seconds: timeout,
      updated_at: new Date().toISOString(),
    })
    .eq("agent_id", agentId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/agents/${agentId}`);
}

export async function decideApproval(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const token = String(formData.get("token") ?? "");
  const decisionRaw = String(formData.get("decision") ?? "");
  const agentId = String(formData.get("agent_id") ?? "");
  if (!token || (decisionRaw !== "approved" && decisionRaw !== "denied")) {
    throw new Error("Invalid decision");
  }

  const { error } = await decideApprovalRpc(getServiceClient(), {
    token,
    decision: decisionRaw,
    via: "dashboard",
    actor: user.email ?? user.id,
  });
  if (error) throw new Error(error.message);

  if (agentId) revalidatePath(`/dashboard/agents/${agentId}`);
}

export async function cancelCardAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cardId = String(formData.get("card_id") ?? "");
  const agentId = String(formData.get("agent_id") ?? "");
  if (!cardId) throw new Error("Missing card");

  // Only cancel cards owned by this user via RLS on the join through agents
  const { error } = await supabase
    .from("agent_cards")
    .update({ status: "cancelled" })
    .eq("id", cardId);
  if (error) throw new Error(error.message);

  if (agentId) revalidatePath(`/dashboard/agents/${agentId}`);
}
