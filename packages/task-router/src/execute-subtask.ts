import { AGENTCASH_REFERER } from "@agentcash/registry";
import type { RegistryEntry } from "@agentcash/registry";
import {
  buildPaidFetch,
  extractSettlementReceipt,
  loadAgentCashEnv,
} from "@agentcash/x402-client";
import { createPaymentSigner } from "@agentcash/x402-client";
import type { SubtaskResult } from "./types.js";

export interface ExecuteOptions {
  /** When false, skip on-chain payment (dry-run / quote-only paths). */
  pay?: boolean;
}

/** Run one registry subtask sequentially (x402 pay when enabled). */
export async function executeSubtask(
  entry: RegistryEntry,
  options: ExecuteOptions = {},
): Promise<SubtaskResult> {
  const { pay = true } = options;
  const endpoint = entry.endpoint;

  if (!pay) {
    return {
      slug: entry.slug,
      endpoint,
      ok: true,
      httpStatus: 0,
      summary: `[dry-run] would call ${entry.name}`,
      costUsdc: entry.price_usdc,
    };
  }

  if (entry.status === "coming_soon") {
    return {
      slug: entry.slug,
      endpoint,
      ok: false,
      httpStatus: 0,
      summary: `${entry.slug} is coming_soon`,
      costUsdc: 0,
      error: "coming_soon",
    };
  }

  try {
    const env = await loadAgentCashEnv();
    const adapter = await createPaymentSigner(env);
    if (adapter.status === "stub") {
      throw new Error(`Wallet mode "${adapter.mode}" is not available.`);
    }

    const { fetchWithPayment, httpClient } = buildPaidFetch(adapter);
    const response = await fetchWithPayment(endpoint, {
      method: "GET",
      headers: { Referer: AGENTCASH_REFERER },
    });

    const bodyText = await response.text();
    const bodyPreview =
      bodyText.length > 400 ? `${bodyText.slice(0, 400)}…` : bodyText;

    const settlement = response.ok
      ? extractSettlementReceipt(httpClient, response)
      : null;

    let costUsdc = entry.price_usdc;
    if (settlement && "amount" in settlement) {
      const raw = Number((settlement as { amount?: string }).amount);
      if (!Number.isNaN(raw) && raw > 0) {
        costUsdc = raw > 1_000_000 ? raw / 1_000_000 : raw;
      }
    }

    return {
      slug: entry.slug,
      endpoint,
      ok: response.ok,
      httpStatus: response.status,
      summary: response.ok
        ? `Paid ${entry.name} (${response.status})`
        : `HTTP ${response.status} from ${entry.name}`,
      costUsdc,
      bodyPreview,
      error: response.ok ? undefined : bodyPreview,
    };
  } catch (err) {
    return {
      slug: entry.slug,
      endpoint,
      ok: false,
      httpStatus: 0,
      summary: `Payment failed for ${entry.slug}`,
      costUsdc: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
