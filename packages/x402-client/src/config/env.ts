import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getDefaultDemoUrl,
  getNetworkConfig,
  parseNetworkSlug,
  resolveRpcUrl,
  type NetworkConfig,
} from "./networks.js";
import {
  getFacilitatorConfig,
  parseFacilitatorId,
  type FacilitatorConfig,
} from "./facilitator.js";
import { getDeploymentEndpoints, parseDeployment } from "./deployment.js";
import type { WalletMode } from "../adapters/types.js";
import { readLocalWalletKey } from "../wallet/local.js";

const PACKAGE_ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));

let dotenvLoaded = false;

export function loadEnv(): void {
  if (dotenvLoaded) return;
  loadDotenv({ path: resolve(PACKAGE_ROOT, ".env") });
  loadDotenv({ path: resolve(process.cwd(), ".env") });
  dotenvLoaded = true;
}

export interface LoadAgentCashEnvOptions {
  testnet?: boolean;
}

export interface AgentCashEnv {
  deployment: ReturnType<typeof parseDeployment>;
  deploymentEndpoints: ReturnType<typeof getDeploymentEndpoints>;
  walletMode?: WalletMode;
  evmPrivateKey?: `0x${string}`;
  localWalletPath: boolean;
  network: NetworkConfig;
  rpcUrl: string;
  facilitator: FacilitatorConfig;
  demoUrl: string;
  minUsdcBalance?: number;
  cdp: {
    apiKeyId?: string;
    apiKeySecret?: string;
    walletSecret?: string;
    walletName: string;
  };
  walletConnectProjectId?: string;
  svmPrivateKey?: string;
}

export async function loadAgentCashEnv(
  options: LoadAgentCashEnvOptions = {},
): Promise<AgentCashEnv> {
  loadEnv();

  const deployment = parseDeployment(process.env.AGENTCASH_ENV);
  const deploymentEndpoints = getDeploymentEndpoints(process.env.AGENTCASH_ENV);

  const testnet = options.testnet ?? false;
  const network = getNetworkConfig(process.env.X402_NETWORK, { testnet });
  const rpcUrl = resolveRpcUrl(network, {
    rpcUrl: process.env.RPC_URL,
    alchemyKey: process.env.ALCHEMY_KEY,
  });

  const facilitator = getFacilitatorConfig(process.env.X402_FACILITATOR);

  const demoUrl =
    process.env.X402_DEMO_URL?.trim() || getDefaultDemoUrl(network);

  const minRaw = process.env.MIN_USDC_BALANCE?.trim();
  const minUsdcBalance = minRaw ? Number(minRaw) : undefined;

  const envKey = process.env.EVM_PRIVATE_KEY?.trim();
  const localKey = envKey ? null : await readLocalWalletKey();
  const evmPrivateKey = envKey
    ? ((envKey.startsWith("0x") ? envKey : `0x${envKey}`) as `0x${string}`)
    : localKey ?? undefined;

  const walletModeRaw = process.env.X402_WALLET_MODE?.trim() as
    | WalletMode
    | undefined;

  return {
    deployment,
    deploymentEndpoints,
    walletMode: walletModeRaw,
    evmPrivateKey,
    localWalletPath: Boolean(localKey && !envKey),
    network,
    rpcUrl,
    facilitator,
    demoUrl,
    minUsdcBalance:
      minUsdcBalance !== undefined && !Number.isNaN(minUsdcBalance)
        ? minUsdcBalance
        : undefined,
    cdp: {
      apiKeyId: process.env.CDP_API_KEY_ID?.trim(),
      apiKeySecret: process.env.CDP_API_KEY_SECRET?.trim(),
      walletSecret: process.env.CDP_WALLET_SECRET?.trim(),
      walletName: process.env.CDP_WALLET_NAME?.trim() || "agentcash",
    },
    walletConnectProjectId: process.env.WALLET_CONNECT_PROJECT_ID?.trim(),
    svmPrivateKey: process.env.SVM_PRIVATE_KEY?.trim(),
  };
}

export { parseNetworkSlug, parseFacilitatorId };
