# @agentcash/task-router

AgentCash **task router v0** — decompose natural-language tasks into registry-backed subtasks, quote USDC cost, and execute **sequential** x402 payments.

## CLI

```bash
npm run build -w @agentcash/task-router
npx agentcash quote "research SOL price" --budget 0.20
npx agentcash run "get weather in Tokyo" --budget 0.50 --dry-run
```

The root `agentcash` / `agentcash-x402` binary from `@agentcash/x402-client` also exposes `quote` and `run`.

## Behavior

- **`quote(task, budget)`** — uses Anthropic when `ANTHROPIC_API_KEY` is set; otherwise a deterministic registry heuristic. No payments.
- **`run(task, budget)`** — runs subtasks one at a time (no parallel x402 in v0). Uses `@agentcash/x402-client` for paid fetches with `Referer: agentcash/v0`.
- **Tool schema** — planner may only reference registry slugs (`buildRegistryToolSchema()`).
- **Budget** — warns once at ≥80% projected spend (stub).
- **Synthesis** — v0 stub listing slugs and total USDC.

## Env

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Optional LLM planner |
| `ANTHROPIC_MODEL` | Optional (default `claude-sonnet-4-20250514`) |
| `EVM_PRIVATE_KEY` | Required for paid `run` (same as x402-client) |

## Tests

```bash
npm run test -w @agentcash/task-router
```

See `src/golden-tasks.test.ts` for the five golden scenarios.
