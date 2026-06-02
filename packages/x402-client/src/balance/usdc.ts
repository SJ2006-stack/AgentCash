import { createPublicClient, erc20Abi, http, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { NetworkConfig } from "../config/networks.js";

function chainForNetwork(network: NetworkConfig) {
  return network.slug === "base-sepolia" ? baseSepolia : base;
}

export async function readUsdcBalanceAtomic(
  network: NetworkConfig,
  rpcUrl: string,
  owner: Address,
): Promise<bigint | null> {
  try {
    const client = createPublicClient({
      chain: chainForNetwork(network),
      transport: http(rpcUrl),
    });
    return await client.readContract({
      address: network.usdcAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
    });
  } catch {
    return null;
  }
}

export function formatUsdcFromAtomic(amount: bigint): string {
  const whole = amount / 1_000_000n;
  const frac = amount % 1_000_000n;
  const fracStr = frac.toString().padStart(6, "0").replace(/0+$/, "");
  return fracStr.length > 0 ? `${whole}.${fracStr}` : whole.toString();
}

export function parseUsdcToAtomic(amount: number): bigint {
  return BigInt(Math.round(amount * 1_000_000));
}
