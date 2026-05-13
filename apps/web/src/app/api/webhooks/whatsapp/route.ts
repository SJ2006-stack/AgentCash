import { NextResponse } from "next/server";
import { decideApprovalRpc, getServiceClient } from "@/lib/supabase/service";

// Twilio WhatsApp inbound webhook. Reply parsing:
//   "YES <token>" / "NO <token>" / "approve <token>" / "deny <token>"
//   If a token is omitted we fall back to the most recent pending approval
//   for the sender's WhatsApp number (matched against agent_mandates.whatsapp_to_e164).
export async function POST(req: Request) {
  const sb = getServiceClient();
  const form = await req.formData();
  const fromRaw = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "").trim();
  const from = fromRaw.replace(/^whatsapp:/i, "").trim();

  const match = body.match(/^\s*(YES|NO|APPROVE|DENY|Y|N)\b\s*(\S+)?/i);
  if (!match) {
    return twimlReply("Send: YES <token> to approve or NO <token> to deny.");
  }

  const verb = match[1].toUpperCase();
  const decision = verb === "YES" || verb === "Y" || verb === "APPROVE" ? "approved" : "denied";
  let token = match[2];

  if (!token) {
    const { data: mandate } = await sb
      .from("agent_mandates")
      .select("agent_id")
      .eq("whatsapp_to_e164", from)
      .maybeSingle();
    if (!mandate) {
      return twimlReply("Cannot identify your agent. Include the token from the original message.");
    }
    const { data: pending } = await sb
      .from("pending_approvals")
      .select("token")
      .eq("agent_id", mandate.agent_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!pending) {
      return twimlReply("No pending approvals for this number.");
    }
    token = pending.token;
  }

  const { error } = await decideApprovalRpc(sb, {
    token,
    decision,
    via: "whatsapp",
    actor: from,
  });
  if (error) {
    return twimlReply(`Could not record decision: ${error.message}`);
  }
  return twimlReply(`Recorded: ${decision.toUpperCase()} for ${token.slice(0, 12)}...`);
}

function twimlReply(text: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(text)}</Message></Response>`;
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c] ?? c);
}
