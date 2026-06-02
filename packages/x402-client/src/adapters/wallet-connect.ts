import type { AgentCashEnv } from "../config/env.js";
import type { PaymentSignerAdapter } from "./types.js";
import type { x402Client } from "@x402/core/client";

/** WalletConnect signing — planned for AgentCash Day 5. */
export class WalletConnectAdapter implements PaymentSignerAdapter {
  readonly mode = "wallet-connect" as const;
  readonly status = "stub" as const;
  readonly label = "WalletConnect (coming Day 5)";
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
      "wallet-connect is not implemented yet (AgentCash Day 5). Set WALLET_CONNECT_PROJECT_ID when available.",
    );
  }

  async getUsdcBalanceAtomic(): Promise<bigint | null> {
    return null;
  }
}
