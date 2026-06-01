# AgentCash

AgentCash is pivoting to an **x402 USDC task router** for AI agents. This monorepo currently ships a minimal **Next.js** marketing site (`apps/web`) deployable to **Cloudflare Workers** via OpenNext.

## Repo layout

- **`apps/web`** — Next.js app (landing + `/api/v1/health`)

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
