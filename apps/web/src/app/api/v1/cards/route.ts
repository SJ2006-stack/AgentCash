import { NextResponse } from "next/server";
import { jsonFromEngine } from "../_lib/agent-auth";
import { getMandateEngine } from "../_lib/engine";
import { runAgentRoute } from "../_lib/run-agent-route";

export async function GET(req: Request) {
  return runAgentRoute(req, "read_light", async (auth) => {
    const engine = getMandateEngine();
    const r = await engine.listActiveCards(auth.agentId, auth.agentKey);
    if (!r.ok) {
      return NextResponse.json({ error: "policy_violation", message: r.policyViolation }, { status: 422 });
    }
    return NextResponse.json(r.data);
  });
}

export async function POST(req: Request) {
  return runAgentRoute(req, "write", async (auth) => {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "bad_request", message: "Invalid JSON body." }, { status: 400 });
    }
    const amount = Number(body.amount_cents);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "bad_request", message: "amount_cents required" }, { status: 400 });
    }
    const engine = getMandateEngine();
    const r = await engine.requestPayment(auth.agentId, auth.agentKey, {
      amount_cents: Math.round(amount),
      merchant: String(body.merchant ?? "agentcard"),
      intent: String(body.intent ?? "REST API card issuance."),
      source_context: String(body.source_context ?? "POST /api/v1/cards"),
      justification: body.justification != null ? String(body.justification) : undefined,
      card_kind: body.card_kind === "subscription_lock" ? "subscription_lock" : "single_use",
      subscription_period_days:
        body.subscription_period_days != null ? Number(body.subscription_period_days) : undefined,
      sandbox: body.sandbox === true,
    });
    return jsonFromEngine(r);
  });
}
