# Deploy on Cloudflare (OpenNext + Workers)

This app uses [**OpenNext for Cloudflare**](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`). The Next.js app in `apps/web` builds to a **Worker** (`.open-next/worker.js` + static assets under `.open-next/assets`), deployed with **Wrangler**.

> **Product note:** This is a **Workers**-style deployment (serverful Worker + asset binding), not a classic “static HTML only” GitHub Pages site. In the Cloudflare dashboard you connect the Git repo to a **Worker** (Workers Builds) or use the **Pages** product only if it supports your Worker + deploy command flow—see [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).

## AgentCash hostnames (DNS)

Target subdomain map (**`agentcash.tech`** → landing, **`app.`** → product, **`api.`** → APIs, **`docs.`**, **`auth.`**, **`status.`**) is maintained in **`Private.md`** at the repo root (local, gitignored) and mirrored in **`Private.md.example`** (committed). Point Cloudflare DNS, custom domains on the Worker, and Supabase auth redirect URLs to match that map when you wire production.

## Prerequisites

- Node **22+** (repo has `.node-version` and `engines` in `package.json`).
- Cloudflare account; [Wrangler](https://developers.cloudflare.com/workers/wrangler/) authenticated (`wrangler login` locally, or API token in CI).

## Monorepo: always install at the **repository root**

`@mandate/mandate-engine` is a workspace package. Cloudflare’s build **root directory** must be the **monorepo root** (where the root `package-lock.json` lives), **not** `apps/web` alone.

```bash
npm ci
```

## Build commands

| Goal | Command |
|------|---------|
| **Full monorepo** (local / full CI) | `npm run build` — builds engine, MCP server, CLI, then OpenNext web |
| **Cloudflare only** (faster on Workers/Pages CI) | `npm run build:cf` — builds `@mandate/mandate-engine` then `npm run build:cf -w web` (`opennextjs-cloudflare build`, which runs `next build` + Worker bundle) |

OpenNext runs **`npm run build`** inside `apps/web`, so that script must be plain **`next build`**. The Cloudflare bundle is produced by **`npm run build:cf -w web`** (`opennextjs-cloudflare build`), which calls `next build` then packages the Worker.

## Cloudflare Workers Builds (Git) — recommended

Create or open a **Workers** project → **Settings** → **Builds** (connect Git).

| Setting | Value |
|--------|--------|
| **Root directory** | `/` (repository root) |
| **Build command** | `npm ci && npm run build:cf` |
| **Deploy command** | `cd apps/web && npx wrangler deploy` |

Why `build:cf`: the MCP server and CLI are not needed inside Cloudflare; skipping them speeds up CI and avoids extra native/tooling surprises.

If your UI offers a **single** “Build & deploy” command, use:

```bash
npm ci && npm run build:cf && cd apps/web && npx wrangler deploy
```

**Do not** run `wrangler deploy` from the monorepo root — Wrangler will error (“workspace instead of targeting a specific project”). Config file: `apps/web/wrangler.jsonc`.

### Non-interactive / CI authentication

For Git-based builds, configure [Workers Builds API token](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) in the dashboard (recommended), or set:

- `CLOUDFLARE_API_TOKEN` — token with **Workers Scripts:Edit** (and account scope as required)
- `CLOUDFLARE_ACCOUNT_ID` — your account id

Wrangler picks these up for `wrangler deploy` without `wrangler login`.

## Environment variables (production / preview)

Configure **Variables and Secrets** on the **Worker** (Workers & Pages → your project → **Settings** → **Variables and Secrets**). They are exposed as the Worker `env` object at runtime.

The app reads them via **`getCloudflareContext().env`** (see `src/lib/env/worker-env.ts`), not only `process.env`, so values you set only in the Cloudflare dashboard are still visible to Next.js middleware, Server Components, and route handlers—avoiding empty `NEXT_PUBLIC_*` values that can occur when Next inlines env at build time without those keys.

Set everything the app needs at **runtime**:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (use **Secret** type in the dashboard)
- `STRIPE_SECRET_KEY`, `STRIPE_SKIP_ISSUING` (optional)
- `APPROVAL_BASE_URL` or `NEXT_PUBLIC_SITE_URL` — **public URL of this deployment** (for approval links and MCP `APPROVAL_BASE_URL`)
- Optional: Twilio, `SLACK_VERIFICATION_TOKEN`, `MANDATE_ALLOW_AGENT_APPROVAL`
- Optional **rate limits** (plain numbers): `AGENT_API_IP_MAX_PER_MIN` (default 600), `AGENT_API_READ_LIGHT_PER_MIN` (120, e.g. list cards), `AGENT_API_READ_HEAVY_PER_MIN` (40, Stripe-read routes), `AGENT_API_WRITE_PER_MIN` (25, mint/close/approve). Set any to `0` to disable that bucket. Per-isolate in memory on Workers.
- Optional: `MCP_KEY_ROTATE_MAX_PER_HOUR` (default 8) for dashboard MCP key rotation.

`NEXT_PUBLIC_*` are also written into the HTML shell for the browser Supabase client (`app/layout.tsx`), so the dashboard does not need a separate “build-only” copy unless you prefer duplicating them for `next build` in CI.

See `apps/web/.env.local.example` and root `README.md`.

## Local preview (Worker runtime)

After a successful build:

```bash
cd apps/web
npx wrangler dev
```

Or from root: `npm run preview -w web` (runs OpenNext build + preview).

## Deploy from your laptop

```bash
npm run deploy:cf
```

(Runs `build:cf` then `cd apps/web && npx wrangler deploy` — requires `wrangler login` or env tokens.)

## Worker name

`wrangler.jsonc` sets `"name": "agentcash"`. It must be unique in your account; change if there is a collision.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `Can't resolve '@mandate/mandate-engine'` | Run `npm ci` at **monorepo root**, not under `apps/web` only. |
| Wrangler “workspace root” error | Run deploy **from `apps/web`** (or pass `--config apps/web/wrangler.jsonc` from root if your Wrangler version supports it). |
| Build slow on Cloudflare | Use `npm run build:cf` instead of full `npm run build`. |
| Peer / Next version errors | `apps/web` uses Next `>=15.5.18` for `@opennextjs/cloudflare`. |

## Files reference

- `apps/web/wrangler.jsonc` — Worker + assets
- `apps/web/open-next.config.ts` — OpenNext Cloudflare adapter config
- `apps/web/next.config.ts` — `initOpenNextCloudflareForDev()` for local dev with bindings
- `apps/web/public/_headers` — long-cache for `/_next/static/*`
