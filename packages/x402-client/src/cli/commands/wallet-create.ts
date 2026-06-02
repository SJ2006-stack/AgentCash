import { ensureFirstRunCompliance } from "../../telemetry/first-run.js";
import { track } from "../../telemetry/posthog.js";
import {
  createLocalWallet,
  printWalletBackupWarning,
} from "../../wallet/local.js";
import type { GlobalCliOptions } from "../context.js";

export interface WalletCreateOptions extends GlobalCliOptions {
  force?: boolean;
}

export async function runWalletCreateCommand(
  options: WalletCreateOptions = {},
): Promise<void> {
  await ensureFirstRunCompliance({
    agreeTos: options.agreeTos,
    skipPrompt: false,
  });

  const wallet = await createLocalWallet(options.force === true);

  if (wallet.created) {
    printWalletBackupWarning(wallet.checksumSha256, wallet.address);
    track({ event: "wallet_created" });
    console.log("Wallet created.\n");
  } else if (options.force) {
    printWalletBackupWarning(wallet.checksumSha256, wallet.address);
    console.log("Wallet replaced.\n");
  } else {
    console.log("Wallet already exists (use --force to replace).\n");
  }

  console.log(`address:   ${wallet.address}`);
  console.log(`checksum:  ${wallet.checksumSha256}`);
  console.log(`deposit:   Send USDC on Base to this address (no custodial hop).`);
}
