import { getReceiptById } from "../../receipts/store.js";
import { scrubSecrets } from "../../util/scrub-secrets.js";
import { track } from "../../telemetry/posthog.js";

export interface ReplayOptions {
  receiptId: string;
  method?: string;
}

/** Re-fetch API from a prior receipt without re-paying (plain HTTP). */
export async function runReplayCommand(options: ReplayOptions): Promise<void> {
  const receipt = await getReceiptById(options.receiptId);
  if (!receipt) {
    throw new Error(`Receipt not found: ${options.receiptId}`);
  }

  const method = (options.method ?? "GET").toUpperCase();
  console.log(`Replay (no payment): ${method} ${receipt.api_url}\n`);

  const response = await fetch(receipt.api_url, { method });
  const bodyText = await response.text();

  let preview: string;
  try {
    preview = JSON.stringify(JSON.parse(bodyText), null, 2);
  } catch {
    preview =
      bodyText.length > 2000 ? `${bodyText.slice(0, 2000)}…` : bodyText;
  }

  console.log(`status: ${response.status} ${response.statusText}`);
  console.log("\n--- Body ---");
  console.log(scrubSecrets(preview));

  track({
    event: "replay",
    properties: { receipt_id: receipt.id, http_status: response.status },
  });

  if (!response.ok) {
    process.exitCode = 1;
  }
}
