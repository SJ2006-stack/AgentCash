import { NextResponse } from "next/server";
import { readWorkerEnv } from "@/lib/env/worker-env";
import { decideApprovalRpc, getServiceClient } from "@/lib/supabase/service";

// Optional Slack slash-command webhook: /mandate approve <token> | deny <token>
// Configure in Slack as `command=/mandate`, request URL points here.
// Verification token is optional; pass via env SLACK_VERIFICATION_TOKEN to enforce.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const text = String(form.get("text") ?? "").trim();
    const user = String(form.get("user_name") ?? "slack-user");
    const token = String(form.get("token") ?? "");
    const expected = readWorkerEnv("SLACK_VERIFICATION_TOKEN");
    if (expected && expected !== token) {
      return NextResponse.json({ response_type: "ephemeral", text: "Bad verification token." });
    }
    const m = text.match(/^(approve|deny)\s+(\S+)/i);
    if (!m) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Usage: `/mandate approve <token>` or `/mandate deny <token>`",
      });
    }
    const decision = m[1].toLowerCase() === "approve" ? "approved" : "denied";
    const approvalToken = m[2];

    const sb = getServiceClient();
    const { error } = await decideApprovalRpc(sb, {
      token: approvalToken,
      decision,
      via: "slack",
      actor: user,
    });
    if (error) {
      return NextResponse.json({ response_type: "ephemeral", text: `Failed: ${error.message}` });
    }
    return NextResponse.json({
      response_type: "in_channel",
      text: `:white_check_mark: ${decision.toUpperCase()} recorded by ${user} for token \`${approvalToken.slice(0, 12)}...\``,
    });
  } catch {
    return NextResponse.json(
      { response_type: "ephemeral", text: "Something went wrong processing this command. Try again shortly." },
      { status: 500 },
    );
  }
}
