# @agentcash/registry

Curated **x402-capable API listings** for AgentCash task routing. Entries are **listed, not endorsed** — AgentCash does not guarantee availability, pricing, or ToS compliance of third-party providers.

## Registry format

Each entry in `registry.yaml` includes:

| Field | Description |
|-------|-------------|
| `slug` | Stable ID used by the task router (forced tool schema) |
| `name` | Human-readable label |
| `url` | Provider homepage |
| `endpoint` | x402-paid HTTP URL |
| `price_usdc` | Estimated USDC per call (until probed) |
| `capability` | One of: `search`, `data`, `media`, `compute`, `scrape`, `enrich`, `generate`, `verify` |
| `chains` | Supported chains (v0: `[base]`) |
| `status` | `confirmed` \| `unverified` \| `coming_soon` |

## Adding an API (opt-in PR process)

1. **Opt-in only** — provider or founder opens a PR; we do not crawl public manifests for launch.
2. Include: slug, endpoint, capability, estimated `price_usdc`, link to provider ToS, and proof of x402 (402 response or paid test log).
3. CI / maintainers run `probePrice(slug)` before merging; merge only if probe succeeds or entry stays `unverified`.
4. Use **`Referer: agentcash/v0`** on probes and routed fetches so providers can identify AgentCash traffic.

## Price probes

`probePrice(entry)` issues `HEAD` then `GET` with a 60s in-memory cache. On HTTP 402, it parses common x402 payment hints from headers/body when present.

## Programmatic use

```ts
import { loadRegistry, findByCapability, probePrice } from "@agentcash/registry";

const registry = loadRegistry();
const searchApis = findByCapability(registry, "search");
const live = await probePrice(registry.entries[0]);
```

## Hero entry

`brave-search-v1` is the demo **hero** dependency but remains **`unverified`** until a maintainer completes a paid x402 probe on Base.

`weatherapi-v1` (`weather.hugen.tokyo`) is **`confirmed`** in-repo because Day 1 x402-client docs and defaults document a working Base mainnet weather call (~$0.01 USDC).
