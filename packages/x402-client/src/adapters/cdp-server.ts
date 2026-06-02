import { CdpClient } from "@coinbase/cdp-sdk";
import { toClientEvmSigner, type ClientEvmSigner } from "@x402/evm";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import type { x402Client } from "@x402/core/client";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { AgentCashEnv } from "../config/env.js";
import { readUsdcBalanceAtomic } from "../balance/usdc.js";
import type { PaymentSignerAdapter } from "./types.js";

export class CdpServerAdapter implements PaymentSignerAdapter {
  readonly mode = "cdp-server" as const;
  readonly status = "implemented" as const;
  readonly label = "Coinbase CDP server wallet";
  readonly network;
  readonly facilitator;
  readonly rpcUrl;
  readonly address: `0x${string}`;

  private readonly signer: ClientEvmSigner;

  private constructor(
    env: AgentCashEnv,
    address: `0x${string}`,
    signer: ClientEvmSigner,
  ) {
    this.network = env.network;
    this.facilitator = env.facilitator;
    this.rpcUrl = env.rpcUrl;
    this.address = address;
    this.signer = signer;
  }

  static async create(env: AgentCashEnv): Promise<CdpServerAdapter> {
    const { apiKeyId, apiKeySecret, walletSecret, walletName } = env.cdp;
    if (!apiKeyId || !apiKeySecret || !walletSecret) {
      throw new Error(
        "CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET are required for cdp-server.",
      );
    }

    const cdp = new CdpClient({
      apiKeyId,
      apiKeySecret,
      walletSecret,
    });

    const cdpAccount = await cdp.evm.getOrCreateAccount({ name: walletName });
    const chain =
      env.network.slug === "base-sepolia" ? baseSepolia : base;
    const publicClient = createPublicClient({
      chain,
      transport: http(env.rpcUrl),
    });

    const signer = toClientEvmSigner(
      {
        address: cdpAccount.address,
        signTypedData: (message) =>
          cdpAccount.signTypedData({
            domain: message.domain,
            types: message.types,
            primaryType: message.primaryType,
            message: message.message,
          }) as Promise<`0x${string}`>,
      },
      publicClient,
    );

    return new CdpServerAdapter(env, cdpAccount.address, signer);
  }

  registerSchemes(client: x402Client): void {
    registerExactEvmScheme(client, {
      signer: this.signer,
      schemeOptions: { rpcUrl: this.rpcUrl },
    });
  }

  async getUsdcBalanceAtomic(): Promise<bigint | null> {
    return readUsdcBalanceAtomic(this.network, this.rpcUrl, this.address);
  }
}
