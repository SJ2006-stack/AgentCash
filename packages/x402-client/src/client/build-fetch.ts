import { x402Client } from "@x402/core/client";
import { wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import type { PaymentSignerAdapter } from "../adapters/types.js";
import type { SettleResponse } from "@x402/core/types";

export interface PaidFetchBundle {
  fetchWithPayment: ReturnType<typeof wrapFetchWithPayment>;
  httpClient: x402HTTPClient;
  client: x402Client;
  adapter: PaymentSignerAdapter;
}

export function buildPaidFetch(adapter: PaymentSignerAdapter): PaidFetchBundle {
  const client = new x402Client();
  adapter.registerSchemes(client);
  const httpClient = new x402HTTPClient(client);
  const fetchWithPayment = wrapFetchWithPayment(fetch, httpClient);
  return { fetchWithPayment, httpClient, client, adapter };
}

export function extractSettlementReceipt(
  httpClient: x402HTTPClient,
  response: Response,
): SettleResponse | null {
  try {
    return httpClient.getPaymentSettleResponse((name) =>
      response.headers.get(name),
    );
  } catch {
    return null;
  }
}

export function collectPaymentHeaderHints(response: Response): Record<string, string> {
  const hints: Record<string, string> = {};
  for (const name of [
    "payment-response",
    "x-payment-response",
    "payment-settlement",
  ]) {
    const value = response.headers.get(name);
    if (value) {
      hints[name] = value.length > 120 ? `${value.slice(0, 120)}…` : value;
    }
  }
  return hints;
}
