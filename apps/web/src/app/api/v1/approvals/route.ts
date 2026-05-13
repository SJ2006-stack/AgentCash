import { NextResponse } from "next/server";
import { parseAgentAuthBearer, unauthorized } from "../_lib/agent-auth";
import { getMandateEngine } from "../_lib/engine";

export async function POST(req: Request) {
  const auth = parseAgentAuthBearer(req);
  if (!auth) return unauthorized();
  try {
    const body = (await req.json()) as { token?: string; decision?: string };
    if (!body.token || (body.decision !== "approved" && body.decision !== "denied")) {
      return NextResponse.json({ error: "bad_request", message: "token and decision (approved|denied) required" }, { status: 400 });
    }
    const engine = getMandateEngine();
    const r = await engine.approvePending(auth.agentId, auth.agentKey, body.token, body.decision);
    if (!r.ok) return NextResponse.json({ error: "policy_violation", message: r.policyViolation }, { status: 422 });
    return NextResponse.json(r.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "bad_request", message: msg }, { status: 400 });
  }
}
