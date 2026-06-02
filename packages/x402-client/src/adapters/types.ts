import type { x402Client } from "@x402/core/client";
import type { NetworkConfig } from "../config/networks.js";
import type { FacilitatorConfig } from "../config/facilitator.js";

export type WalletMode =
  | "evm-private-key"
  | "cdp-server"
  | "cdp-embedded"
  | "wallet-connect"
  | "solana";

export type WalletModeStatus = "implemented" | "stub";

export interface WalletModeDescriptor {
  mode: WalletMode;
  status: WalletModeStatus;
  label: string;
  description: string;
  requiredEnv: string[];
  optionalEnv: string[];
}

/** Pluggable wallet backend that registers x402 payment schemes on a client. */
export interface PaymentSignerAdapter {
  readonly mode: WalletMode;
  readonly status: WalletModeStatus;
  readonly label: string;
  readonly network: NetworkConfig;
  readonly facilitator: FacilitatorConfig;
  readonly address: `0x${string}`;
  readonly rpcUrl: string;

  /** Register EVM exact (and future) schemes on an x402 client. */
  registerSchemes(client: x402Client): void;

  /** USDC balance in 6-decimal atomic units, or null if unreadable. */
  getUsdcBalanceAtomic(): Promise<bigint | null>;
}
