import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadRegistry, findBySlug } from "./load-registry.js";
import { findByCapability } from "./find-by-capability.js";
import { CAPABILITIES } from "./types.js";

describe("registry", () => {
  it("loads exactly 10 founder entries", () => {
    const { entries } = loadRegistry();
    assert.equal(entries.length, 10);
  });

  it("hero brave-search-v1 is unverified", () => {
    const { entries } = loadRegistry();
    const hero = findBySlug({ entries }, "brave-search-v1");
    assert.equal(hero.status, "unverified");
    assert.equal(hero.capability, "search");
  });

  it("weatherapi-v1 is confirmed on base", () => {
    const { entries } = loadRegistry();
    const weather = findBySlug({ entries }, "weatherapi-v1");
    assert.equal(weather.status, "confirmed");
    assert.ok(weather.endpoint.includes("weather.hugen.tokyo"));
    assert.deepEqual(weather.chains, ["base"]);
  });

  it("findByCapability returns routable search APIs", () => {
    const registry = loadRegistry();
    const search = findByCapability(registry, "search");
    assert.ok(search.length >= 2);
    assert.ok(search.every((e) => e.status !== "coming_soon"));
    assert.ok(search.some((e) => e.slug === "brave-search-v1"));
  });

  it("all capabilities used are valid tags", () => {
    const { entries } = loadRegistry();
    for (const e of entries) {
      assert.ok(
        CAPABILITIES.includes(e.capability),
        `${e.slug} capability ${e.capability}`,
      );
    }
  });
});
