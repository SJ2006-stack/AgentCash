import { loadAgentCashEnv } from "../../config/env.js";
import { createPaymentSigner } from "../../adapters/index.js";
import { formatUsdcFromAtomic, parseUsdcToAtomic } from "../../balance/usdc.js";
import { readNativeBalanceWei, formatEthFromWei } from "../../balance/eth.js";
import { ensureLocalWallet } from "../../wallet/local.js";
import { safeLog } from "../../util/log.js";
import { isTestnetCli } from "../context.js";

export interface FundWaitOptions {
  min?: string;
  timeout?: string;
  interval?: string;
}

export async function runFundWaitCommand(options: FundWaitOptions): Promise<void> {
  await ensureLocalWallet();
  const env = await loadAgentCashEnv({ testnet: isTestnetCli() });
  const adapter = await createPaymentSigner(env);

  if (adapter.status !== "implemented") {
    throw new Error(`Wallet mode "${adapter.mode}" is not available.`);
  }

  const minUsdc = Number(options.min ?? "0.01");
  const timeoutSec = Number(options.timeout ?? "300");
  const intervalSec = Number(options.interval ?? "5");
  const minAtomic = parseUsdcToAtomic(minUsdc);
  const deadline = Date.now() + timeoutSec * 1000;

  console.log(`Waiting for ≥ ${minUsdc} USDC on ${env.network.label}`);
  console.log(`Deposit address: ${adapter.address}\n`);

  while (Date.now() < deadline) {
    const usdc = await adapter.getUsdcBalanceAtomic();
    const eth = await readNativeBalanceWei(
      env.network,
      env.rpcUrl,
      adapter.address,
    );

    if (usdc !== null) {
      safeLog.log(`USDC: ${formatUsdcFromAtomic(usdc)}`);
    }
    if (eth !== null) {
      safeLog.log(`ETH:  ${formatEthFromWei(eth)}`);
    }

    if (usdc !== null && usdc >= minAtomic) {
      if (eth !== null && eth === 0n && usdc > 0n) {
        safeLog.warn(
          "\nWarning: USDC detected but ETH balance is 0. Some operations may need gas; x402 facilitator usually sponsors settlements.",
        );
      }
      console.log("\nFunding threshold met.");
      return;
    }

    if (usdc !== null && usdc > 0n && eth !== null && eth === 0n) {
      safeLog.warn(
        "Gas warning: USDC present but no ETH on this address.",
      );
    }

    await new Promise((r) => setTimeout(r, intervalSec * 1000));
  }

  throw new Error(`Timed out after ${timeoutSec}s waiting for USDC.`);
}
