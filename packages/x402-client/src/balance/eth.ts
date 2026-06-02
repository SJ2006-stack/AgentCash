import { createPublicClient, formatEther, http, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { NetworkConfig } from "../config/networks.js";

function chainForNetwork(network: NetworkConfig) {
  return network.slug === "base-sepolia" ? baseSepolia : base;
}

export async function readNativeBalanceWei(
  network: NetworkConfig,
  rpcUrl: string,
  owner: Address,
): Promise<bigint | null> {
  try {
    const client = createPublicClient({
      chain: chainForNetwork(network),
      transport: http(rpcUrl),
    });
    return await client.getBalance({ address: owner });
  } catch {
    return null;
  }
}

export function formatEthFromWei(wei: bigint): string {
  return formatEther(wei);
}
