import { NextResponse } from "next/server";
import { getMandateEngine } from "../../../_lib/engine";
import { runAgentRoute } from "../../../_lib/run-agent-route";

export async function GET(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  return runAgentRoute(req, "read_heavy", async (auth) => {
    const { cardId } = await params;
    const engine = getMandateEngine();
    const r = await engine.checkBalance(auth.agentId, auth.agentKey, decodeURIComponent(cardId));
    if (!r.ok) return NextResponse.json({ error: "policy_violation", message: r.policyViolation }, { status: 422 });
    return NextResponse.json(r.data);
  });
}
