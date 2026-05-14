import { readWorkerEnv } from "@/lib/env/worker-env";

/** Best-effort per-isolate counters (Cloudflare Workers); resets on cold start. */
const buckets = new Map<string, number[]>();
let gcTicks = 0;

function envInt(name: string, fallback: number): number {
  const raw = readWorkerEnv(name);
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function agentRateLimits(): Record<"read_light" | "read_heavy" | "write", number> {
  return {
    read_light: envInt("AGENT_API_READ_LIGHT_PER_MIN", 120),
    read_heavy: envInt("AGENT_API_READ_HEAVY_PER_MIN", 40),
    write: envInt("AGENT_API_WRITE_PER_MIN", 25),
  };
}

export function agentIpMaxPerMin(): number {
  return envInt("AGENT_API_IP_MAX_PER_MIN", 600);
}

export function mcpKeyRotateMaxPerHour(): number {
  return envInt("MCP_KEY_ROTATE_MAX_PER_HOUR", 8);
}

function maybeGcBuckets() {
  gcTicks += 1;
  if (gcTicks % 64 !== 0) return;
  if (buckets.size < 4000) return;
  const keys = [...buckets.keys()].slice(0, 2000);
  for (const k of keys) buckets.delete(k);
}

/**
 * Fixed-window-ish limiter using request timestamps in a sliding window.
 * @param max 0 disables this bucket (always allow).
 */
export function checkRateLimit(key: string, max: number, windowMs: number): { ok: true } | { ok: false; retryAfterSec: number } {
  if (max <= 0) return { ok: true };
  maybeGcBuckets();
  const now = Date.now();
  const start = now - windowMs;
  let stamps = buckets.get(key);
  if (!stamps) {
    stamps = [];
    buckets.set(key, stamps);
  }
  while (stamps.length > 0 && stamps[0]! < start) stamps.shift();
  if (stamps.length >= max) {
    const oldest = stamps[0]!;
    const retryAfterMs = Math.max(0, windowMs - (now - oldest)) + 25;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  stamps.push(now);
  return { ok: true };
}
