import type { SubtaskResult } from "./types.js";

/** v0 synthesis stub — cite slugs and total cost. */
export function synthesizeResults(
  task: string,
  results: SubtaskResult[],
  totalUsdc: number,
): string {
  const lines = results.map((r) => {
    const status = r.ok ? "ok" : `failed (${r.error ?? r.httpStatus})`;
    return `- **${r.slug}** (${status}): ${r.summary}`;
  });

  return [
    `## AgentCash synthesis (v0 stub)`,
    ``,
    `**Task:** ${task}`,
    ``,
    `**Subtasks:**`,
    ...lines,
    ``,
    `**Total estimated/spent USDC:** $${totalUsdc.toFixed(4)}`,
    ``,
    `_Full LLM synthesis ships in a later release._`,
  ].join("\n");
}
