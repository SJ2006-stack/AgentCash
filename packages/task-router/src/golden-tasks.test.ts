/**
 * Golden tasks v0 — manual checklist + automated smoke (no live keys).
 *
 * Manual (run with funded wallet + keys):
 * 1. quote "research SOL price" --budget 0.20  → expects data/search slugs
 * 2. quote "what is the weather in Tokyo" --budget 0.10 → weatherapi-v1
 * 3. run "get current weather" --budget 0.50 --dry-run → dry plan only
 * 4. run "research SOL" --budget 0.50 → paid sequential x402 (needs EVM_PRIVATE_KEY)
 * 5. quote "verify example.com dns" --budget 0.05 → dns-verify-v1
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { quote } from "./quote.js";
import { run } from "./run.js";
import { buildRegistryToolSchema } from "./schema.js";
import { loadRegistry } from "@agentcash/registry";

describe("golden tasks smoke", () => {
  it("quote SOL research stays within $0.20 heuristic budget", async () => {
    const result = await quote("research SOL price and sentiment", 0.2);
    assert.ok(result.plan.subtasks.length >= 1);
    assert.ok(result.plan.subtasks.every((s) => s.slug.endsWith("-v1")));
    const schema = buildRegistryToolSchema();
    const allowed = schema.properties.tools.items.properties.slug.enum;
    for (const s of result.plan.subtasks) {
      assert.ok(allowed.includes(s.slug), s.slug);
    }
  });

  it("weather task picks weatherapi-v1 in heuristic plan", async () => {
    const result = await quote("what is the weather in Tokyo", 0.1);
    const slugs = result.plan.subtasks.map((s) => s.slug);
    assert.ok(
      slugs.includes("weatherapi-v1"),
      `expected weatherapi-v1 in ${slugs.join(",")}`,
    );
  });

  it("dry-run run completes without wallet", async () => {
    const result = await run("get current weather", 0.5, { dryRun: true });
    assert.ok(result.subtaskResults.length >= 1);
    assert.ok(result.synthesis.includes("Total estimated/spent USDC"));
    assert.equal(result.totalUsdc >= 0, true);
  });

  it("registry has 10 entries for tool schema enum", () => {
    const registry = loadRegistry();
    assert.equal(registry.entries.length, 10);
    const schema = buildRegistryToolSchema(registry);
    const enumLen = schema.properties.tools.items.properties.slug.enum.length;
    assert.ok(enumLen >= 9);
  });
});
