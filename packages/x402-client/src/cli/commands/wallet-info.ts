import { loadAgentCashEnv } from "../../config/env.js";
import { facilitatorHintForNetwork } from "../../config/facilitator.js";
import { createPaymentSigner } from "../../adapters/index.js";
import { formatUsdcFromAtomic } from "../../balance/usdc.js";
import { isTestnetCli } from "../context.js";
import { ensureLocalWallet } from "../../wallet/local.js";
import { WALLET_KEY_PATH } from "../../wallet/paths.js";

export async function runWalletInfoCommand(): Promise<void> {
  await ensureLocalWallet();
  const env = await loadAgentCashEnv({ testnet: isTestnetCli() });
  const adapter = await createPaymentSigner(env);

  console.log("AgentCash wallet\n");
  console.log(`mode:          ${adapter.mode} (${adapter.status})`);
  console.log(`label:         ${adapter.label}`);

  if (adapter.status === "implemented") {
    console.log(`address:       ${adapter.address}`);
    console.log(`deposit:       ${adapter.address} (direct — no custodial hop)`);
    const balance = await adapter.getUsdcBalanceAtomic();
    if (balance !== null) {
      console.log(
        `usdcBalance:   ${formatUsdcFromAtomic(balance)} USDC on ${env.network.label}`,
      );
      console.log(`usdcContract:  ${env.network.usdcAddress}`);
    } else {
      console.log("usdcBalance:   (could not read — check RPC_URL)");
    }
  } else {
    console.log("address:       (not available — stub mode)");
  }

  if (env.localWalletPath) {
    console.log(`keyFile:       ${WALLET_KEY_PATH}`);
  } else if (env.evmPrivateKey) {
    console.log("keySource:     EVM_PRIVATE_KEY env override");
  }

  console.log(`network:       ${env.network.caip2} (${env.network.label})`);
  console.log(`chainId:       ${env.network.chainId}`);
  console.log(`rpcUrl:        ${env.rpcUrl}`);
  console.log(`facilitator:   ${env.facilitator.label}`);
  console.log(`facilitatorUrl:${env.facilitator.url}`);
  console.log(`environment:   ${env.deployment}`);

  const hint = facilitatorHintForNetwork(env.facilitator, env.network.caip2);
  if (hint) {
    console.log(`\n${hint}`);
  }

  if (env.minUsdcBalance !== undefined) {
    console.log(`\nminUsdcCheck:  ${env.minUsdcBalance} USDC (MIN_USDC_BALANCE)`);
  }
}
