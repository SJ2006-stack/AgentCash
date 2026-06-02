import { getChainCatalog } from "../../config/networks.js";
import { isTestnetCli } from "../context.js";

export function runWalletChainsCommand(): void {
  const testnet = isTestnetCli();
  const chains = getChainCatalog(testnet);

  console.log("AgentCash supported chains\n");
  console.log(
    testnet
      ? "Active network: Base Sepolia (--testnet)\n"
      : "Active network: Base mainnet (default)\n",
  );

  for (const chain of chains) {
    const statusLabel =
      chain.status === "active"
        ? "ready"
        : chain.status === "testnet"
          ? "testnet"
          : chain.status === "coming-soon"
            ? "coming soon"
            : "not in v0";
    const defaultMark = chain.isDefault ? " (default)" : "";
    console.log(`${chain.logo}  ${chain.label}${defaultMark}`);
    console.log(`       ${statusLabel}`);
    console.log("");
  }
}
