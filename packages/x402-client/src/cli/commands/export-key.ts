import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readLocalWalletKey } from "../../wallet/local.js";
import { WALLET_KEY_PATH } from "../../wallet/paths.js";

const CONFIRM_PHRASE = "export my key";

export async function runExportKeyCommand(): Promise<void> {
  const key = await readLocalWalletKey();
  if (!key && !process.env.EVM_PRIVATE_KEY?.trim()) {
    throw new Error("No local wallet. Run: agentcash wallet create");
  }

  const rl = createInterface({ input, output });
  const typed = await rl.question(
    `Type "${CONFIRM_PHRASE}" to export your private key: `,
  );
  rl.close();

  if (typed.trim() !== CONFIRM_PHRASE) {
    throw new Error("Confirmation phrase did not match. Export cancelled.");
  }

  console.log("\nExporting in:");
  for (let i = 5; i >= 1; i--) {
    console.log(`  ${i}…`);
    await new Promise((r) => setTimeout(r, 1000));
  }

  const exported = key ?? process.env.EVM_PRIVATE_KEY!.trim();
  const normalized = exported.startsWith("0x") ? exported : `0x${exported}`;

  console.log(`\nPrivate key (from ${key ? WALLET_KEY_PATH : "EVM_PRIVATE_KEY"}):`);
  console.log(normalized);
  console.log(
    "\nNever share this key. Clear your terminal scrollback after copying.",
  );
}
