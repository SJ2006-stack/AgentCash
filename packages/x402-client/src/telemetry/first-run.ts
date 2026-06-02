import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ensureAgentCashDir } from "../wallet/local.js";
import { STATE_PATH } from "../wallet/paths.js";
import { track } from "./posthog.js";

export interface AgentCashState {
  tosAcceptedAt?: string;
  telemetryDisclosedAt?: string;
  firstPayCompletedAt?: string;
}

async function readState(): Promise<AgentCashState> {
  try {
    const raw = await readFile(STATE_PATH, "utf8");
    return JSON.parse(raw) as AgentCashState;
  } catch {
    return {};
  }
}

async function writeState(patch: Partial<AgentCashState>): Promise<void> {
  await ensureAgentCashDir();
  const current = await readState();
  await writeFile(STATE_PATH, JSON.stringify({ ...current, ...patch }, null, 2), "utf8");
}

function printTelemetryDisclosure(): void {
  console.log(`
AgentCash CLI may send anonymous usage events (command names, success/failure)
when AGENTCASH_POSTHOG_KEY is configured. Prompts and API responses are never logged.

Opt out anytime: export AGENTCASH_NO_TELEMETRY=1
`);
}

const TOS_STUB = `
AgentCash Terms of Service (stub v0)
- You control your wallet; AgentCash is non-custodial.
- You are responsible for API compliance and spend limits.
- Full terms: https://agentcash.tech/terms (placeholder)
`;

export interface FirstRunOptions {
  agreeTos?: boolean;
  skipPrompt?: boolean;
}

export async function ensureFirstRunCompliance(
  options: FirstRunOptions = {},
): Promise<void> {
  const state = await readState();

  if (!state.telemetryDisclosedAt && process.env.AGENTCASH_NO_TELEMETRY !== "1") {
    printTelemetryDisclosure();
    await writeState({ telemetryDisclosedAt: new Date().toISOString() });
  }

  if (state.tosAcceptedAt) return;

  if (options.agreeTos) {
    await writeState({ tosAcceptedAt: new Date().toISOString() });
    track({ event: "tos_accepted", properties: { method: "flag" } });
    return;
  }

  if (options.skipPrompt) {
    throw new Error(
      "Terms not accepted. Re-run with --agree-tos or accept interactively.",
    );
  }

  console.log(TOS_STUB.trim());
  const rl = createInterface({ input, output });
  const answer = await rl.question("Accept AgentCash ToS stub? [y/N] ");
  rl.close();

  if (answer.trim().toLowerCase() !== "y") {
    throw new Error("ToS not accepted. Exiting.");
  }

  await writeState({ tosAcceptedAt: new Date().toISOString() });
  track({ event: "tos_accepted", properties: { method: "prompt" } });
}

export async function markFirstPayCompleted(): Promise<void> {
  const state = await readState();
  if (state.firstPayCompletedAt) return;
  await writeState({ firstPayCompletedAt: new Date().toISOString() });
}

export async function isFirstPay(): Promise<boolean> {
  const state = await readState();
  return !state.firstPayCompletedAt;
}

export function printFirstPayFundingHint(address: string, networkLabel: string): void {
  console.log(`
First payment — fund your agent wallet directly (no custodial deposit hop).

  Network:  ${networkLabel}
  Address:  ${address}

Send USDC on Base to this address. Gas for x402 settlements is typically
sponsored by the facilitator; keep a small ETH balance if direct on-chain txs fail.
`);
}
