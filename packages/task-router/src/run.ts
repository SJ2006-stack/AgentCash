import { buildPlan } from "./plan.js";
import { createBudgetState, checkBudget, recordSpend } from "./budget.js";
import { executeSubtask } from "./execute-subtask.js";
import { synthesizeResults } from "./synthesis.js";
import type { RunResult } from "./types.js";

export interface RunOptions {
  /** Dry-run: plan only, no x402 payments. */
  dryRun?: boolean;
}

/**
 * Execute subtasks **sequentially** (v0: no parallel x402).
 * Integrates x402-client for paid fetches when not dry-run.
 */
export async function run(
  task: string,
  budgetUsdc: number,
  options: RunOptions = {},
): Promise<RunResult> {
  const { dryRun = false } = options;
  const plan = await buildPlan(task);
  const budget = createBudgetState(budgetUsdc);
  const budgetWarnings: string[] = [];
  const subtaskResults = [];

  for (const subtask of plan.subtasks) {
    const warn = checkBudget(budget, subtask.estimatedUsdc);
    if (warn) budgetWarnings.push(warn);

    const result = await executeSubtask(subtask.entry, { pay: !dryRun });
    recordSpend(budget, result.costUsdc);
    subtaskResults.push(result);

    if (!result.ok && !dryRun) {
      break;
    }
  }

  const totalUsdc = subtaskResults.reduce((s, r) => s + r.costUsdc, 0);
  const synthesis = synthesizeResults(task, subtaskResults, totalUsdc);

  return {
    task,
    budgetUsdc,
    subtaskResults,
    totalUsdc,
    synthesis,
    budgetWarnings,
  };
}

export function formatRun(result: RunResult): string {
  const parts = [
    `AgentCash run complete`,
    `Task: ${result.task}`,
    `Budget: $${result.budgetUsdc.toFixed(2)} | Spent: $${result.totalUsdc.toFixed(4)}`,
  ];
  if (result.budgetWarnings.length > 0) {
    parts.push("", "Warnings:", ...result.budgetWarnings.map((w) => `  - ${w}`));
  }
  parts.push("", result.synthesis);
  return parts.join("\n");
}

export type { SubtaskResult } from "./types.js";
