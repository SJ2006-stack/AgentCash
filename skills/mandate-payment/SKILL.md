---
name: mandate-payment
description: Issue mandate-scoped virtual cards via MCP or REST; AgentCard-compatible tools (create_card, list_cards, get_card_details metadata, check_balance, close_card).
metadata: '{"openclaw":{"requires":{"env":["MCP_AGENT_ID","MCP_AGENT_KEY","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"],"bins":["node"]}}}'
---

# Mandate payment (AgentCard-style)

Use this skill when the user needs **virtual cards** with **hard budgets**, **merchant allowlists**, optional **human approval** (Slack/WhatsApp), and **shadow mode** before going live.

## Prefer MCP tools (stdio)

Configure the `mandate-payment` MCP server (see repo `README.md`). Tools:

- `request_payment` — full mandate flow with `intent` + `source_context` (required).
- `create_card` — **AgentCard-compatible** alias; default merchant token `agentcard` (add it to the mandate allowlist or pass `--merchant`).
- `list_cards` / `list_active_cards`, `get_card_details` (metadata only, **no PAN**), `check_balance`, `list_transactions`, `close_card` / `cancel_card`.
- `approve_pending` — only if operator sets `MANDATE_ALLOW_AGENT_APPROVAL=1` (discouraged in production).

## REST + CLI (same auth)

- Base URL: `MANDATE_API_URL` (e.g. `https://your-app.vercel.app`).
- Auth: `Authorization: Bearer <base64url(agentUuid:plainMcpKey)>` or headers `X-Mandate-Agent-Id` + `X-Mandate-Agent-Key`.

Endpoints:

- `POST /api/v1/cards` — body matches `create_card` / `request_payment` fields.
- `GET /api/v1/cards` — list active cards.
- `GET /api/v1/cards/{id}/details|balance|transactions?limit=`
- `POST /api/v1/cards/{id}/close` — JSON `{ "reason": "..." }`.
- `POST /api/v1/approvals` — `{ "token": "apr_...", "decision": "approved"|"denied" }` (gated server-side).

CLI (`npx @mandate/cli` or workspace `mandate` after `npm link`):

```bash
export MANDATE_API_URL=https://example.com
export MANDATE_AGENT_ID=...
export MANDATE_AGENT_KEY=mcp_...
mandate cards create --amount-cents 5000 --sandbox
mandate cards list
mandate health
mandate skills-path   # prints ./skills/mandate-payment for OpenClaw workspace install
```

## Safety

- Never expect full PAN/CVV in the model. Use Stripe test dashboards or human checkout.
- Add `agentcard` to **allowed merchants** on the agent mandate when using `create_card` defaults.

## `{baseDir}`

This skill folder may be copied to the OpenClaw workspace `skills/mandate-payment/` (highest precedence). Keep it next to the repo or run `mandate skills-path` from the monorepo root.
