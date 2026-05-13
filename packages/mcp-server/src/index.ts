#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createMandateEngine, mandateEngineConfigFromEnv } from "@mandate/mandate-engine";
import type { EngineResult, RequestPaymentInput } from "@mandate/mandate-engine";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const agentId = requireEnv("MCP_AGENT_ID");
const agentKey = requireEnv("MCP_AGENT_KEY");
const engine = createMandateEngine(mandateEngineConfigFromEnv());

function policyViolation(message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: `PolicyViolation: ${message}` }],
  };
}

function okPayload(obj: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] };
}

function mcpFromEngine(r: EngineResult) {
  if (r.ok) return okPayload(r.data);
  return policyViolation(r.policyViolation);
}

const paymentInputSchema = {
  amount_cents: z.number().int().positive().describe("Amount in USD cents"),
  merchant: z.string().min(1).describe("Merchant token, e.g. aws or digitalocean"),
  intent: z
    .string()
    .min(8)
    .describe('Why this payment is needed, e.g. "Renew SSL certificate to prevent site downtime"'),
  source_context: z
    .string()
    .min(4)
    .describe('Where the trigger came from, e.g. "Email from Let\'s Encrypt at 10:00 AM, msg_id=..."'),
  justification: z.string().optional().describe("Optional short note (defaults to intent)"),
  card_kind: z
    .enum(["single_use", "subscription_lock"])
    .default("single_use")
    .describe("single_use = per-authorization. subscription_lock = merchant-locked + expires."),
  subscription_period_days: z.number().int().min(1).max(365).optional().describe("For subscription_lock; default 30."),
  sandbox: z
    .boolean()
    .optional()
    .describe("When true, forces shadow/simulated spend for this call even if mandate is live."),
};

async function runPayment(input: RequestPaymentInput) {
  return engine.requestPayment(agentId, agentKey, input);
}

const server = new McpServer({
  name: "mandate-payment-gateway",
  version: "0.2.0",
});

server.tool(
  "request_payment",
  [
    "Request a card-backed payment via the Mandate gateway.",
    "Requires intent + source_context (receipt of intent).",
    "Returns card_id (= stripe_card_id), last4, policy errors as PolicyViolation: ...",
  ].join(" "),
  paymentInputSchema,
  async (args) => mcpFromEngine(await runPayment(args as RequestPaymentInput)),
);

server.tool(
  "create_card",
  [
    "AgentCard-compatible alias for request_payment.",
    "Add merchant token `agentcard` to the mandate allowlist OR pass an explicit merchant on every call.",
    "Optional sandbox:true forces simulated spend for this call.",
  ].join(" "),
  {
    amount_cents: z.number().int().positive(),
    merchant: z.string().min(1).optional(),
    intent: z.string().min(8).optional(),
    source_context: z.string().min(4).optional(),
    justification: z.string().optional(),
    sandbox: z.boolean().optional(),
    card_kind: z.enum(["single_use", "subscription_lock"]).optional().default("single_use"),
    subscription_period_days: z.number().int().min(1).max(365).optional(),
  },
  async (args) => {
    const input: RequestPaymentInput = {
      amount_cents: args.amount_cents,
      merchant: args.merchant ?? "agentcard",
      intent: args.intent ?? "Card issuance for online purchase via create_card (AgentCard-compatible tool).",
      source_context: args.source_context ?? "MCP create_card tool — add explicit context when possible.",
      justification: args.justification,
      card_kind: args.card_kind ?? "single_use",
      subscription_period_days: args.subscription_period_days,
      sandbox: args.sandbox,
    };
    return mcpFromEngine(await runPayment(input));
  },
);

server.tool(
  "list_cards",
  "AgentCard-compatible alias: list active virtual cards for this agent.",
  {},
  async () => mcpFromEngine(await engine.listActiveCards(agentId, agentKey)),
);

server.tool(
  "list_active_cards",
  "List active cards (same as list_cards; kept for backward compatibility).",
  {},
  async () => mcpFromEngine(await engine.listActiveCards(agentId, agentKey)),
);

server.tool(
  "close_card",
  "AgentCard-compatible alias for cancel_card. Pass card_id (Stripe ic_... or internal UUID).",
  {
    card_id: z.string().min(3),
    reason: z.string().min(3).max(500),
  },
  async ({ card_id, reason }) => mcpFromEngine(await engine.cancelCard(agentId, agentKey, card_id, reason)),
);

server.tool(
  "cancel_card",
  "Cancel a card by stripe_card_id or internal card row id.",
  {
    stripe_card_id: z.string().min(3),
    reason: z.string().min(3).max(500),
  },
  async ({ stripe_card_id, reason }) => mcpFromEngine(await engine.cancelCard(agentId, agentKey, stripe_card_id, reason)),
);

server.tool(
  "get_card_details",
  [
    "Non-PCI card metadata: last4, expiry, status, merchant_lock.",
    "Never returns PAN/CVV to the model.",
  ].join(" "),
  { card_id: z.string().min(3) },
  async ({ card_id }) => mcpFromEngine(await engine.getCardDetails(agentId, agentKey, card_id)),
);

server.tool(
  "check_balance",
  "Estimate remaining purchasing power on a card from issued amount minus Issuing transactions.",
  { card_id: z.string().min(3) },
  async ({ card_id }) => mcpFromEngine(await engine.checkBalance(agentId, agentKey, card_id)),
);

server.tool(
  "list_transactions",
  "List Stripe Issuing transactions for a card_id (Stripe id or internal UUID).",
  {
    card_id: z.string().min(3),
    limit: z.number().int().min(1).max(100).optional(),
  },
  async ({ card_id, limit }) => mcpFromEngine(await engine.listTransactions(agentId, agentKey, card_id, limit)),
);

server.tool(
  "approve_pending",
  [
    "Decide a pending human-approval by token (optional; off unless MANDATE_ALLOW_AGENT_APPROVAL=1).",
    "Prefer Slack/WhatsApp/magic link for real approvals.",
  ].join(" "),
  {
    token: z.string().min(10),
    decision: z.enum(["approved", "denied"]),
  },
  async ({ token, decision }) => mcpFromEngine(await engine.approvePending(agentId, agentKey, token, decision)),
);

const transport = new StdioServerTransport();
await server.connect(transport);
