import { access } from "node:fs/promises";
import { loadAgentCashEnv } from "../../config/env.js";
import { checkFacilitatorReachable } from "../../config/facilitator.js";
import { loadRegistryEntries } from "../../config/registry.js";
import { createPaymentSigner } from "../../adapters/index.js";
import { formatUsdcFromAtomic } from "../../balance/usdc.js";
import { readNativeBalanceWei, formatEthFromWei } from "../../balance/eth.js";
import { readLocalWalletKey } from "../../wallet/local.js";
import { LOCAL_REGISTRY_PATH, WALLET_KEY_PATH } from "../../wallet/paths.js";
import { isTestnetCli } from "../context.js";

export async function runDoctorCommand(): Promise<void> {
  const checks: { name: string; ok: boolean; detail: string }[] = [];

  const walletKey = await readLocalWalletKey();
  checks.push({
    name: "wallet",
    ok: walletKey !== null || Boolean(process.env.EVM_PRIVATE_KEY?.trim()),
    detail: walletKey
      ? `~/.agentcash/wallet.key present`
      : process.env.EVM_PRIVATE_KEY
        ? "EVM_PRIVATE_KEY set"
        : "missing — run: agentcash wallet create",
  });

  let env;
  try {
    env = await loadAgentCashEnv({ testnet: isTestnetCli() });
    checks.push({
      name: "config",
      ok: true,
      detail: `${env.network.label} | ${env.deployment} | facilitator ${env.facilitator.id}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    checks.push({ name: "config", ok: false, detail: message });
    printDoctor(checks);
    process.exitCode = 1;
    return;
  }

  if (!env.evmPrivateKey) {
    checks.push({
      name: "signer",
      ok: false,
      detail: "no key loaded — run: agentcash wallet create",
    });
    printDoctor(checks);
    process.exitCode = 1;
    return;
  }

  try {
    const adapter = await createPaymentSigner(env);
    const usdc = await adapter.getUsdcBalanceAtomic();
    const eth = await readNativeBalanceWei(
      env.network,
      env.rpcUrl,
      adapter.address,
    );

    checks.push({
      name: "rpc",
      ok: usdc !== null,
      detail: usdc !== null ? env.rpcUrl : `cannot read USDC at ${env.rpcUrl}`,
    });

    checks.push({
      name: "balances",
      ok: true,
      detail: `USDC ${usdc !== null ? formatUsdcFromAtomic(usdc) : "?"} | ETH ${eth !== null ? formatEthFromWei(eth) : "?"}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    checks.push({ name: "signer", ok: false, detail: message });
  }

  const facilitator = await checkFacilitatorReachable(env.facilitator);
  checks.push({
    name: "facilitator",
    ok: facilitator.ok,
    detail: facilitator.ok
      ? `${env.facilitator.url} (${facilitator.status ?? "ok"})`
      : facilitator.error ?? "unreachable",
  });

  try {
    await access(WALLET_KEY_PATH);
    const entries = await loadRegistryEntries();
    checks.push({
      name: "registry",
      ok: entries.length > 0,
      detail: `${entries.length} entries (remote or ${LOCAL_REGISTRY_PATH})`,
    });
  } catch {
    const entries = await loadRegistryEntries();
    checks.push({
      name: "registry",
      ok: entries.length > 0,
      detail: `${entries.length} placeholder entries`,
    });
  }

  printDoctor(checks);
  if (checks.some((c) => !c.ok)) {
    process.exitCode = 1;
  }
}

function printDoctor(
  checks: { name: string; ok: boolean; detail: string }[],
): void {
  console.log("AgentCash doctor\n");
  for (const c of checks) {
    const icon = c.ok ? "✓" : "✗";
    console.log(`${icon} ${c.name}: ${c.detail}`);
  }
}
