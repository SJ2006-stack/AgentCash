import { readFile } from "node:fs/promises";
import { getDeploymentEndpoints } from "./deployment.js";
import { LOCAL_REGISTRY_PATH } from "../wallet/paths.js";

export interface RegistryEntry {
  slug: string;
  name: string;
  description: string;
  url: string;
  estimatedUsdc: number;
  category: string;
}

/** Founder-curated placeholder entries for quote dry-run until live registry ships. */
export const PLACEHOLDER_REGISTRY: RegistryEntry[] = [
  {
    slug: "weather-local",
    name: "Local weather (x402 demo)",
    description: "x402 express example on localhost:4021",
    url: "http://localhost:4021/weather",
    estimatedUsdc: 0.01,
    category: "data",
  },
  {
    slug: "weather-base",
    name: "Base mainnet weather",
    description: "Public x402 weather API on Base",
    url: "https://weather.hugen.tokyo/weather/current",
    estimatedUsdc: 0.01,
    category: "data",
  },
  {
    slug: "agentcash-health",
    name: "AgentCash API health",
    description: "Health probe (free; placeholder for routing)",
    url: "https://api.agentcash.tech/v1/health",
    estimatedUsdc: 0,
    category: "platform",
  },
];

export async function loadRegistryEntries(): Promise<RegistryEntry[]> {
  try {
    const raw = await readFile(LOCAL_REGISTRY_PATH, "utf8");
    const parsed = JSON.parse(raw) as { entries?: RegistryEntry[] };
    if (Array.isArray(parsed.entries) && parsed.entries.length > 0) {
      return parsed.entries;
    }
  } catch {
    // fall through
  }

  const deployment = process.env.AGENTCASH_ENV;
  const { registryUrl } = getDeploymentEndpoints(deployment);

  try {
    const res = await fetch(registryUrl, {
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) {
      const data = (await res.json()) as { entries?: RegistryEntry[] };
      if (Array.isArray(data.entries) && data.entries.length > 0) {
        return data.entries;
      }
    }
  } catch {
    // offline / not deployed yet
  }

  return PLACEHOLDER_REGISTRY;
}

export function findRegistryEntry(
  entries: RegistryEntry[],
  slug: string,
): RegistryEntry | undefined {
  return entries.find((e) => e.slug === slug);
}

export function inferApiSlug(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/\./g, "-");
    const path = u.pathname.replace(/^\//, "").replace(/\//g, "-") || "root";
    return `${host}-${path}`.slice(0, 64);
  } catch {
    return "unknown-api";
  }
}
