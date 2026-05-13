import { NextResponse } from "next/server";
import { parseAgentAuthBearer, unauthorized } from "../../../_lib/agent-auth";
import { getMandateEngine } from "../../../_lib/engine";

export async function GET(_req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const auth = parseAgentAuthBearer(_req);
  if (!auth) return unauthorized();
  const { cardId } = await params;
  const engine = getMandateEngine();
  const r = await engine.getCardDetails(auth.agentId, auth.agentKey, decodeURIComponent(cardId));
  if (!r.ok) return NextResponse.json({ error: "policy_violation", message: r.policyViolation }, { status: 422 });
  return NextResponse.json(r.data);
}
