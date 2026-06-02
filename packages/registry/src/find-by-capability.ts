import type { Capability, RegistryDocument, RegistryEntry } from "./types.js";

export interface FindByCapabilityOptions {
  /** Exclude coming_soon entries (default true for routing). */
  routableOnly?: boolean;
  /** Prefer confirmed before unverified (default true). */
  sortByTrust?: boolean;
}

/** Return entries matching a capability tag. */
export function findByCapability(
  registry: RegistryDocument,
  capability: Capability,
  options: FindByCapabilityOptions = {},
): RegistryEntry[] {
  const { routableOnly = true, sortByTrust = true } = options;
  let matches = registry.entries.filter((e) => e.capability === capability);
  if (routableOnly) {
    matches = matches.filter((e) => e.status !== "coming_soon");
  }
  if (sortByTrust) {
    const rank: Record<string, number> = {
      confirmed: 0,
      unverified: 1,
      coming_soon: 2,
    };
    matches = [...matches].sort(
      (a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9),
    );
  }
  return matches;
}
