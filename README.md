# AgentCash

AgentCash is pivoting to an **x402 USDC task router** for AI agents. This monorepo currently ships a minimal **Next.js** marketing site (`apps/web`) deployable to **Cloudflare Workers** via OpenNext.

## Repo layout

- **`apps/web`** — Next.js app (landing + `/api/v1/health`)
- **`packages/x402-client`** — Day 1 x402 USDC buyer CLI and wallet adapters
- **`packages/registry`** — Curated x402 API registry (`registry.yaml`)
- **`packages/task-router`** — Quote/run task router v0 (`agentcash` CLI)

## Day 1 — wallet + CLI (x402 USDC)

BYOK local wallet at `~/.agentcash/wallet.key`, Base mainnet default, Coinbase x402 facilitator, receipts on disk.

```bash
npm run build:x402

# Create wallet, check health, pay (testnet example)
npm run agentcash -- wallet create --agree-tos --testnet
npm run agentcash -- doctor --testnet
npm run agentcash -- pay --testnet --url http://localhost:4021/weather --agree-tos
```

Optional: copy `packages/x402-client/.env.example` → `.env` for RPC/facilitator overrides. CDP wallet mode is opt-in only.

Full command reference: **[packages/x402-client/README.md](packages/x402-client/README.md)**.

## Prerequisites

- Node **22+**

## Local development

```bash
npm install
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000).

## Build & deploy (Cloudflare)

```bash
npm run build:cf
npm run deploy:cf   # requires wrangler login or CI tokens
```

See **[docs/CLOUDFLARE.md](docs/CLOUDFLARE.md)** for Workers Builds settings.

## Private notes

Copy **`Private.md.example`** → **`Private.md`** at the repo root for local guardrails (gitignored).
