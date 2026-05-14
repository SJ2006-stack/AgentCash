import { NextResponse } from "next/server";

export function rateLimitedResponse(retryAfterSec: number) {
  return NextResponse.json(
    {
      error: "rate_limited",
      message:
        "Too many requests for this agent or IP. Slow down to avoid burning Stripe/Supabase quotas. See AGENT_API_* env vars.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}

function isRecord(e: unknown): e is Record<string, unknown> {
  return typeof e === "object" && e !== null;
}

function isStripeLike(e: unknown): e is { type?: string; message?: string; statusCode?: number } {
  if (!isRecord(e)) return false;
  const t = e.type;
  return typeof t === "string" && t.startsWith("Stripe");
}

function isPostgrestLike(e: unknown): e is { code?: string; message?: string } {
  if (!isRecord(e)) return false;
  return typeof e.code === "string" && typeof e.message === "string";
}

function isSyntaxError(e: unknown): e is SyntaxError {
  return e instanceof SyntaxError;
}

/**
 * Map thrown errors to stable JSON without leaking raw vendor payloads to clients.
 */
export function toErrorResponse(e: unknown, opts?: { defaultStatus?: number }): NextResponse {
  const defaultStatus = opts?.defaultStatus ?? 500;

  if (isSyntaxError(e)) {
    return NextResponse.json({ error: "bad_request", message: "Invalid JSON body." }, { status: 400 });
  }

  if (isStripeLike(e)) {
    const sc = typeof e.statusCode === "number" ? e.statusCode : 502;
    const status = sc === 429 ? 429 : 502;
    return NextResponse.json(
      {
        error: "upstream_stripe",
        message:
          "Stripe Issuing request failed. Check dashboard (test mode, Issuing enabled) and retry with backoff; do not hot-loop.",
      },
      { status },
    );
  }

  if (isPostgrestLike(e)) {
    const pg = e.code ?? "";
    if (pg === "PGRST116" || pg === "22P02") {
      return NextResponse.json({ error: "bad_request", message: "Invalid or unknown resource reference." }, { status: 400 });
    }
    return NextResponse.json(
      {
        error: "database_error",
        message: "Supabase request failed. Retry with backoff; avoid tight polling loops.",
      },
      { status: 503 },
    );
  }

  if (e instanceof Error) {
    const msg = e.message;
    if (/must be set|missing|required/i.test(msg) && /env|SUPABASE|STRIPE|KEY|URL/i.test(msg)) {
      return NextResponse.json({ error: "service_misconfigured", message: "Server environment is incomplete." }, { status: 503 });
    }
    if (/NEXT_PUBLIC_SUPABASE|SUPABASE_SERVICE_ROLE/i.test(msg)) {
      return NextResponse.json({ error: "service_misconfigured", message: "Server environment is incomplete." }, { status: 503 });
    }
    return NextResponse.json({ error: "server_error", message: msg.slice(0, 500) }, { status: defaultStatus });
  }

  return NextResponse.json({ error: "server_error", message: "Unexpected failure." }, { status: defaultStatus });
}
