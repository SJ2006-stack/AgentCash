export type AgentCashDeployment = "dev" | "staging" | "prod";

export interface DeploymentEndpoints {
  registryUrl: string;
  apiBaseUrl: string;
}

const DEPLOYMENTS: Record<AgentCashDeployment, DeploymentEndpoints> = {
  dev: {
    registryUrl: "http://localhost:8787/v1/registry.json",
    apiBaseUrl: "http://localhost:8787",
  },
  staging: {
    registryUrl: "https://staging-api.agentcash.tech/v1/registry.json",
    apiBaseUrl: "https://staging-api.agentcash.tech",
  },
  prod: {
    registryUrl: "https://api.agentcash.tech/v1/registry.json",
    apiBaseUrl: "https://api.agentcash.tech",
  },
};

export function parseDeployment(raw?: string): AgentCashDeployment {
  const value = (raw ?? "prod").trim().toLowerCase();
  if (value === "dev" || value === "staging" || value === "prod") {
    return value;
  }
  throw new Error(
    `Invalid AGENTCASH_ENV "${raw}". Use dev, staging, or prod.`,
  );
}

export function getDeploymentEndpoints(deployment?: string): DeploymentEndpoints {
  return DEPLOYMENTS[parseDeployment(deployment)];
}
