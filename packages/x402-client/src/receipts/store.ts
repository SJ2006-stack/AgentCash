import { appendFile, mkdir, readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { ensureAgentCashDir } from "../wallet/local.js";
import { RECEIPTS_PATH } from "../wallet/paths.js";

export interface PaymentReceipt {
  id: string;
  wallet_address: string;
  tx_hash: string | null;
  x402_receipt_id: string | null;
  api_slug: string;
  api_url: string;
  usdc_amount: string | null;
  timestamp: string;
  http_status: number;
  error_code: string | null;
}

export type ReceiptInput = Omit<PaymentReceipt, "id" | "timestamp"> & {
  id?: string;
  timestamp?: string;
};

export async function appendReceipt(input: ReceiptInput): Promise<PaymentReceipt> {
  await ensureAgentCashDir();
  const receipt: PaymentReceipt = {
    id: input.id ?? randomUUID(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    wallet_address: input.wallet_address,
    tx_hash: input.tx_hash,
    x402_receipt_id: input.x402_receipt_id,
    api_slug: input.api_slug,
    api_url: input.api_url,
    usdc_amount: input.usdc_amount,
    http_status: input.http_status,
    error_code: input.error_code,
  };

  await appendFile(RECEIPTS_PATH, `${JSON.stringify(receipt)}\n`, "utf8");
  return receipt;
}

export async function listReceipts(): Promise<PaymentReceipt[]> {
  try {
    const raw = await readFile(RECEIPTS_PATH, "utf8");
    return raw
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as PaymentReceipt);
  } catch {
    return [];
  }
}

export async function getReceiptById(id: string): Promise<PaymentReceipt | null> {
  const all = await listReceipts();
  return all.find((r) => r.id === id || r.id.startsWith(id)) ?? null;
}
