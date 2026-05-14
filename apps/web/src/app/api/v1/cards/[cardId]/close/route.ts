import { NextResponse } from "next/server";
import { jsonFromEngine } from "../../../_lib/agent-auth";
import { getMandateEngine } from "../../../_lib/engine";
import { runAgentRoute } from "../../../_lib/run-agent-route";

export async function POST(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  return runAgentRoute(req, "write", async (auth) => {
    const { cardId } = await params;
    let reason = "closed via API";
    try {
      const body = (await req.json()) as { reason?: string };
      if (body && typeof body.reason === "string") reason = body.reason;
    } catch {
      /* optional body */
    }
    const engine = getMandateEngine();
    const r = await engine.cancelCard(auth.agentId, auth.agentKey, decodeURIComponent(cardId), reason);
    return jsonFromEngine(r);
  });
}
