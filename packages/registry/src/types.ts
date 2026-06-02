export const CAPABILITIES = [
  "search",
  "data",
  "media",
  "compute",
  "scrape",
  "enrich",
  "generate",
  "verify",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const ENTRY_STATUSES = [
  "confirmed",
  "unverified",
  "coming_soon",
] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export interface RegistryEntry {
  slug: string;
  name: string;
  url: string;
  endpoint: string;
  price_usdc: number;
  capability: Capability;
  chains: string[];
  status: EntryStatus;
}

export interface RegistryDocument {
  entries: RegistryEntry[];
}

export const AGENTCASH_REFERER = "agentcash/v0";
