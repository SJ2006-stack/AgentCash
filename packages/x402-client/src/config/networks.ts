export type NetworkSlug = "base-sepolia" | "base-mainnet";

export type ChainCatalogSlug = NetworkSlug | "ethereum-mainnet" | "solana";

export interface NetworkConfig {
  slug: NetworkSlug;
  label: string;
  chainId: number;
  caip2: `eip155:${number}`;
  usdcAddress: `0x${string}`;
  defaultRpcUrl: string;
  isTestnet: boolean;
}

export interface ChainCatalogEntry {
  slug: ChainCatalogSlug;
  label: string;
  logo: string;
  status: "active" | "testnet" | "coming-soon" | "not-in-v0";
  isDefault?: boolean;
}

const NETWORKS: Record<NetworkSlug, NetworkConfig> = {
  "base-sepolia": {
    slug: "base-sepolia",
    label: "Base Sepolia",
    chainId: 84532,
    caip2: "eip155:84532",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    defaultRpcUrl: "https://sepolia.base.org",
    isTestnet: true,
  },
  "base-mainnet": {
    slug: "base-mainnet",
    label: "Base Mainnet",
    chainId: 8453,
    caip2: "eip155:8453",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    defaultRpcUrl: "https://mainnet.base.org",
    isTestnet: false,
  },
};

const SLUG_ALIASES: Record<string, NetworkSlug> = {
  "base-sepolia": "base-sepolia",
  sepolia: "base-sepolia",
  testnet: "base-sepolia",
  "base-mainnet": "base-mainnet",
  base: "base-mainnet",
  mainnet: "base-mainnet",
};

export function parseNetworkSlug(raw?: string, options?: { testnet?: boolean }): NetworkSlug {
  if (options?.testnet) {
    return "base-sepolia";
  }
  const value = (raw ?? "base-mainnet").trim().toLowerCase();
  const slug = SLUG_ALIASES[value];
  if (!slug) {
    throw new Error(
      `Invalid X402_NETWORK "${raw}". Use base-sepolia or base-mainnet.`,
    );
  }
  return slug;
}

export function getNetworkConfig(
  slug?: string,
  options?: { testnet?: boolean },
): NetworkConfig {
  return NETWORKS[parseNetworkSlug(slug, options)];
}

export function resolveRpcUrl(
  network: NetworkConfig,
  env: { rpcUrl?: string; alchemyKey?: string },
): string {
  if (env.rpcUrl?.trim()) {
    return env.rpcUrl.trim();
  }
  const key = env.alchemyKey?.trim();
  if (key) {
    const host =
      network.slug === "base-sepolia" ? "base-sepolia" : "base-mainnet";
    return `https://${host}.g.alchemy.com/v2/${key}`;
  }
  return network.defaultRpcUrl;
}

/** Default paid-fetch targets per network (override with X402_DEMO_URL). */
export function getDefaultDemoUrl(network: NetworkConfig): string {
  if (network.slug === "base-mainnet") {
    return "https://weather.hugen.tokyo/weather/current";
  }
  return "http://localhost:4021/weather";
}

export function demoUrlWarning(network: NetworkConfig, url: string): string | null {
  if (network.slug === "base-mainnet") {
    return `Mainnet URL — each call spends real USDC (~$0.01): ${url}`;
  }
  if (url.includes("weather.hugen.tokyo")) {
    return "weather.hugen.tokyo is Base mainnet; omit --testnet and fund mainnet USDC.";
  }
  if (url.startsWith("http://localhost")) {
    return "Local x402 server — run the x402 express example on port 4021 first.";
  }
  return null;
}

export function getChainCatalog(testnet: boolean): ChainCatalogEntry[] {
  return [
    {
      slug: "base-mainnet",
      label: "Base",
      logo: "[BASE]",
      status: testnet ? "active" : "active",
      isDefault: !testnet,
    },
    {
      slug: "base-sepolia",
      label: "Base Sepolia",
      logo: "[BASE·test]",
      status: "testnet",
      isDefault: testnet,
    },
    {
      slug: "ethereum-mainnet",
      label: "Ethereum",
      logo: "[ETH]",
      status: "coming-soon",
    },
    {
      slug: "solana",
      label: "Solana",
      logo: "[SOL]",
      status: "not-in-v0",
    },
  ];
}
