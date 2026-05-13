import { NextResponse } from "next/server";
import { parseAgentAuthBearer, unauthorized } from "../_lib/agent-auth";
import { getMandateEngine } from "../_lib/engine";

export async function GET(req: Request) {
  const auth = parseAgentAuthBearer(req);
  if (!auth) return unauthorized();
  try {
    const engine = getMandateEngine();
    const r = await engine.listActiveCards(auth.agentId, auth.agentKey);
    if (!r.ok) {
      return NextResponse.json({ error: "policy_violation", message: r.policyViolation }, { status: 422 });
    }
    return NextResponse.json(r.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "server_error", message: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = parseAgentAuthBearer(req);
  if (!auth) return unauthorized();
  try {
    const body = (await req.json()) as Record<string, unknown>;
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
    if (!r.ok) {
      return NextResponse.json({ error: "policy_violation", message: r.policyViolation }, { status: 422 });
    }
    return NextResponse.json(r.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "bad_request", message: msg }, { status: 400 });
  }
}
