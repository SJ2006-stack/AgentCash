# AgentCash (mandate + MCP payment gateway, v0.2)

**AgentCash** is the product name for this stack: human mandates, MCP “bouncer,” Stripe Issuing test cards, Slack/WhatsApp approvals, and OpenNext on Cloudflare (`agentcash` Worker).

Monorepo:

1. **`apps/web`** — Next.js dashboard (mandates, MCP keys, approvals UI), webhooks, `/approve/[token]`, plus **REST Agent API** under `/api/v1/*` (same mandate engine as MCP).
2. **`packages/mandate-engine`** — Shared Supabase + Stripe Issuing logic (used by MCP, Next API, tests).
3. **`packages/mcp-server`** — stdio **MCP** server: `request_payment`, **AgentCard-compatible aliases** (`create_card`, `list_cards`, `close_card`), `get_card_details` (metadata only), `check_balance`, `list_transactions`, `approve_pending` (opt-in).
4. **`packages/cli`** — `mandate` CLI calling the HTTPS API (for scripts / humans).
5. **`skills/mandate-payment`** — **OpenClaw / AgentSkills-compatible** `SKILL.md` (workspace `skills/` is highest precedence in OpenClaw).
6. **`supabase/migrations`** — Postgres schema + RLS (owners vs service role for ledger/approvals).

## Local guardrails (`Private.md`)

Create a **`Private.md`** file at the **repo root** for your private instructions, todos, and agent guardrails. You can run `cp Private.md.example Private.md` and customize. **`Private.md`** is listed in **`.gitignore`** so it stays on your machine and is **not pushed to GitHub**. Cursor loads **`.cursor/rules/agentcash-private.mdc`**, which tells the agent to read `Private.md` when it exists before building.

## What changed in v0.15 (power features)

| Feature | What you get |
|---|---|
| 🟦 Slack + 🟢 WhatsApp approval bridge | When the agent crosses the approval threshold or you flip "always require approval", the MCP server creates a `pending_approvals` row, pings Slack (Block Kit buttons) and/or sends a Twilio WhatsApp message with magic links + `YES <token>` reply parsing, then polls until decision/timeout. The tool call itself blocks until a human decides. |
| 🧾 Semantic justification | `request_payment` now requires `intent` and `source_context`. Every ledger row is a self-auditing receipt of *why* the agent spent the money. |
| 🌑 Shadow mode | Toggle on the mandate. The agent runs the entire flow but no card is minted; the ledger records `shadow_approved` rows that the dashboard tallies separately. "Last 7 days you would have spent $X with Y% policy hits." |
| ⏳ Exploding cards | New `card_kind="subscription_lock"` mints a merchant-locked Issuing card with a monthly spending limit and an `expires_at` (default 30d). Tracked in `agent_cards`, cancellable from the dashboard or via the `cancel_card` MCP tool. |

## Prerequisites

- Node 22+
- [Supabase CLI](https://supabase.com/docs/guides/cli) for local DB (`supabase start`)
- Stripe account with **Issuing** enabled (test mode). For a quick demo without Issuing API, set `STRIPE_SKIP_ISSUING=1`.
- (Optional) Slack workspace with an incoming webhook + slash command pointing at your `/api/webhooks/slack`.
- (Optional) Twilio account with the WhatsApp sandbox or a WhatsApp-enabled number; inbound webhook → `/api/webhooks/whatsapp`.

## Environment variables

### Next.js (`apps/web/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server secret** — used by `/approve/[token]` and the Slack/WhatsApp webhooks to call the `decide_pending_approval` RPC. Never expose to the browser. |
| `SLACK_VERIFICATION_TOKEN` | Optional. If set, the Slack slash-command webhook will reject requests without this token. |
| `STRIPE_SECRET_KEY` | Optional on web unless you use `/api/v1/cards/.../transactions` or live Issuing from API. |
| `STRIPE_SKIP_ISSUING` | Set `1` on web to skip Stripe in API routes (simulated cards only). |
| `APPROVAL_BASE_URL` / `NEXT_PUBLIC_SITE_URL` | Used by the shared engine for outbound approval links when MCP hits the API path (primary: set on MCP; web engine uses `APPROVAL_BASE_URL` then `NEXT_PUBLIC_SITE_URL`). |
| `MANDATE_ALLOW_AGENT_APPROVAL` | Set `1` to enable `approve_pending` MCP tool + `POST /api/v1/approvals` for agents (off by default). |

### REST Agent API (same auth as MCP key)

All routes except `GET /api/v1/health` require either:

- Headers `X-Mandate-Agent-Id` + `X-Mandate-Agent-Key` (plaintext MCP key), or  
- `Authorization: Bearer <base64url(agentUuid:plainMcpKey)>`

| Method | Path | Body / query |
|--------|------|----------------|
| `GET` | `/api/v1/health` | — |
| `GET` | `/api/v1/cards` | List active cards |
| `POST` | `/api/v1/cards` | JSON same as `request_payment` / `create_card` (`amount_cents`, `merchant`, `intent`, `source_context`, `sandbox`, `card_kind`, …) |
| `GET` | `/api/v1/cards/{id}/details` | Non-PCI metadata |
| `GET` | `/api/v1/cards/{id}/balance` | Issued − transactions estimate |
| `GET` | `/api/v1/cards/{id}/transactions?limit=` | Stripe Issuing transactions |
| `POST` | `/api/v1/cards/{id}/close` | `{ "reason": "..." }` |
| `POST` | `/api/v1/approvals` | `{ "token": "apr_...", "decision": "approved"|"denied" }` (requires `MANDATE_ALLOW_AGENT_APPROVAL=1`) |

### CLI (`@mandate/cli`)

```bash
npm run build -w @mandate/cli
export MANDATE_API_URL=http://localhost:3000
export MANDATE_AGENT_ID=<uuid>
export MANDATE_AGENT_KEY=mcp_...
npx mandate cards create --amount-cents 5000 --sandbox
npx mandate cards list
npx mandate setup-mcp --mcp-js /ABS/PATH/new_build/packages/mcp-server/dist/index.js
npx mandate skills-path   # OpenClaw: copy this folder into workspace skills/
```

### OpenClaw / AgentSkills

- Bundled skill: `skills/mandate-payment/SKILL.md` (YAML frontmatter + `metadata.openclaw` gates).
- OpenClaw precedence: workspace `./skills` wins — symlink or copy `skills/mandate-payment` there, or `openclaw skills install` from that path.
- Optional project path: `.agents/skills/mandate-payment/` (per OpenClaw docs).

### MCP server (`packages/mcp-server` — pass via Cursor/Claude MCP config `env`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Same as public URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server secret**. Grants read/write used only by the MCP process. |
| `MCP_AGENT_ID` | UUID of the agent row from the dashboard |
| `MCP_AGENT_KEY` | Plaintext key shown once when you click "Generate MCP key" |
| `STRIPE_SECRET_KEY` | Stripe **secret** key (`sk_test_...`) |
| `STRIPE_SKIP_ISSUING` | Set to `1` to skip real Issuing calls and return a simulated card id |
| `APPROVAL_BASE_URL` | Public base URL of the dashboard (e.g. `https://app.example.com` or your ngrok URL). Used for magic-link URLs in Slack/WhatsApp messages. |
| `TWILIO_ACCOUNT_SID` | Optional. Twilio SID for outbound WhatsApp. |
| `TWILIO_AUTH_TOKEN` | Optional. Twilio auth token. |
| `TWILIO_WHATSAPP_FROM` | Optional. Twilio sender, e.g. `whatsapp:+14155238886`. |
| `MANDATE_ALLOW_AGENT_APPROVAL` | Set `1` to expose the `approve_pending` MCP tool (discouraged in production). |

Never put `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` in client-side code or in the LLM context.

## Run locally

```bash
cd new_build
npm install
supabase start
supabase db reset   # applies supabase/migrations
```

Copy keys from `supabase status` into `apps/web/.env.local`.

```bash
npm run dev -w web
# open http://localhost:3000 — sign up, create an agent, configure mandate, generate MCP key
```

Build everything:

```bash
npm run build
```

This runs `mandate-engine` → `mcp-server` → `cli` → `web`.

Build the MCP server only:

```bash
npm run build -w @mandate/mcp-server
```

For Slack/WhatsApp inbound webhooks during development, expose the Next.js dev server with `ngrok http 3000` and set:

- Slack slash command URL → `https://<ngrok>/api/webhooks/slack`
- Twilio WhatsApp inbound URL → `https://<ngrok>/api/webhooks/whatsapp`
- `APPROVAL_BASE_URL=https://<ngrok>` in the MCP server env.

## Cursor / Claude MCP configuration

Add a stdio server (paths absolute on your machine):

```json
{
  "mcpServers": {
    "mandate-payment": {
      "command": "node",
      "args": ["/ABS/PATH/TO/new_build/packages/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "http://127.0.0.1:54321",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SERVICE_ROLE_KEY",
        "MCP_AGENT_ID": "YOUR_AGENT_UUID",
        "MCP_AGENT_KEY": "mcp_....",
        "STRIPE_SECRET_KEY": "sk_test_...",
        "STRIPE_SKIP_ISSUING": "1",
        "APPROVAL_BASE_URL": "https://your-ngrok-or-domain",
        "TWILIO_ACCOUNT_SID": "ACxxxx",
        "TWILIO_AUTH_TOKEN": "xxxx",
        "TWILIO_WHATSAPP_FROM": "whatsapp:+14155238886"
      }
    }
  }
}
```

## Tools exposed to the agent

### `request_payment`

```json
{
  "amount_cents": 6500,
  "merchant": "digitalocean",
  "intent": "Renew DigitalOcean droplet to keep production site online for next month",
  "source_context": "Email from DigitalOcean billing received 2026-05-13T09:00Z, msg-id=...",
  "card_kind": "single_use",
  "subscription_period_days": 30
}
```

- `card_kind="single_use"` (default) → per-authorization card sized to `amount_cents`.
- `card_kind="subscription_lock"` → merchant-locked card with a monthly limit, `expires_at` set to `now + subscription_period_days` (default 30).
- `justification` is optional. If omitted, the ledger uses `intent`.
- On policy failure: `PolicyViolation: ...` (model should surface to human, **not** retry blindly).
- On approval-required: the tool blocks up to `approval_timeout_seconds` (default 180) while Slack/WhatsApp wait for a human reply.
- `sandbox: true` on `request_payment` / `create_card` forces **shadow** for that call even when the mandate is live.
- On success: JSON includes **`card_id`** (same as `stripe_card_id`) plus optional **`internal_card_id`** (row in `agent_cards`).

### AgentCard-compatible MCP tools

| Tool | Role |
|------|------|
| `create_card` | Alias of payment flow with defaults for `intent` / `source_context`; default merchant token **`agentcard`** — add it to the mandate allowlist or pass `merchant`. |
| `list_cards` | Same as `list_active_cards`. |
| `close_card` | Same as `cancel_card` but accepts `card_id`. |
| `get_card_details` | last4, expiry, status, **no PAN/CVV**. |
| `check_balance` | Issued amount minus Stripe Issuing transactions (estimate). |
| `list_transactions` | Stripe Issuing transactions for the card. |
| `approve_pending` | Token decision (only if `MANDATE_ALLOW_AGENT_APPROVAL=1`). |

### `list_active_cards`

Returns the agent's active subscription-lock cards so the model can avoid re-minting duplicate trials.

### `cancel_card`

Cancels an issued card (Stripe `status=canceled` + `agent_cards.status=cancelled`). Used when the human decides to drop a subscription.

## Approval flow (Slack + WhatsApp)

1. Agent calls `request_payment` with amount above `require_approval_above_cents` (or `always_require_approval=true`).
2. MCP inserts `pending_approvals` row with a random token, then:
   - Posts a Slack message via the configured incoming webhook with Approve / Deny buttons (URLs to `/approve/[token]?d=approve|deny`).
   - Sends a WhatsApp message via Twilio with the same magic links plus a `YES <token>` / `NO <token>` reply hint.
3. Human decides via:
   - Slack button (opens `/approve/[token]?d=approve`).
   - Slack slash command `/mandate approve <token>` → `/api/webhooks/slack`.
   - WhatsApp reply `YES <token>` or `NO <token>` → `/api/webhooks/whatsapp` (Twilio).
   - Dashboard "Pending approvals" buttons.
4. All paths call the `decide_pending_approval` Postgres RPC (security-definer, token-scoped). The MCP tool polls until status leaves `pending` or the configured timeout fires.
5. On `approved` the flow falls through to card issuance; on `denied`/`timeout` the agent receives a `PolicyViolation` with an actionable message.

## Shadow-mode demo script

1. In the dashboard, create an agent with **shadow mode on**, allow `aws,digitalocean`, set per-request $100 / monthly $500.
2. Generate an MCP key, wire the MCP server into Cursor/Claude with `STRIPE_SKIP_ISSUING=1`.
3. Ask the agent: *"Please pay our $40 DigitalOcean invoice — we got a renewal email this morning."* The model calls `request_payment` with a structured intent. The dashboard immediately shows the row under **Shadow this month** with a green `shadow_approved` badge — no Stripe card is created.
4. After a few days of this, flip **shadow_mode off**. The same tool call now mints a real Issuing card.

## Stripe Issuing caveat

Issuing objects and requirements differ by account and country. This repo issues a **test** virtual card. `single_use` uses a per-authorization limit equal to the approved cents amount; `subscription_lock` uses a monthly limit with `expires_at` tracked on `agent_cards`. If Stripe returns an error, the ledger records `stripe_failed` and the tool responds with a human-readable `PolicyViolation`.

## Security model (v0.15)

- Dashboard users are constrained by **RLS** on `agents`, `agent_mandates`, `agent_mcp_keys`, `pending_approvals`, and `agent_cards`.
- `payment_ledger` has **no** insert policy for `authenticated`; inserts come from the MCP server using the **service role** after policy checks.
- The `decide_pending_approval` RPC is `security definer` and token-scoped — anyone holding a magic link can decide that single pending approval and nothing else. Treat the URLs as one-time codes.
- The Slack and WhatsApp webhook routes call the same RPC server-side using the service role; we recommend setting `SLACK_VERIFICATION_TOKEN` and configuring Twilio request validation in production.

## Deploy to Cloudflare (OpenNext)

The Next.js app uses **`@opennextjs/cloudflare`** and deploys as a **Worker** with Wrangler. Use **`npm run build:cf`** on Cloudflare CI (skips MCP/CLI) and deploy from **`apps/web`**.

**Dashboard:** Workers Builds from Git — root directory `/`, build `npm ci && npm run build:cf`, deploy `cd apps/web && npx wrangler deploy`. Set `CLOUDFLARE_API_TOKEN` / account for non-interactive deploys.

Full checklist: **[docs/CLOUDFLARE.md](docs/CLOUDFLARE.md)** · one-liner: `npm run deploy:cf` (after `wrangler login`).

## Roadmap → v0.2

- Stripe Issuing `authorization.request` webhook so we can authorize/decline live attempts in real time (currently we rely on the spending controls).
- Multi-tenant org accounts + per-team mandates.
- A background worker to auto-expire `subscription_lock` cards via the Stripe API.
- Audit export (CSV/JSON) of ledger + approvals.
# AgentCash
