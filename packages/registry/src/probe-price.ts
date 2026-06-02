import type { RegistryEntry } from "./types.js";
import { AGENTCASH_REFERER } from "./types.js";

export interface PriceProbeResult {
  slug: string;
  endpoint: string;
  httpStatus: number;
  is402: boolean;
  priceUsdc: number | null;
  rawHint?: string;
  probedAt: string;
  fromCache: boolean;
}

interface CacheRow {
  expiresAt: number;
  result: PriceProbeResult;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheRow>();

function defaultFetch(): typeof fetch {
  return globalThis.fetch.bind(globalThis);
}

function parsePriceFrom402(
  headers: Headers,
  bodyText: string,
): { priceUsdc: number | null; rawHint?: string } {
  const hints: string[] = [];
  for (const name of [
    "payment-required",
    "www-authenticate",
    "x-payment-required",
  ]) {
    const v = headers.get(name);
    if (v) hints.push(v);
  }

  if (bodyText) {
    try {
      const json = JSON.parse(bodyText) as Record<string, unknown>;
      const amount =
        json.maxAmountRequired ??
        json.maxAmount ??
        json.amount ??
        json.price;
      if (typeof amount === "string" || typeof amount === "number") {
        const n = Number(amount);
        if (!Number.isNaN(n)) {
          const usdc =
            n > 1_000_000 ? n / 1_000_000 : n > 100 ? n / 1_000_000 : n;
          return { priceUsdc: usdc, rawHint: bodyText.slice(0, 500) };
        }
      }
      if (json.accepts && Array.isArray(json.accepts)) {
        const first = json.accepts[0] as Record<string, unknown> | undefined;
        const max = first?.maxAmountRequired ?? first?.maxAmount;
        if (max !== undefined) {
          const n = Number(max);
          if (!Number.isNaN(n)) {
            const usdc = n > 1_000_000 ? n / 1_000_000 : n;
            return { priceUsdc: usdc, rawHint: JSON.stringify(first) };
          }
        }
      }
    } catch {
      hints.push(bodyText.slice(0, 300));
    }
  }

  const joined = hints.join("; ");
  const usdcMatch = joined.match(/(\d+(?:\.\d+)?)\s*USDC/i);
  if (usdcMatch?.[1]) {
    return { priceUsdc: Number(usdcMatch[1]), rawHint: joined.slice(0, 500) };
  }

  return { priceUsdc: null, rawHint: joined || undefined };
}

async function probeOnce(
  entry: RegistryEntry,
  method: "HEAD" | "GET",
  fetchImpl: typeof fetch,
): Promise<{ status: number; headers: Headers; body: string }> {
  const response = await fetchImpl(entry.endpoint, {
    method,
    headers: {
      Referer: AGENTCASH_REFERER,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(15_000),
  });
  const body =
    method === "GET" && response.status === 402
      ? await response.text()
      : "";
  return { status: response.status, headers: response.headers, body };
}

/**
 * HEAD then GET probe for x402 pricing (HTTP 402). Results cached 60s per slug.
 */
export async function probePrice(
  entry: RegistryEntry,
  fetchImpl: typeof fetch = defaultFetch(),
): Promise<PriceProbeResult> {
  const cached = cache.get(entry.slug);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.result, fromCache: true };
  }

  let status = 0;
  let headers = new Headers();
  let body = "";

  try {
    const head = await probeOnce(entry, "HEAD", fetchImpl);
    status = head.status;
    headers = head.headers;
    if (status === 405 || status === 501) {
      const get = await probeOnce(entry, "GET", fetchImpl);
      status = get.status;
      headers = get.headers;
      body = get.body;
    } else if (status === 402) {
      const get = await probeOnce(entry, "GET", fetchImpl);
      status = get.status;
      headers = get.headers;
      body = get.body;
    }
  } catch (err) {
    const result: PriceProbeResult = {
      slug: entry.slug,
      endpoint: entry.endpoint,
      httpStatus: 0,
      is402: false,
      priceUsdc: null,
      rawHint: err instanceof Error ? err.message : String(err),
      probedAt: new Date().toISOString(),
      fromCache: false,
    };
    cache.set(entry.slug, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      result,
    });
    return result;
  }

  const is402 = status === 402;
  const parsed = is402
    ? parsePriceFrom402(headers, body)
    : { priceUsdc: null as number | null };

  const result: PriceProbeResult = {
    slug: entry.slug,
    endpoint: entry.endpoint,
    httpStatus: status,
    is402,
    priceUsdc: parsed.priceUsdc ?? (is402 ? entry.price_usdc : null),
    rawHint: parsed.rawHint,
    probedAt: new Date().toISOString(),
    fromCache: false,
  };

  cache.set(entry.slug, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    result,
  });

  return result;
}

/** Clear probe cache (tests). */
export function clearProbeCache(): void {
  cache.clear();
}
