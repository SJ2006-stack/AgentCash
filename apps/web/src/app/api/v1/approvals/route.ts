import { NextResponse } from "next/server";
import { jsonFromEngine } from "../_lib/agent-auth";
import { getMandateEngine } from "../_lib/engine";
import { runAgentRoute } from "../_lib/run-agent-route";

export async function POST(req: Request) {
  return runAgentRoute(req, "write", async (auth) => {
    let body: { token?: string; decision?: string };
    try {
      body = (await req.json()) as { token?: string; decision?: string };
    } catch {
      return NextResponse.json({ error: "bad_request", message: "Invalid JSON body." }, { status: 400 });
    }
    if (!body.token || (body.decision !== "approved" && body.decision !== "denied")) {
      return NextResponse.json(
        { error: "bad_request", message: "token and decision (approved|denied) required" },
        { status: 400 },
      );
    }
    const engine = getMandateEngine();
    const r = await engine.approvePending(auth.agentId, auth.agentKey, body.token, body.decision);
    return jsonFromEngine(r);
  });
}
