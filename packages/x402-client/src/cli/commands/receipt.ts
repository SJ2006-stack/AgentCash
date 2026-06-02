import { getReceiptById } from "../../receipts/store.js";
import { scrubSecretsDeep } from "../../util/scrub-secrets.js";

export async function runReceiptCommand(id: string): Promise<void> {
  const receipt = await getReceiptById(id);
  if (!receipt) {
    throw new Error(`Receipt not found: ${id}`);
  }

  console.log(JSON.stringify(scrubSecretsDeep(receipt), null, 2));
}
