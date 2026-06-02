#!/usr/bin/env node
import { Command } from "commander";
import { runPayCommand } from "./cli/commands/pay.js";
import { runWalletInfoCommand } from "./cli/commands/wallet-info.js";
import { runWalletModesCommand } from "./cli/commands/wallet-modes.js";
import { runWalletCreateCommand } from "./cli/commands/wallet-create.js";
import { runWalletChainsCommand } from "./cli/commands/wallet-chains.js";
import { runFundWaitCommand } from "./cli/commands/fund-wait.js";
import { runQuoteCommand } from "./cli/commands/quote.js";
import { runDoctorCommand } from "./cli/commands/doctor.js";
import { runExportKeyCommand } from "./cli/commands/export-key.js";
import { runReceiptCommand } from "./cli/commands/receipt.js";
import { runReplayCommand } from "./cli/commands/replay.js";
import { runSessionRegisterCommand } from "./cli/commands/session-register.js";
import { setGlobalCliOptions } from "./cli/context.js";

const program = new Command();

program
  .name("agentcash")
  .description("AgentCash CLI — x402 USDC payments for AI agents")
  .version("0.1.0")
  .option("--testnet", "Use Base Sepolia instead of Base mainnet")
  .option("--agree-tos", "Accept AgentCash ToS stub without prompting")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts<{ testnet?: boolean; agreeTos?: boolean }>();
    setGlobalCliOptions({
      testnet: opts.testnet,
      agreeTos: opts.agreeTos,
    });
  });

function globalOpts(cmd: Command): { agreeTos?: boolean } {
  const root = cmd.optsWithGlobals<{ agreeTos?: boolean }>();
  return { agreeTos: root.agreeTos };
}

program
  .command("pay")
  .description("One x402 paid fetch; append receipt (no prompt/response logging)")
  .option("--url <url>", "Paid API URL (default: X402_DEMO_URL or network preset)")
  .option("--method <method>", "HTTP method", "GET")
  .action(async (opts: { url?: string; method?: string }, cmd: Command) => {
    await runPayCommand({ ...opts, ...globalOpts(cmd) });
  });

const wallet = program.command("wallet").description("Local agent wallet");

wallet
  .command("create")
  .description("Create ~/.agentcash/wallet.key (chmod 600) with backup warning")
  .option("--force", "Replace existing wallet")
  .action(async (opts: { force?: boolean }, cmd: Command) => {
    await runWalletCreateCommand({ force: opts.force, ...globalOpts(cmd) });
  });

wallet
  .command("info")
  .description("Show address, chain, facilitator, USDC balance")
  .action(async () => {
    await runWalletInfoCommand();
  });

wallet
  .command("chains")
  .description("List chains (Base default; Ethereum coming soon)")
  .action(() => {
    runWalletChainsCommand();
  });

wallet
  .command("modes")
  .description("List wallet modes (BYOK default; CDP optional)")
  .action(() => {
    runWalletModesCommand();
  });

const fund = program.command("fund").description("Funding helpers");

fund
  .command("wait")
  .description("Poll USDC balance until threshold or timeout")
  .option("--min <usdc>", "Minimum USDC balance", "0.01")
  .option("--timeout <sec>", "Timeout in seconds", "300")
  .option("--interval <sec>", "Poll interval in seconds", "5")
  .action(async (opts: { min?: string; timeout?: string; interval?: string }) => {
    await runFundWaitCommand(opts);
  });

program
  .command("quote")
  .description("Dry-run task quote from registry (no USDC spend)")
  .argument("<task>", "Task description")
  .option("--budget <usdc>", "Budget cap in USDC", "0.1")
  .action(async (task: string, opts: { budget?: string }) => {
    await runQuoteCommand({ task, budget: opts.budget });
  });

program
  .command("doctor")
  .description("Health check: wallet, RPC, facilitator, balances, registry")
  .action(async () => {
    await runDoctorCommand();
  });

program
  .command("export-key")
  .description("Export private key after confirmation phrase + countdown")
  .action(async () => {
    await runExportKeyCommand();
  });

program
  .command("receipt")
  .description("Show a payment receipt by id")
  .argument("<id>", "Receipt id (or prefix)")
  .action(async (id: string) => {
    await runReceiptCommand(id);
  });

program
  .command("replay")
  .description("Re-fetch API from receipt without re-paying")
  .requiredOption("--receipt <id>", "Receipt id")
  .option("--method <method>", "HTTP method override", "GET")
  .action(async (opts: { receipt: string; method?: string }) => {
    await runReplayCommand({ receiptId: opts.receipt, method: opts.method });
  });

const session = program.command("session").description("Session stubs (v0)");

session
  .command("register")
  .description("Write local session file (JWT auth stub)")
  .option("--label <label>", "Session label", "local-dev")
  .action(async (opts: { label?: string }) => {
    await runSessionRegisterCommand({ label: opts.label });
  });

await program.parseAsync(process.argv);
