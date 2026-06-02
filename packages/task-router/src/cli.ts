#!/usr/bin/env node
import { Command } from "commander";
import { quote, formatQuote } from "./quote.js";
import { run, formatRun } from "./run.js";

const program = new Command();

program
  .name("agentcash")
  .description("AgentCash v0 — quote and run x402-routed tasks")
  .version("0.1.0");

program
  .command("quote")
  .description("Dry-run plan and estimated USDC (no payments)")
  .argument("<task>", "Natural-language task")
  .requiredOption("--budget <usdc>", "Budget cap in USDC", parseFloat)
  .action(async (task: string, opts: { budget: number }) => {
    const result = await quote(task, opts.budget);
    console.log(formatQuote(result));
    if (!result.withinBudget) process.exitCode = 1;
  });

program
  .command("run")
  .description("Execute plan with sequential x402 payments")
  .argument("<task>", "Natural-language task")
  .requiredOption("--budget <usdc>", "Budget cap in USDC", parseFloat)
  .option("--dry-run", "Plan only; skip on-chain payment")
  .action(async (task: string, opts: { budget: number; dryRun?: boolean }) => {
    const result = await run(task, opts.budget, { dryRun: opts.dryRun });
    console.log(formatRun(result));
    const failed = result.subtaskResults.some((r) => !r.ok);
    if (failed) process.exitCode = 1;
  });

await program.parseAsync(process.argv);
