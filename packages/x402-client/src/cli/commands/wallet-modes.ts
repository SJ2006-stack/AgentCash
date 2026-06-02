import { WALLET_MODE_DESCRIPTORS } from "../../adapters/index.js";

export function runWalletModesCommand(): void {
  console.log("AgentCash wallet modes\n");
  console.log(
    "Default: evm-private-key (~/.agentcash/wallet.key). CDP modes are opt-in.\n",
  );

  for (const mode of WALLET_MODE_DESCRIPTORS) {
    console.log(`${mode.mode} [${mode.status}]`);
    console.log(`  ${mode.label}`);
    console.log(`  ${mode.description}`);
    if (mode.requiredEnv.length > 0) {
      console.log(`  required: ${mode.requiredEnv.join(", ")}`);
    }
    if (mode.optionalEnv.length > 0) {
      console.log(`  optional: ${mode.optionalEnv.join(", ")}`);
    }
    console.log("");
  }

  console.log(
    "Set X402_WALLET_MODE=cdp-server to use Coinbase CDP (requires CDP_* env vars).",
  );
}
