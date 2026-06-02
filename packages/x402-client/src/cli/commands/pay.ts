import { loadAgentCashEnv } from "../../config/env.js";
import { demoUrlWarning } from "../../config/networks.js";
import { facilitatorHintForNetwork } from "../../config/facilitator.js";
import { inferApiSlug } from "../../config/registry.js";
import { createPaymentSigner } from "../../adapters/index.js";
import { assertMinimumUsdcBalance } from "../../adapters/evm-private-key.js";
import {
  buildPaidFetch,
  collectPaymentHeaderHints,
  extractSettlementReceipt,
} from "../../client/build-fetch.js";
import { extractSettlementFields } from "../../client/settlement.js";
import { formatUsdcFromAtomic } from "../../balance/usdc.js";
import { appendReceipt } from "../../receipts/store.js";
import {
  ensureFirstRunCompliance,
  isFirstPay,
  markFirstPayCompleted,
  printFirstPayFundingHint,
} from "../../telemetry/first-run.js";
import { track } from "../../telemetry/posthog.js";
import { scrubSecrets } from "../../util/scrub-secrets.js";
import { safeLog } from "../../util/log.js";
import { ensureLocalWallet } from "../../wallet/local.js";
import { isTestnetCli } from "../context.js";
import type { GlobalCliOptions } from "../context.js";

export interface PayCommandOptions extends GlobalCliOptions {
  url?: string;
  method?: string;
}

export async function runPayCommand(
  options: PayCommandOptions,
): Promise<void> {
  await ensureFirstRunCompliance({
    agreeTos: options.agreeTos,
    skipPrompt: false,
  });

  await ensureLocalWallet();
  const env = await loadAgentCashEnv({ testnet: isTestnetCli() });
  const url = options.url?.trim() || env.demoUrl;
  const method = (options.method ?? "GET").toUpperCase();

  const warning = demoUrlWarning(env.network, url);
  if (warning) {
    safeLog.warn(`Note: ${scrubSecrets(warning)}\n`);
  }

  const facilitatorHint = facilitatorHintForNetwork(
    env.facilitator,
    env.network.caip2,
  );
  if (facilitatorHint) {
    safeLog.warn(`${scrubSecrets(facilitatorHint)}\n`);
  }

  const adapter = await createPaymentSigner(env);
  if (adapter.status === "stub") {
    throw new Error(`Wallet mode "${adapter.mode}" is not available in the CLI.`);
  }

  if (await isFirstPay()) {
    printFirstPayFundingHint(adapter.address, env.network.label);
  }

  await assertMinimumUsdcBalance(adapter, env.minUsdcBalance);

  const balance = await adapter.getUsdcBalanceAtomic();
  if (balance !== null) {
    safeLog.log(
      `USDC balance: ${formatUsdcFromAtomic(balance)} (${env.network.label})\n`,
    );
  }

  const { fetchWithPayment, httpClient, adapter: signer } =
    buildPaidFetch(adapter);

  safeLog.log(`Paying ${method} ${url}`);
  safeLog.log(
    `Wallet: ${signer.address} | ${env.network.caip2} | facilitator ${env.facilitator.id}\n`,
  );

  const started = performance.now();
  let response: Response;
  let errorCode: string | null = null;

  try {
    response = await fetchWithPayment(url, { method });
  } catch (err) {
    errorCode = err instanceof Error ? err.name : "fetch_error";
    await appendReceipt({
      wallet_address: signer.address,
      tx_hash: null,
      x402_receipt_id: null,
      api_slug: inferApiSlug(url),
      api_url: url,
      usdc_amount: null,
      http_status: 0,
      error_code: errorCode,
    });
    throw err;
  }

  const durationMs = Math.round(performance.now() - started);
  const bodyText = await response.text();

  let bodyPreview: string;
  try {
    bodyPreview = JSON.stringify(JSON.parse(bodyText), null, 2);
  } catch {
    bodyPreview =
      bodyText.length > 2000 ? `${bodyText.slice(0, 2000)}…` : bodyText;
  }

  const settlement = response.ok
    ? extractSettlementReceipt(httpClient, response)
    : null;
  const fields = extractSettlementFields(settlement);
  const headerHints = collectPaymentHeaderHints(response);

  if (!response.ok) {
    errorCode = `http_${response.status}`;
  }

  const receipt = await appendReceipt({
    wallet_address: signer.address,
    tx_hash: fields.tx_hash,
    x402_receipt_id: fields.x402_receipt_id,
    api_slug: inferApiSlug(url),
    api_url: url,
    usdc_amount: fields.usdc_amount,
    http_status: response.status,
    error_code: errorCode,
  });

  console.log("--- Receipt ---");
  console.log(`id:            ${receipt.id}`);
  console.log(`status:        ${response.status} ${response.statusText}`);
  console.log(`durationMs:    ${durationMs}`);
  console.log(`network:       ${env.network.caip2} (${env.network.label})`);
  console.log(`address:       ${signer.address}`);
  console.log(`facilitator:   ${env.facilitator.url} (${env.facilitator.id})`);

  if (Object.keys(headerHints).length > 0) {
    console.log("paymentHeaders:", JSON.stringify(headerHints, null, 2));
  }

  if (settlement) {
    console.log("settlement:", JSON.stringify(settlement, null, 2));
  } else if (response.ok) {
    console.log(
      "settlement:    (no PAYMENT-RESPONSE header — seller may use direct settlement)",
    );
  }

  console.log("\n--- Body ---");
  console.log(scrubSecrets(bodyPreview));

  if (response.ok) {
    await markFirstPayCompleted();
    track({ event: "pay_success", properties: { network: env.network.slug } });
  } else {
    track({ event: "pay_failure", properties: { status: response.status } });
    process.exitCode = 1;
  }
}
