import type { AgentCashEnv } from "../config/env.js";
import type { PaymentSignerAdapter } from "./types.js";
import type { x402Client } from "@x402/core/client";

/**
 * CDP Embedded Wallets are browser-first (React hook `useX402`).
 * Node CLI cannot sign with embedded wallets without a user session.
 *
 * @see https://docs.cdp.coinbase.com/x402/quickstart-for-buyers
 */
export class CdpEmbeddedAdapter implements PaymentSignerAdapter {
  readonly mode = "cdp-embedded" as const;
  readonly status = "stub" as const;
  readonly label = "CDP embedded wallet (browser)";
  readonly network;
  readonly facilitator;
  readonly rpcUrl;
  readonly address: `0x${string}`;

  constructor(env: AgentCashEnv) {
    this.network = env.network;
    this.facilitator = env.facilitator;
    this.rpcUrl = env.rpcUrl;
    this.address = "0x0000000000000000000000000000000000000000";
  }

  registerSchemes(_client: x402Client): void {
    throw new Error(
      "cdp-embedded is not available in the Node CLI. Use a web app with CDP Embedded Wallets and the useX402 hook. See packages/x402-client/README.md#cdp-embedded-wallet.",
    );
  }

  async getUsdcBalanceAtomic(): Promise<bigint | null> {
    return null;
  }
}
