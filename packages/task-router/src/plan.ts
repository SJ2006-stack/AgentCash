import {
  findByCapability,
  loadRegistry,
  type RegistryDocument,
  type RegistryEntry,
} from "@agentcash/registry";
import { assertKnownSlugs } from "./schema.js";

export interface PlannedSubtask {
  slug: string;
  reason: string;
  entry: RegistryEntry;
  estimatedUsdc: number;
}

export interface TaskPlan {
  task: string;
  subtasks: PlannedSubtask[];
  estimatedTotalUsdc: number;
  source: "anthropic" | "registry-heuristic";
}

const KEYWORD_CAPABILITY: Array<{ re: RegExp; capability: RegistryEntry["capability"] }> = [
  { re: /\b(search|find|google|brave)\b/i, capability: "search" },
  { re: /\b(price|market|sol\b|token|coingecko|birdeye)\b/i, capability: "data" },
  { re: /\b(weather|forecast|temperature)\b/i, capability: "data" },
  { re: /\b(scrape|crawl|read\s+url|fetch\s+page)\b/i, capability: "scrape" },
  { re: /\b(verify|dns|domain)\b/i, capability: "verify" },
  { re: /\b(enrich|wallet|helius)\b/i, capability: "enrich" },
];

function pickEntry(
  registry: RegistryDocument,
  capability: RegistryEntry["capability"],
  used: Set<string>,
): RegistryEntry | undefined {
  const candidates = findByCapability(registry, capability);
  return candidates.find((e) => !used.has(e.slug));
}

/** Deterministic placeholder plan from registry heuristics (no LLM). */
export function buildHeuristicPlan(
  task: string,
  registry: RegistryDocument = loadRegistry(),
): TaskPlan {
  const used = new Set<string>();
  const subtasks: PlannedSubtask[] = [];

  for (const { re, capability } of KEYWORD_CAPABILITY) {
    if (!re.test(task)) continue;
    const entry = pickEntry(registry, capability, used);
    if (!entry) continue;
    used.add(entry.slug);
    subtasks.push({
      slug: entry.slug,
      reason: `Matched capability ${capability} for task keywords`,
      entry,
      estimatedUsdc: entry.price_usdc,
    });
    if (subtasks.length >= 4) break;
  }

  if (subtasks.length === 0) {
    const fallback =
      findByCapability(registry, "search")[0] ??
      registry.entries.find((e) => e.status === "confirmed");
    if (fallback) {
      subtasks.push({
        slug: fallback.slug,
        reason: "Default search/data step when no keywords matched",
        entry: fallback,
        estimatedUsdc: fallback.price_usdc,
      });
    }
  }

  const estimatedTotalUsdc = subtasks.reduce(
    (sum, s) => sum + s.estimatedUsdc,
    0,
  );

  return {
    task,
    subtasks,
    estimatedTotalUsdc,
    source: "registry-heuristic",
  };
}

interface AnthropicToolPlan {
  tools: Array<{ slug: string; reason: string }>;
}

/** Optional Anthropic planner when ANTHROPIC_API_KEY is set. */
export async function buildAnthropicPlan(
  task: string,
  registry: RegistryDocument = loadRegistry(),
): Promise<TaskPlan | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;

  const slugs = registry.entries
    .filter((e) => e.status !== "coming_soon")
    .map(
      (e) =>
        `- ${e.slug} (${e.capability}, ~$${e.price_usdc} USDC, ${e.status})`,
    )
    .join("\n");

  const body = {
    model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are AgentCash task planner v0. Pick 1-4 registry tools (slugs only) to accomplish the user task. Output JSON only: {"tools":[{"slug":"...","reason":"..."}]}\n\nRegistry:\n${slugs}\n\nTask: ${task}`,
      },
    ],
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic planner failed (${response.status}): ${text.slice(0, 200)}`);
  }

  const json = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const textBlock = json.content?.find((c) => c.type === "text");
  const raw = textBlock?.text?.trim() ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Anthropic planner returned no JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as AnthropicToolPlan;
  const toolSlugs = (parsed.tools ?? []).map((t) => t.slug);
  assertKnownSlugs(registry, toolSlugs);

  const subtasks: PlannedSubtask[] = (parsed.tools ?? []).slice(0, 4).map((t) => {
    const entry = registry.entries.find((e) => e.slug === t.slug)!;
    return {
      slug: t.slug,
      reason: t.reason,
      entry,
      estimatedUsdc: entry.price_usdc,
    };
  });

  return {
    task,
    subtasks,
    estimatedTotalUsdc: subtasks.reduce((s, x) => s + x.estimatedUsdc, 0),
    source: "anthropic",
  };
}

export async function buildPlan(
  task: string,
  registry: RegistryDocument = loadRegistry(),
): Promise<TaskPlan> {
  try {
    const anthropic = await buildAnthropicPlan(task, registry);
    if (anthropic && anthropic.subtasks.length > 0) return anthropic;
  } catch (err) {
    console.warn(
      `Anthropic planner unavailable, using registry heuristic: ${
        err instanceof Error ? err.message : err
      }`,
    );
  }
  return buildHeuristicPlan(task, registry);
}
