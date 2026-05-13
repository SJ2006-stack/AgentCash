import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { EngineResult } from "@mandate/mandate-engine";

export type AgentAuth = { agentId: string; agentKey: string };

export function parseAgentAuth(req: Request): AgentAuth | null {
  const agentId =
    req.headers.get("x-mandate-agent-id") ??
    req.headers.get("X-Mandate-Agent-Id") ??
    req.headers.get("x-agent-id");
  const agentKey = req.headers.get("x-mandate-agent-key") ?? req.headers.get("X-Mandate-Agent-Key");
  if (!agentId || !agentKey) return null;
  return { agentId, agentKey };
}

/** Authorization: Bearer <base64url(agentId:plainMcpKey)> */
export function parseAgentAuthBearer(req: NextRequest | Request): AgentAuth | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const decoded = Buffer.from(token, "base64url").toString("utf8");
        const i = decoded.indexOf(":");
        if (i > 0) {
          const agentId = decoded.slice(0, i);
          const agentKey = decoded.slice(i + 1);
          if (agentId && agentKey) return { agentId, agentKey };
        }
      } catch {
        /* fall through */
      }
    }
  }
  return parseAgentAuth(req);
}

export function jsonFromEngine(r: EngineResult, statusPolicy = 422) {
  if (r.ok) return NextResponse.json(r.data);
  return NextResponse.json(
    { error: "policy_violation", message: r.policyViolation },
    { status: statusPolicy },
  );
}

export function unauthorized() {
  return NextResponse.json(
    {
      error: "unauthorized",
      message:
        "Send X-Mandate-Agent-Id and X-Mandate-Agent-Key, or Authorization: Bearer <base64url(agentId:plainMcpKey)>.",
    },
    { status: 401 },
  );
}
