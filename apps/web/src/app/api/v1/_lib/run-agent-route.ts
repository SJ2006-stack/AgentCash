import type { NextResponse } from "next/server";
import { rateLimitedResponse, toErrorResponse } from "@/lib/api/http-errors";
import {
  agentIpMaxPerMin,
  agentRateLimits,
  checkRateLimit,
  getClientIp,
} from "@/lib/api/rate-limit";
import type { AgentAuth } from "./agent-auth";
import { parseAgentAuthBearer, unauthorized } from "./agent-auth";

export type AgentRateTier = "read_light" | "read_heavy" | "write";

const WINDOW_MS = 60_000;

/**
 * Shared guard for `/api/v1/*` agent routes: IP cap, per-agent tier cap, auth, then handler with safe errors.
 */
export async function runAgentRoute(
  req: Request,
  tier: AgentRateTier,
  work: (auth: AgentAuth) => Promise<NextResponse>,
): Promise<NextResponse> {
  const ip = getClientIp(req);
  const ipCap = agentIpMaxPerMin();
  const ipHit = checkRateLimit(`v1:ip:${ip}`, ipCap, WINDOW_MS);
  if (!ipHit.ok) return rateLimitedResponse(ipHit.retryAfterSec);

  const auth = parseAgentAuthBearer(req);
  if (!auth) return unauthorized();

  const limits = agentRateLimits();
  const tierCap = limits[tier];
  const agentHit = checkRateLimit(`v1:agent:${tier}:${auth.agentId}`, tierCap, WINDOW_MS);
  if (!agentHit.ok) return rateLimitedResponse(agentHit.retryAfterSec);

  try {
    return await work(auth);
  } catch (e) {
    return toErrorResponse(e, { defaultStatus: tier === "write" ? 400 : 500 });
  }
}
