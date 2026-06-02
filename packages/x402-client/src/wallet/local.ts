import { createHash } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { AGENTCASH_DIR, WALLET_KEY_PATH } from "./paths.js";

const KEY_MODE = 0o600;
const DIR_MODE = 0o700;

export interface LocalWalletInfo {
  privateKey: `0x${string}`;
  address: `0x${string}`;
  checksumSha256: string;
  created: boolean;
}

export async function ensureAgentCashDir(): Promise<void> {
  await mkdir(AGENTCASH_DIR, { recursive: true, mode: DIR_MODE });
}

export function sha256Hex(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export async function readLocalWalletKey(): Promise<`0x${string}` | null> {
  try {
    const raw = (await readFile(WALLET_KEY_PATH, "utf8")).trim();
    if (!raw) return null;
    return raw.startsWith("0x") ? (raw as `0x${string}`) : (`0x${raw}` as `0x${string}`);
  } catch {
    return null;
  }
}

export async function writeLocalWalletKey(privateKey: `0x${string}`): Promise<string> {
  await ensureAgentCashDir();
  const hex = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  await writeFile(WALLET_KEY_PATH, `${hex}\n`, { encoding: "utf8", mode: KEY_MODE });
  await chmod(WALLET_KEY_PATH, KEY_MODE);
  return sha256Hex(hex);
}

export async function createLocalWallet(force = false): Promise<LocalWalletInfo> {
  await ensureAgentCashDir();

  const existing = await readLocalWalletKey();
  if (existing && !force) {
    const account = privateKeyToAccount(existing);
    const hex = existing.startsWith("0x") ? existing.slice(2) : existing;
    return {
      privateKey: existing,
      address: account.address,
      checksumSha256: sha256Hex(hex),
      created: false,
    };
  }

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const hex = privateKey.slice(2);
  const checksumSha256 = await writeLocalWalletKey(privateKey);

  return {
    privateKey,
    address: account.address,
    checksumSha256,
    created: true,
  };
}

export async function ensureLocalWallet(): Promise<LocalWalletInfo> {
  const existing = await readLocalWalletKey();
  if (existing) {
    const account = privateKeyToAccount(existing);
    const hex = existing.startsWith("0x") ? existing.slice(2) : existing;
    return {
      privateKey: existing,
      address: account.address,
      checksumSha256: sha256Hex(hex),
      created: false,
    };
  }
  return createLocalWallet(false);
}

export function printWalletBackupWarning(checksumSha256: string, address: string): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  BACK UP YOUR WALLET KEY                                         ║
╠══════════════════════════════════════════════════════════════════╣
║  Private key file: ${WALLET_KEY_PATH}
║  chmod 600 — only your user can read this file.                  ║
║                                                                  ║
║  Copy wallet.key to offline storage. Anyone with this file       ║
║  controls your USDC on Base. AgentCash cannot recover it.        ║
║                                                                  ║
║  Key checksum (SHA256 of hex, no 0x): ${checksumSha256.slice(0, 32)}…
║  Deposit address (fund USDC here):  ${address}
╚══════════════════════════════════════════════════════════════════╝
`);
}
