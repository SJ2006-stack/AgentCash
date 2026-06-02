import { loadRegistryEntries } from "../../config/registry.js";
import { formatUsdcFromAtomic, parseUsdcToAtomic } from "../../balance/usdc.js";
import { track } from "../../telemetry/posthog.js";

export interface QuoteOptions {
  task: string;
  budget?: string;
}

export async function runQuoteCommand(options: QuoteOptions): Promise<void> {
  const task = options.task.trim();
  if (!task) {
    throw new Error("Task description required.");
  }

  const budget = options.budget ? Number(options.budget) : 0.1;
  const entries = await loadRegistryEntries();

  const planned = entries.slice(0, 3);
  let totalAtomic = 0n;

  console.log("AgentCash quote (dry-run — no USDC spent)\n");
  console.log(`Task:    ${task}`);
  console.log(`Budget:  ${budget} USDC (cap)\n`);
  console.log("Planned subtasks (from registry / placeholder):\n");

  for (let i = 0; i < planned.length; i++) {
    const entry = planned[i]!;
    totalAtomic += parseUsdcToAtomic(entry.estimatedUsdc);
    console.log(`  ${i + 1}. [${entry.slug}] ${entry.name}`);
    console.log(`     ~${entry.estimatedUsdc} USDC — ${entry.description}`);
  }

  const total = Number(formatUsdcFromAtomic(totalAtomic));
  console.log(`\nEstimated total: ~${total} USDC`);
  if (total > budget) {
    console.log("Warning: estimate exceeds budget cap.");
  }

  console.log("\n(dry-run stub — router synthesis not implemented in v0)");
  track({ event: "quote_dry_run", properties: { subtasks: planned.length } });
}
