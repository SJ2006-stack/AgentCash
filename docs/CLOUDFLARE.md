# Deploy on Cloudflare (OpenNext + Workers)

The Next.js app in `apps/web` uses [**OpenNext for Cloudflare**](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`). It builds to a **Worker** (`.open-next/worker.js` + static assets) and deploys with **Wrangler**.

## Prerequisites

- Node **22+**
- Cloudflare account; [Wrangler](https://developers.cloudflare.com/workers/wrangler/) authenticated (`wrangler login` locally, or API token in CI)

## Monorepo: install at the repository root

Cloudflare’s build **root directory** must be the **monorepo root** (where `package-lock.json` lives), not `apps/web` alone.

```bash
npm ci
```

## Build commands

| Goal | Command |
|------|---------|
| **Production bundle** | `npm run build` or `npm run build:cf` — runs `opennextjs-cloudflare build` in `apps/web` |

OpenNext runs **`next build`** inside `apps/web`, then packages the Worker.

## Cloudflare Workers Builds (Git)

| Setting | Value |
|--------|--------|
| **Root directory** | `/` (repository root) |
| **Build command** | `npm ci && npm run build:cf` |
| **Deploy command** | `cd apps/web && npx wrangler deploy` |

Single-step alternative:

```bash
npm ci && npm run build:cf && cd apps/web && npx wrangler deploy
```

Run **`wrangler deploy` from `apps/web`** — not the monorepo root. Config: `apps/web/wrangler.jsonc`.

### CI authentication

- `CLOUDFLARE_API_TOKEN` — Workers Scripts:Edit (and required account scope)
- `CLOUDFLARE_ACCOUNT_ID`

## Environment variables

Set **Variables and Secrets** on the Worker. Runtime values are read via `getCloudflareContext().env` (`src/lib/env/worker-env.ts`).

Optional:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL for metadata/links

## Local preview

```bash
cd apps/web
npx wrangler dev
```

Or from root: `npm run preview -w web`.

## Deploy from your laptop

```bash
npm run deploy:cf
```

## Worker name

`wrangler.jsonc` sets `"name": "agentcash"`. Change if there is a name collision in your account.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Wrangler “workspace root” error | Deploy from **`apps/web`**. |
| Peer / Next version errors | `apps/web` uses Next `>=15.5.18` for `@opennextjs/cloudflare`. |
| `Cannot find native binding (@ast-grep/napi)` on Linux CI | `@opennextjs/cloudflare` uses `@ast-grep/napi`. Lockfiles generated on macOS can omit Linux optional bindings ([npm#4828](https://github.com/npm/cli/issues/4828)). `apps/web` pins `@ast-grep/napi-linux-x64-gnu` in `optionalDependencies` so `npm ci` on Cloudflare (linux x64) installs the binding. Commit an updated `package-lock.json` after changing that pin. |

No extra Cloudflare dashboard env vars are required for this fix.

## Files

- `apps/web/wrangler.jsonc` — Worker + assets
- `apps/web/open-next.config.ts` — OpenNext adapter
- `apps/web/next.config.ts` — `initOpenNextCloudflareForDev()` for local dev
