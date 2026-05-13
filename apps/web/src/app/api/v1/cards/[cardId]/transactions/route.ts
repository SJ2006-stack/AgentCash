import { NextResponse } from "next/server";
import { parseAgentAuthBearer, unauthorized } from "../../../_lib/agent-auth";
import { getMandateEngine } from "../../../_lib/engine";

export async function GET(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const auth = parseAgentAuthBearer(req);
  if (!auth) return unauthorized();
  const { cardId } = await params;
  const url = new URL(req.url);
  const limit = url.searchParams.get("limit");
  const engine = getMandateEngine();
  const r = await engine.listTransactions(
    auth.agentId,
    auth.agentKey,
    decodeURIComponent(cardId),
    limit ? Number(limit) : undefined,
  );
  if (!r.ok) return NextResponse.json({ error: "policy_violation", message: r.policyViolation }, { status: 422 });
  return NextResponse.json(r.data);
}
