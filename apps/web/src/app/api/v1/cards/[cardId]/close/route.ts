import { NextResponse } from "next/server";
import { parseAgentAuthBearer, unauthorized } from "../../../_lib/agent-auth";
import { getMandateEngine } from "../../../_lib/engine";

export async function POST(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const auth = parseAgentAuthBearer(req);
  if (!auth) return unauthorized();
  const { cardId } = await params;
  let reason = "closed via API";
  try {
    const body = await req.json();
    if (body && typeof body.reason === "string") reason = body.reason;
  } catch {
    /* optional body */
  }
  const engine = getMandateEngine();
  const r = await engine.cancelCard(auth.agentId, auth.agentKey, decodeURIComponent(cardId), reason);
  if (!r.ok) return NextResponse.json({ error: "policy_violation", message: r.policyViolation }, { status: 422 });
  return NextResponse.json(r.data);
}
