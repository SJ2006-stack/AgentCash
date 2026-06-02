import type { SettleResponse } from "@x402/core/types";

export interface SettlementFields {
  tx_hash: string | null;
  x402_receipt_id: string | null;
  usdc_amount: string | null;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

export function extractSettlementFields(
  settlement: SettleResponse | null,
): SettlementFields {
  if (!settlement || typeof settlement !== "object") {
    return { tx_hash: null, x402_receipt_id: null, usdc_amount: null };
  }

  const s = settlement as Record<string, unknown>;
  const tx_hash = pickString(s, [
    "transaction",
    "txHash",
    "transactionHash",
    "tx_hash",
  ]);
  const x402_receipt_id = pickString(s, [
    "receiptId",
    "receipt_id",
    "id",
    "paymentId",
  ]);
  const usdc_amount = pickString(s, ["amount", "usdcAmount", "value"]);

  return { tx_hash, x402_receipt_id, usdc_amount };
}
