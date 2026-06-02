import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import {
  CAPABILITIES,
  ENTRY_STATUSES,
  type Capability,
  type EntryStatus,
  type RegistryDocument,
  type RegistryEntry,
} from "./types.js";

/** Package root (`packages/registry`), whether loaded from `src/` or `dist/`. */
const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));

function resolveRegistryPath(): string {
  const candidates = [
    join(PACKAGE_ROOT, "registry.yaml"),
    join(PACKAGE_ROOT, "dist", "registry.yaml"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  throw new Error(
    `registry.yaml not found (checked ${candidates.join(", ")})`,
  );
}

function assertCapability(value: unknown): Capability {
  if (typeof value !== "string" || !CAPABILITIES.includes(value as Capability)) {
    throw new Error(`Invalid capability "${String(value)}"`);
  }
  return value as Capability;
}

function assertStatus(value: unknown): EntryStatus {
  if (typeof value !== "string" || !ENTRY_STATUSES.includes(value as EntryStatus)) {
    throw new Error(`Invalid status "${String(value)}"`);
  }
  return value as EntryStatus;
}

function parseEntry(raw: unknown): RegistryEntry {
  if (!raw || typeof raw !== "object") {
    throw new Error("Registry entry must be an object");
  }
  const e = raw as Record<string, unknown>;
  const slug = String(e.slug ?? "").trim();
  if (!slug) throw new Error("Registry entry missing slug");

  const price = Number(e.price_usdc);
  if (Number.isNaN(price) || price < 0) {
    throw new Error(`Invalid price_usdc for ${slug}`);
  }

  const chains = Array.isArray(e.chains)
    ? e.chains.map((c) => String(c))
    : [];

  return {
    slug,
    name: String(e.name ?? slug),
    url: String(e.url ?? ""),
    endpoint: String(e.endpoint ?? ""),
    price_usdc: price,
    capability: assertCapability(e.capability),
    chains,
    status: assertStatus(e.status),
  };
}

/** Load and validate `registry.yaml` from the package root (or dist copy). */
export function loadRegistry(): RegistryDocument {
  const path = resolveRegistryPath();
  const text = readFileSync(path, "utf8");
  const doc = parse(text) as { entries?: unknown[] };
  if (!doc?.entries || !Array.isArray(doc.entries)) {
    throw new Error("registry.yaml must contain an entries array");
  }
  const entries = doc.entries.map(parseEntry);
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.slug)) {
      throw new Error(`Duplicate registry slug: ${entry.slug}`);
    }
    slugs.add(entry.slug);
  }
  return { entries };
}

/** Lookup by slug; throws if missing. */
export function findBySlug(
  registry: RegistryDocument,
  slug: string,
): RegistryEntry {
  const entry = registry.entries.find((e) => e.slug === slug);
  if (!entry) {
    throw new Error(`Unknown registry slug: ${slug}`);
  }
  return entry;
}
