import { privateKeyToAccount } from "viem/accounts";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import type { x402Client } from "@x402/core/client";
import type { AgentCashEnv } from "../config/env.js";
import {
  formatUsdcFromAtomic,
  parseUsdcToAtomic,
  readUsdcBalanceAtomic,
} from "../balance/usdc.js";
import type { PaymentSignerAdapter } from "./types.js";

export class EvmPrivateKeyAdapter implements PaymentSignerAdapter {
  readonly mode = "evm-private-key" as const;
  readonly status = "implemented" as const;
  readonly label = "EVM private key (viem)";
  readonly network;
  readonly facilitator;
  readonly rpcUrl;
  readonly address: `0x${string}`;

  private readonly account;

  constructor(private readonly env: AgentCashEnv) {
    if (!env.evmPrivateKey) {
      throw new Error(
        "No EVM key configured. Run: agentcash wallet create (or set EVM_PRIVATE_KEY).",
      );
    }
    this.network = env.network;
    this.facilitator = env.facilitator;
    this.rpcUrl = env.rpcUrl;
    this.account = privateKeyToAccount(env.evmPrivateKey);
    this.address = this.account.address;
  }

  registerSchemes(client: x402Client): void {
    registerExactEvmScheme(client, {
      signer: this.account,
      schemeOptions: { rpcUrl: this.rpcUrl },
    });
  }

  async getUsdcBalanceAtomic(): Promise<bigint | null> {
    return readUsdcBalanceAtomic(this.network, this.rpcUrl, this.address);
  }
}

export async function assertMinimumUsdcBalance(
  adapter: PaymentSignerAdapter,
  minUsdc?: number,
): Promise<void> {
  if (minUsdc === undefined || minUsdc <= 0) return;

  const balance = await adapter.getUsdcBalanceAtomic();
  if (balance === null) {
    console.warn("Could not read USDC balance; skipping minimum balance check.");
    return;
  }

  const minAtomic = parseUsdcToAtomic(minUsdc);
  if (balance < minAtomic) {
    throw new Error(
      `USDC balance ${formatUsdcFromAtomic(balance)} is below MIN_USDC_BALANCE=${minUsdc}. Fund via Circle faucet (testnet) or your exchange (mainnet).`,
    );
  }
}
