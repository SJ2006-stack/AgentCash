export type FacilitatorId = "cdp" | "x402org" | "custom";

export interface FacilitatorConfig {
  id: FacilitatorId;
  label: string;
  url: string;
  networks: string[];
  requiresCdpKeys: boolean;
  productionReady: boolean;
}

const FACILITATORS: Record<Exclude<FacilitatorId, "custom">, FacilitatorConfig> = {
  cdp: {
    id: "cdp",
    label: "Coinbase x402 (CDP)",
    url: "https://api.cdp.coinbase.com/platform/v2/x402",
    networks: [
      "eip155:8453",
      "eip155:84532",
      "eip155:137",
      "eip155:42161",
    ],
    requiresCdpKeys: false,
    productionReady: true,
  },
  x402org: {
    id: "x402org",
    label: "x402.org (testnet)",
    url: "https://x402.org/facilitator",
    networks: ["eip155:84532"],
    requiresCdpKeys: false,
    productionReady: false,
  },
};

export function parseFacilitatorId(raw?: string): Exclude<FacilitatorId, "custom"> {
  const value = (raw ?? "cdp").trim().toLowerCase();
  if (value === "cdp" || value === "x402org") {
    return value;
  }
  throw new Error(`Invalid X402_FACILITATOR "${raw}". Use cdp or x402org.`);
}

export function getFacilitatorConfig(
  id?: string,
  urlOverride?: string,
): FacilitatorConfig {
  const customUrl = urlOverride?.trim() || process.env.X402_FACILITATOR_URL?.trim();
  if (customUrl) {
    return {
      id: "custom",
      label: "Custom facilitator",
      url: customUrl,
      networks: ["eip155:8453", "eip155:84532"],
      requiresCdpKeys: false,
      productionReady: true,
    };
  }

  return FACILITATORS[parseFacilitatorId(id)];
}

export function facilitatorHintForNetwork(
  facilitator: FacilitatorConfig,
  networkCaip2: string,
): string | null {
  if (facilitator.networks.includes(networkCaip2)) {
    return null;
  }
  return `Facilitator "${facilitator.id}" may not support ${networkCaip2}. Sellers choose the facilitator; ensure your target API uses a compatible one.`;
}

export async function checkFacilitatorReachable(
  facilitator: FacilitatorConfig,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(facilitator.url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8_000),
    });
    return { ok: res.ok || res.status < 500, status: res.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
