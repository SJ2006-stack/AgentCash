#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const __dirname = dirname(fileURLToPath(import.meta.url));

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function authHeaders(): HeadersInit {
  const agentId = requireEnv("MANDATE_AGENT_ID");
  const agentKey = requireEnv("MANDATE_AGENT_KEY");
  const token = Buffer.from(`${agentId}:${agentKey}`, "utf8").toString("base64url");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function apiBase(): string {
  return requireEnv("MANDATE_API_URL").replace(/\/$/, "");
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, { ...init, headers: { ...authHeaders(), ...init?.headers } });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${JSON.stringify(body)}`);
  }
  return body as T;
}

function findSkillDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const candidate = join(dir, "skills", "mandate-payment", "SKILL.md");
    if (existsSync(candidate)) return join(dir, "skills", "mandate-payment");
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const nearCli = join(__dirname, "..", "..", "..", "skills", "mandate-payment");
  if (existsSync(join(nearCli, "SKILL.md"))) return nearCli;
  return null;
}

const program = new Command("mandate").description("Mandate / AgentCard-compatible CLI (calls HTTPS API v1)").version("0.2.0");

program
  .command("setup-mcp")
  .description("Print Cursor/OpenClaw MCP server JSON snippet (set MCP_SERVER_PATH to dist/index.js)")
  .requiredOption("--mcp-js <path>", "Absolute path to mandate-mcp-server dist/index.js")
  .action((opts) => {
    const snippet = {
      mcpServers: {
        "mandate-payment": {
          command: "node",
          args: [opts.mcpJs],
          env: {
            SUPABASE_URL: "${SUPABASE_URL}",
            SUPABASE_SERVICE_ROLE_KEY: "${SUPABASE_SERVICE_ROLE_KEY}",
            MCP_AGENT_ID: "${MCP_AGENT_ID}",
            MCP_AGENT_KEY: "${MCP_AGENT_KEY}",
            STRIPE_SECRET_KEY: "${STRIPE_SECRET_KEY}",
            STRIPE_SKIP_ISSUING: "1",
            APPROVAL_BASE_URL: "${APPROVAL_BASE_URL}",
          },
        },
      },
    };
    console.log(JSON.stringify(snippet, null, 2));
  });

program
  .command("skills-path")
  .description("Print path to OpenClaw/AgentSkills-compatible skill folder (for openclaw skills install)")
  .action(() => {
    const p = findSkillDir();
    if (!p) {
      console.error("Could not locate skills/mandate-payment from cwd or monorepo layout.");
      process.exit(1);
    }
    console.log(p);
  });

program
  .command("skills-show")
  .description("Print SKILL.md contents for piping into a workspace skills folder")
  .action(() => {
    const dir = findSkillDir();
    if (!dir) {
      console.error("Skill folder not found.");
      process.exit(1);
    }
    console.log(readFileSync(join(dir, "SKILL.md"), "utf8"));
  });

const cards = program.command("cards").description("Virtual Issuing cards");

cards
  .command("create")
  .description("Create / request a card (POST /api/v1/cards)")
  .requiredOption("--amount-cents <n>", "Amount in cents")
  .option("--merchant <m>", "Merchant token", "agentcard")
  .option("--intent <t>", "Intent string")
  .option("--source <s>", "Source context string")
  .option("--sandbox", "Force shadow mode for this call")
  .option("--subscription-lock", "Use subscription_lock card kind")
  .action(async (opts: {
    amountCents: string;
    merchant: string;
    intent?: string;
    source?: string;
    sandbox?: boolean;
    subscriptionLock?: boolean;
  }) => {
    const amount_cents = parseInt(opts.amountCents, 10);
    if (!Number.isFinite(amount_cents) || amount_cents <= 0) throw new Error("Invalid amount-cents");
    const body = {
      amount_cents,
      merchant: opts.merchant,
      intent: opts.intent ?? "CLI mandate cards create.",
      source_context: opts.source ?? "mandate CLI cards create",
      sandbox: Boolean(opts.sandbox),
      card_kind: opts.subscriptionLock ? "subscription_lock" : "single_use",
    };
    const out = await api<unknown>("/api/v1/cards", { method: "POST", body: JSON.stringify(body) });
    console.log(JSON.stringify(out, null, 2));
  });

cards
  .command("list")
  .description("List active cards")
  .action(async () => {
    const out = await api<unknown>("/api/v1/cards", { method: "GET" });
    console.log(JSON.stringify(out, null, 2));
  });

cards
  .command("details")
  .description("Non-PCI card metadata")
  .argument("<cardId>", "Stripe ic_... or internal UUID")
  .action(async (cardId: string) => {
    const out = await api<unknown>(`/api/v1/cards/${encodeURIComponent(cardId)}/details`, { method: "GET" });
    console.log(JSON.stringify(out, null, 2));
  });

cards
  .command("balance")
  .argument("<cardId>", "Stripe ic_... or internal UUID")
  .action(async (cardId: string) => {
    const out = await api<unknown>(`/api/v1/cards/${encodeURIComponent(cardId)}/balance`, { method: "GET" });
    console.log(JSON.stringify(out, null, 2));
  });

cards
  .command("transactions")
  .argument("<cardId>", "Stripe ic_... or internal UUID")
  .option("--limit <n>", "max 100", "25")
  .action(async (cardId: string, opts: { limit: string }) => {
    const out = await api<unknown>(
      `/api/v1/cards/${encodeURIComponent(cardId)}/transactions?limit=${encodeURIComponent(opts.limit)}`,
      { method: "GET" },
    );
    console.log(JSON.stringify(out, null, 2));
  });

cards
  .command("close")
  .argument("<cardId>", "Stripe ic_... or internal UUID")
  .requiredOption("--reason <r>", "Why the card is closed")
  .action(async (cardId: string, opts: { reason: string }) => {
    const out = await api<unknown>(`/api/v1/cards/${encodeURIComponent(cardId)}/close`, {
      method: "POST",
      body: JSON.stringify({ reason: opts.reason }),
    });
    console.log(JSON.stringify(out, null, 2));
  });

const approvals = program.command("approvals").description("Human approval helpers");

approvals
  .command("decide")
  .description("POST /api/v1/approvals (requires MANDATE_ALLOW_AGENT_APPROVAL on server)")
  .requiredOption("--token <t>", "apr_... token")
  .requiredOption("--decision <d>", "approved or denied")
  .action(async (opts: { token: string; decision: string }) => {
    if (opts.decision !== "approved" && opts.decision !== "denied") {
      throw new Error("decision must be approved or denied");
    }
    const out = await api<unknown>("/api/v1/approvals", {
      method: "POST",
      body: JSON.stringify({ token: opts.token, decision: opts.decision }),
    });
    console.log(JSON.stringify(out, null, 2));
  });

program
  .command("health")
  .description("GET /api/v1/health (no auth)")
  .action(async () => {
    const base = process.env.MANDATE_API_URL;
    if (!base) throw new Error("MANDATE_API_URL required");
    const res = await fetch(`${base.replace(/\/$/, "")}/api/v1/health`);
    console.log(await res.text());
  });

await program.parseAsync(process.argv);
