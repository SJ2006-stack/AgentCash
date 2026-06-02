import { buildPlan, type TaskPlan } from "./plan.js";
import type { QuoteResult } from "./types.js";

export async function quote(
  task: string,
  budgetUsdc: number,
): Promise<QuoteResult> {
  const plan = await buildPlan(task);
  return {
    task,
    budgetUsdc,
    plan,
    withinBudget: plan.estimatedTotalUsdc <= budgetUsdc,
  };
}

export function formatQuote(result: QuoteResult): string {
  const lines = result.plan.subtasks.map(
    (s, i) =>
      `  ${i + 1}. ${s.slug} (~$${s.estimatedUsdc.toFixed(4)}) — ${s.reason}`,
  );
  return [
    `AgentCash quote (source: ${result.plan.source})`,
    `Task: ${result.task}`,
    `Budget: $${result.budgetUsdc.toFixed(2)}`,
    `Estimated total: $${result.plan.estimatedTotalUsdc.toFixed(4)}`,
    `Within budget: ${result.withinBudget ? "yes" : "no"}`,
    ``,
    `Plan:`,
    ...lines,
  ].join("\n");
}

export type { TaskPlan };
