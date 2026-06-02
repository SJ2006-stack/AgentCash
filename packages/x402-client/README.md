# @agentcash/x402-client

AgentCash **wallet + CLI v0** — BYOK local wallet, Base USDC x402 payments, receipts on disk.

Uses [@x402/fetch](https://www.npmjs.com/package/@x402/fetch), [@x402/evm](https://www.npmjs.com/package/@x402/evm), [@x402/core](https://www.npmjs.com/package/@x402/core), and [viem](https://viem.sh).

## Quickstart

From the monorepo root:

```bash
npm install
npm run build -w @agentcash/x402-client

# First run: create local wallet + accept ToS stub
npx agentcash wallet create --agree-tos
npx agentcash wallet info
npx agentcash doctor
```

### Network defaults

| Flag / env | Network |
|------------|---------|
| *(default)* | **Base mainnet** |
| `--testnet` | Base Sepolia |
| `X402_NETWORK` | Override slug |

### Fund and pay

Deposit USDC **directly** to your agent wallet address (shown in `wallet info`) — no custodial deposit hop.

```bash
# Testnet
npx agentcash fund wait --testnet --min 0.01
npx agentcash pay --testnet --url http://localhost:4021/weather --agree-tos

# Mainnet (~$0.01 USDC per call)
npx agentcash fund wait --min 0.01
npx agentcash pay --url https://weather.hugen.tokyo/weather/current --agree-tos
```

Receipts append to `~/.agentcash/receipts.jsonl` (no prompts or API bodies stored).

## CLI commands

| Command | Description |
|---------|-------------|
| `wallet create` | Create `~/.agentcash/wallet.key` (600), backup warning + SHA256 checksum |
| `wallet info` | Address, balances, facilitator, deposit address |
| `wallet chains` | Chain list (`[BASE]` text UI; Ethereum coming soon) |
| `wallet modes` | Wallet backends (BYOK default; CDP optional) |
| `fund wait` | Poll USDC until `--min` or timeout; gas warning if USDC but no ETH |
| `pay` | x402 paid fetch + receipt |
| `quote <task> --budget N` | Dry-run subtasks from registry (no spend) |
| `doctor` | Wallet, RPC, facilitator, balances, registry |
| `export-key` | Type `export my key` + 5s countdown |
| `receipt <id>` | Show receipt JSON |
| `replay --receipt <id>` | Re-fetch URL without re-paying |
| `session register` | Local session file stub (no JWT server) |

Global flags: `--testnet`, `--agree-tos`.

Bin names: `agentcash` (primary), `agentcash-x402` (alias).

## Wallet modes

| Mode | Status | Notes |
|------|--------|-------|
| `evm-private-key` | **Default** | `~/.agentcash/wallet.key` or `EVM_PRIVATE_KEY` |
| `cdp-server` | Optional | Set `X402_WALLET_MODE=cdp-server` + CDP env vars |
| `cdp-embedded` | Stub | Browser only |
| `wallet-connect` | Stub | Future |
| `solana` | Not in v0 | Stub |

CDP is **not** auto-selected when keys are present — opt in explicitly.

## Facilitator

Default: **Coinbase x402 (CDP)** for Base USDC.

| `X402_FACILITATOR` | URL |
|--------------------|-----|
| `cdp` (default) | `https://api.cdp.coinbase.com/platform/v2/x402` |
| `x402org` | `https://x402.org/facilitator` (testnet-friendly) |

Override with `X402_FACILITATOR_URL`.

## Environment

| Variable | Purpose |
|----------|---------|
| `AGENTCASH_ENV` | `dev` \| `staging` \| `prod` — registry/API base URLs |
| `AGENTCASH_NO_TELEMETRY` | Opt out of usage events |
| `AGENTCASH_POSTHOG_KEY` | Enable telemetry stub when set |
| `X402_FACILITATOR` / `X402_FACILITATOR_URL` | Facilitator selection |
| `RPC_URL` / `ALCHEMY_KEY` | Custom RPC |

See [`.env.example`](./.env.example).

**Security:** never commit `.env` or private keys. `export-key` is intentionally high-friction.

## First run

On first command, the CLI discloses optional telemetry and prompts for a **ToS stub** (or pass `--agree-tos`). Set `AGENTCASH_NO_TELEMETRY=1` to skip telemetry collection when a PostHog key is configured.

## Programmatic use

```typescript
import {
  loadAgentCashEnv,
  createPaymentSigner,
  buildPaidFetch,
} from "@agentcash/x402-client";

const env = await loadAgentCashEnv({ testnet: false });
const adapter = await createPaymentSigner(env);
const { fetchWithPayment } = buildPaidFetch(adapter);
const res = await fetchWithPayment("https://example.com/paid");
```

## Architecture

```
~/.agentcash/wallet.key → EvmPrivateKeyAdapter → x402Client → wrapFetchWithPayment
                              ↓
                    ~/.agentcash/receipts.jsonl
```

## Stubs (v0)

- `quote` — registry dry-run only; no router synthesis
- `session register` — local JSON file only
- PostHog `track()` — no-op unless `AGENTCASH_POSTHOG_KEY` set
- Solana, WalletConnect, CDP embedded, web dashboard, JWT auth server
