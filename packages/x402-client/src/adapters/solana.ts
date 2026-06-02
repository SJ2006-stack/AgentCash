import type { AgentCashEnv } from "../config/env.js";
import type { PaymentSignerAdapter } from "./types.js";
import type { x402Client } from "@x402/core/client";

/** Solana (SVM) payments — optional Day 1 stub; install @x402/svm to enable later. */
export class SolanaAdapter implements PaymentSignerAdapter {
  readonly mode = "solana" as const;
  readonly status = "stub" as const;
  readonly label = "Solana (SVM) — stub";
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
      "solana mode is not implemented in Day 1. Install @x402/svm and register ExactSvmScheme when adding Solana support.",
    );
  }

  async getUsdcBalanceAtomic(): Promise<bigint | null> {
    return null;
  }
}
