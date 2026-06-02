import type { AgentCashEnv } from "../config/env.js";
import { CdpEmbeddedAdapter } from "./cdp-embedded.js";
import { CdpServerAdapter } from "./cdp-server.js";
import { EvmPrivateKeyAdapter } from "./evm-private-key.js";
import { SolanaAdapter } from "./solana.js";
import type {
  PaymentSignerAdapter,
  WalletMode,
  WalletModeDescriptor,
} from "./types.js";
import { WalletConnectAdapter } from "./wallet-connect.js";
export const WALLET_MODE_DESCRIPTORS: WalletModeDescriptor[] = [
  {
    mode: "evm-private-key",
    status: "implemented",
    label: "Local EVM wallet (default)",
    description:
      "BYOK: ~/.agentcash/wallet.key (chmod 600) or EVM_PRIVATE_KEY override.",
    requiredEnv: [],
    optionalEnv: [
      "EVM_PRIVATE_KEY",
      "X402_NETWORK",
      "RPC_URL",
      "ALCHEMY_KEY",
      "X402_FACILITATOR",
      "X402_FACILITATOR_URL",
    ],
  },
  {
    mode: "cdp-server",
    status: "implemented",
    label: "CDP server wallet (optional)",
    description:
      "Coinbase CDP programmatic wallet. Opt-in via X402_WALLET_MODE=cdp-server.",
    requiredEnv: [
      "CDP_API_KEY_ID",
      "CDP_API_KEY_SECRET",
      "CDP_WALLET_SECRET",
    ],
    optionalEnv: ["CDP_WALLET_NAME", "X402_NETWORK", "RPC_URL", "X402_FACILITATOR"],
  },
  {
    mode: "cdp-embedded",
    status: "stub",
    label: "CDP embedded wallet",
    description:
      "Browser-only embedded wallet + useX402. Node CLI throws with setup instructions.",
    requiredEnv: [],
    optionalEnv: [],
  },
  {
    mode: "wallet-connect",
    status: "stub",
    label: "WalletConnect",
    description: "Connect MetaMask / mobile wallets (future).",
    requiredEnv: [],
    optionalEnv: ["WALLET_CONNECT_PROJECT_ID"],
  },
  {
    mode: "solana",
    status: "stub",
    label: "Solana (SVM)",
    description: "Not in v0 — Solana USDC via @x402/svm (future).",
    requiredEnv: [],
    optionalEnv: ["SVM_PRIVATE_KEY"],
  },
];

function detectWalletMode(env: AgentCashEnv): WalletMode {
  if (env.walletMode) {
    return env.walletMode;
  }

  return "evm-private-key";
}

export async function createPaymentSigner(
  env: AgentCashEnv,
  modeOverride?: WalletMode,
): Promise<PaymentSignerAdapter> {
  const mode = modeOverride ?? detectWalletMode(env);

  switch (mode) {
    case "evm-private-key":
      return new EvmPrivateKeyAdapter(env);
    case "cdp-server":
      return await CdpServerAdapter.create(env);
    case "cdp-embedded":
      return new CdpEmbeddedAdapter(env);
    case "wallet-connect":
      return new WalletConnectAdapter(env);
    case "solana":
      return new SolanaAdapter(env);
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown wallet mode: ${_exhaustive}`);
    }
  }
}

export type { PaymentSignerAdapter, WalletMode, WalletModeDescriptor } from "./types.js";
