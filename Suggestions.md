# AgentCash — product discovery (founder Q&A)

This is a **living** document for product strategy, not implementation. Another agent is building Day 1 multi-wallet x402 code; your answers here steer what ships, what we promise publicly, and what we defer.

**How to use it:** Answer **inline** under each question, or add an **Answers** subsection at the end of each section. Partial answers are fine — mark unknowns as `TBD` and note blockers. This file will evolve across discovery rounds.

**Status (2026-06-01):** Founder provided a **full decision pass** for §1–§7. See **`## Decisions log`** and **`#### Founder answer (2026-06-01)`** under each topic; **`## Engineering handoff`** at the end. Remaining **Needs design** items: hero x402 endpoint confirmation, facilitator URL, 48h ops (LLC, ToS).

## Decisions log (2026-06-01)

| Topic | Decision | Status |
|-------|----------|--------|
| **Custody** (first `npx` run) | Dual-key: **KEY_1** signing key local only (`~/.agentcash/wallet.key`); **KEY_2** session/auth key server-side (JWT-issuing, never co-signs). Agent pays x402 autonomously after session bound. | Decided |
| **Auth legitimacy** | Challenge–response on first run: server nonce → local agent signs with same key that signs x402 → session JWT. No WebAuthn in v0. | Decided |
| **Default chain** | Deposit address **is** the user's locally generated agent wallet (no custodial hop). Chain picker: **Base mainnet** default, **Base Sepolia** via `--testnet`, **Ethereum** logo greyed "coming soon". | Decided |
| **Gas / funding UX** | User pays gas; no relayer Day 1. CLI: wallet address → QR → poll USDC → ready; explicit error if USDC but no ETH + `bridge.base.org` link. | Decided |
| **Demo wallet / `npx` funding** | No subsidized or shared demo wallet. ~**$0.10** suggested starter balance; cheapest registry API ≤$0.02/call. | Decided |
| **Auth before first pay** | No email/OAuth for spend. Wallet creation = auth event; rate-limit by wallet address; 10 free routing-only calls (no USDC) for new wallets. | Decided |
| **CDP vs BYOK** | BYOK default; CDP optional for facilitator only, not custody. No Coinbase account required. Enterprise: `--signer-url` hook only (Fireblocks/Safe = BYOK). | Decided |
| **Facilitator** | **Coinbase x402 facilitator** for Base USDC at launch. >2s: show "Confirming payment…"; >5s: warn + proceed optimistically with tx hash logged. | Decided |
| **Solana / multi-chain** | **Out of scope v0.** README: Base mainnet + Base Sepolia only; Solana v1. | Decided |
| **Receipts** | Local `~/.agentcash/receipts.jsonl` — tx hash, receipt ID, slug, amount, status; **never** prompt/response bodies. `receipt` / `replay` CLI. | Decided |
| **Key export** | Allowed with phrase + 5s countdown; backup checksum at generation; user responsible for recovery. | Decided |
| **Environments** | `AGENTCASH_ENV=dev\|staging\|prod` switches facilitator + registry URLs. CI / founder demo / user wallets separated; no public pool. | Decided |
| **Registry inclusion** | Live x402 + USDC on Base + structured JSON output. Founder-curated first 10; no crawl; opt-in PRs after. | Decided |
| **Registry ops** | 3 failures/10min → warning + 50% rank drop, no auto-deprecate, no refunds. `Referer: agentcash/v0`. Maintainer-assigned tags (8 caps). | Decided |
| **Registry legal** | "Listed, not endorsed"; 48h takedown to `legal@agentcash.tech`. Mirrors shown with price compare; semver + `deprecated_at` on entries. | Decided |
| **Router model** | User `ANTHROPIC_API_KEY` only; AgentCash supplies prompt + registry tool schema. | Decided |
| **Router execution** | Sequential pays v0; per-task `--budget`; 80% → ask once for more; quote/dry-run **Day 1**; 60s task timeout. | Decided |
| **Router grounding** | Forced JSON tool IDs from registry; hallucinated IDs → closest match + log. | Decided |
| **GTM / tweet** | `npx agentcash run "…"` with visible USDC lines + total; pinned `npx agentcash@0.1.0`. | Decided |
| **Mainnet claim** | Ship **Base mainnet Day 1**; do **not** promise "mainnet in 48 hours." | Decided |
| **License** | **MIT** — fork-friendly; moat = curation + `npx` distribution. | Decided |
| **Web vs CLI** | Hero CTA: `npx agentcash`. App = dashboard later (receipts, registry browse); CLI owns execution + keys. | Decided |
| **Auth (product)** | **No login** for paid CLI actions v0; auth only for future dashboard sync. All task state local. | Decided |
| **Monetization** | $0 year one — no take rate; future: sponsored registry placement or enterprise hosted SLA. | Decided |
| **Hosted API** | **Local CLI only v0** — no `api.agentcash.tech` `/v1/task`. | Decided |
| **Telemetry** | PostHog events (`install`, `wallet_created`, `wallet_funded`, `first_payment_sent`, `task_completed`, `task_failed`); opt-out `AGENTCASH_NO_TELEMETRY=1`. | Decided |
| **Compliance** | Local-only data; ToS click-through; API key scrubber `sk-ant-*`; registry description sanitizer; LLC before mainnet marketing. | Decided |
| **Abuse playbook** | No demo wallet drain; rate-limit 10 tasks/hour/wallet; ban wallet from registry on abuse, don't pause `npx` globally. | Decided |
| **Week-one metric** | **50** self-funded paid end-to-end tasks; pivot signal if <10 with good installs. | Decided |
| **Scope cuts (slip)** | Cut order: web dashboard → Solana → full docs → registry UI → synthesis polish → multi-wallet → status page. | Decided |
| **Hero registry** | `brave-search-v1` hero; fallback `serper-search-v1`; must E2E test with real USDC before launch. | Needs design |
| **Facilitator URL** | Use Coinbase x402 facilitator — exact endpoint URL to confirm in engineering spike. | Needs design |
| **48h founder actions** | Confirm Brave/Serper x402 live; LLC in progress; sign off ToS before first mainnet user. | Needs design |

**Product read (2026-06-01):** AgentCash is the **simplest path from zero to a self-funding agent** — BYOK wallet on Base, local receipts, founder-curated x402 registry, sequential router with **quote-before-pay**, no demo faucet. Brand line: *"AgentCash is the payment layer for developers who need their agents to pay for APIs without human approval."* Forbidden in copy: bank, guaranteed, trustless, autonomous, decentralized.

---

## 1. Day 1 — Wallet & payments

### Custody model for the first public demo

The x402 flow assumes an agent can pay USDC on demand. Day 1 code will support multiple wallets, but the *product* still needs a default story for who generates, stores, and rotates keys.

**🔴 Blocker:** For the first `npx agentcash` (or equivalent) run, who holds the signing keys — the user’s machine only, a CDP-managed wallet you provision, a server-side demo wallet you fund, or a hybrid? What is the exact user-visible sentence when they first pay?

#### Founder answer (2026-06-01)

On first run, **generate and keep the transaction-signing key on the user’s machine only**. Maintain a **second key in AgentCash’s database** used for authentication — proving the user/session is legitimate before the product trusts them. After that gate passes, **let the agent sign and send x402 payments on its own** without per-payment human approval.

#### Implications

- **`packages/x402-client`:** Day 1 adapters should default to a **local signer** (EVM private key / secure enclave file) for x402; do not assume CDP or a server-held signing key for micropayments.
- **Web app:** Auth return flow must bind **identity** (server key / session) to **wallet capability** (local agent key) without ever requiring the user to paste a signing key into the browser if avoidable.
- **Auth return:** Post-login, issue credentials that mean “this human is allowed to run an agent wallet on this device” — separate from holding USDC signing material on the server.
- **Security:** Clear split: **auth secret** (rotatable, revocable, server-side) vs **funds secret** (local, exportable with friction). Document what happens if auth is revoked while USDC remains in the local wallet.
- **Agent autonomy:** Product copy can promise “agent pays APIs automatically” only after auth + local wallet are set up — not a shared demo pool.


**Resolved (2026-06-01):** Only the **local agent key** signs x402 transactions; the server key never co-signs or relays. Legitimacy via **challenge–response** (server nonce → local signature → session JWT). CLI first-pay copy: `AgentCash: Paying 0.04 USDC → api.example.com/search (tx: 0xabc…def). No further approval needed this session.` Web: `Agent paid $0.04 to Example Search. View receipt ↗`

#### Open follow-ups (remaining)

- _None for v0 — auth JWT server implementation is an engineering stub until dashboard sync._

- ~~Which key **actually signs x402 transactions** — local agent key only, or can the server ever co-sign or relay?
- If the server key is “auth only,” what crypto proves legitimacy (JWT, challenge–response, device binding, WebAuthn)?
- What is the **exact first-pay sentence** shown in CLI vs web when the agent spends without another prompt?

### Testnet vs mainnet for “it works”

Testnet demos are cheap and safe; mainnet demos are credible for USDC and x402 facilitators that only care about real money.

**🔴 Blocker:** What is the **default chain/network** on first run (Base Sepolia, Base mainnet, other)? Under what conditions do you flip a user to mainnet without them reading a doc — never, after explicit flag, after KYC, or after they paste their own funded address?

#### Founder answer (2026-06-01)

Do not force a single hidden default. **Show chain logos**, let the user choose where they will pay from, display a **deposit address** for that chain, **surface when funds arrive**, then **move USDC to wherever the user wants** (agent wallet, another chain, etc.). Mainnet vs testnet becomes a consequence of which logo/chain they pick, not a doc they must read first.

#### Implications

- **`packages/x402-client`:** Needs **per-network deposit detection** (USDC balance / transfer events) and a defined **sweep or route** step after confirmation — not only “pay x402 from existing local key.”
- **Web app:** First-run UI is **funding wizard** (chain picker → QR/address → “waiting for payment” → “received”) before registry/router features.
- **Auth return:** Optional until deposit completes, unless abuse requires login before showing deposit addresses — decide explicitly.
- **Security:** Deposit addresses must be **unique per user/session** or clearly labeled shared infrastructure; document custody of inbound funds before sweep.
- **Product:** No silent mainnet flip — user’s chain choice is the consent moment for real money.


**Resolved (2026-06-01):** Deposit address **is** the user's locally generated agent wallet — **no custodial hop**. User pays gas (no relayer Day 1). Supported: **Base mainnet** (default), **Base Sepolia** (`--testnet`); **Ethereum mainnet** shown as "coming soon" (greyed); other chains decorative only.

#### Open follow-ups (remaining)

- ~~Is the shown address an **AgentCash-controlled deposit** (custodial hop) or the **user’s eventual agent wallet** on that chain?
- Who pays **gas for the post-deposit transfer** (sweep to agent wallet / other chain) — user, subsidized relayer, or bundled fee?
- For Day 1, which **2–3 chain logos** are actually supported vs decorative?

### Demo wallet in `npx` — funding and limits

A zero-config demo often ships with a pre-funded wallet so the tweet works in under 60 seconds.

**🔴 Blocker:** If you ship a shared demo wallet in `npx`, what are the per-run spend cap, daily cap, and abuse controls (IP rate limit, invite code, captcha)? Who refills it when it drains at 2am during a viral spike?

#### Founder answer (2026-06-01)

**No free dollars** and **no shared demo wallet** funded by AgentCash. Instead, expose a **minimal set of x402 APIs** in onboarding and tell users they need roughly **$0.10 (10¢) on-chain** — the practical minimum to see a real x402 payment succeed.

#### Implications

- **`packages/x402-client`:** CLI `pay` / first-run flow assumes **user-funded** USDC; remove design paths that depend on a founder-refilled pool or per-IP spend caps on shared keys.
- **Web app:** Hero demo is “connect/fund → one cheap x402 call,” not “instant paid task with zero balance.”
- **Auth return:** Abuse controls shift from **wallet drain** to **API/registry rate limits** and optional auth before high-volume routing — not subsidized gas/USDC.
- **Security:** Eliminates overnight **treasury drain** risk; increases **support friction** (“why doesn’t it work”) if funding UX is unclear.
- **GTM:** Tweet moment must show **user sending 10¢**, not magic money — align expectations with x402’s real economics.


**Resolved (2026-06-01):** **$0.10** is a **suggested starter balance** (not per-call minimum); cheapest registry entry ≤$0.02/call. Canonical first payment: **search or weather** API with fast human-readable output — **Brave Search x402** if live, else a **confirmed** demo endpoint you control; hero must not depend on unverified third parties. **Lightweight auth:** wallet creation on first `npx` run; rate-limit by wallet address; **10 free routing-only calls** (no USDC) before registry queries for new wallets.

#### Open follow-ups (remaining)

- ~~Is **10¢** a hard minimum per call, a suggested starter balance, or the cheapest listed API in the registry?
- Which **one x402 API** is the canonical “first payment” in docs and `npx` output?
- Do you still need **auth before first pay** to prevent scripted abuse of your facilitator/router, even without a demo wallet?

### CDP vs bring-your-own-key

Coinbase Developer Platform (and similar) can host wallets; BYO means users paste a private key or use their own signer integration.

For Day 1, is CDP the **only** supported path, the **recommended** path with BYO as escape hatch, or BYO-only with docs for CDP? What happens when CDP is down — hard fail, retry, or fallback wallet?

#### Founder answer (2026-06-01)

**BYOK (bring your own key)** is the better default than depending on Coinbase CDP for everything. Users supply or generate their own signer; CDP may exist later as an optional integration, not the spine of the product.

#### Implications

- **`packages/x402-client`:** Prioritize **EVM private key** (and future WalletConnect) adapters; treat **CDP embedded/server** as optional, not Day 1 critical path.
- **Web app:** Wallet onboarding should not require a Coinbase account; any CDP UI is “advanced / hosted wallet optional.”
- **Auth return:** Identity provider (Supabase, etc.) is independent of CDP; avoid coupling login to Coinbase OAuth unless explicitly chosen.
- **Security:** Users own key-handling risk; AgentCash must ship **strong warnings**, no logging of keys, and clear docs on rotation — especially alongside “key in database” for auth.
- **Resilience:** CDP outage should **not** block core x402 pay flow if BYOK path is healthy.

**Resolved (2026-06-01):** On first run label **KEY_1 (signing key)** at `~/.agentcash/wallet.key` and **KEY_2 (session key)** registered with AgentCash — never call either "your key." CDP may power **facilitator** verification only (facilitator ≠ custody). No managed wallet in year one; enterprise uses `--signer-url` for external signers (Fireblocks/Safe).

#### Open follow-ups (remaining)

- ~~How do **BYOK** and **“key in our database for auth”** coexist without users conflating two secrets — one UI or two labeled keys?
- ~~Is CDP still used for **facilitator** or **on-ramp** while BYOK handles signing?
- ~~For enterprises, is there ever a **managed wallet** exception, or BYOK-only forever?

### Facilitator choice and swap cost

x402 payment verification depends on a facilitator that understands your network and token.

#### Founder answer (2026-06-01)

Commit to **Coinbase's x402 facilitator** for Base USDC at launch. If verification latency is >2s, show `Confirming payment…` with a spinner — do not block the user. If no confirmation within 5s, surface a warning and **proceed optimistically**, logging the tx hash for disputes.

Which facilitator(s) are you committing to for launch (Coinbase, custom, multiple)? If verification latency is >2s, do you block the agent, show “payment pending,” or optimistically call the API?



### Gas and USDC funding UX

Agents care about “can I complete this task”; humans care about “why did my money disappear.”

#### Founder answer (2026-06-01)

First-funding CLI order: (1) `Your agent wallet: 0xabc…def (Base)` (2) QR + address (3) `Waiting for USDC…` polling every 3s (4) `Received 0.10 USDC. Ready to pay APIs.` If USDC present but no native gas: `You have USDC but no ETH for gas. Send at least 0.002 ETH to [address]. Need ETH fast? Try bridge.base.org`.

Walk through the **first funding moment**: does the CLI print a faucet link, QR, bridge instructions, or “send 0.50 USDC to this address”? What error do you show when they have USDC but zero ETH/native gas on that chain?

### Multi-chain scope (Solana and beyond)

USDC on Base is the obvious Day 1 path; Solana x402 ecosystems exist but multiply integration surface.

#### Founder answer (2026-06-01)

**Solana out of scope for v0** — state loudly in README header: `v0 supports Base mainnet and Base Sepolia only. Solana planned for v1.` Do not hedge.

Is Solana **out of scope for v0**, “nice if someone contributes,” or a **Day 1 requirement** because your target APIs or influencers live there? If out of scope, do you say so loudly in README to avoid wrong expectations?

### Failure receipts and supportability

When payment succeeds but the upstream API fails (or vice versa), users will ask for refunds and proof.

#### Founder answer (2026-06-01)

Persist per attempt locally in `~/.agentcash/receipts.jsonl`: `wallet_address`, `tx_hash`, `x402_receipt_id`, `api_slug`, `usdc_amount`, `timestamp`, `http_status`, `error_code`. **Never** store prompt or response body. `npx agentcash replay --receipt <id>` re-fetches the API (not the payment). `npx agentcash receipt <id>` prints explorer link + facilitator receipt ID.

What artifact do you persist per attempt (tx hash, x402 receipt ID, request ID, redacted prompt)? How does a user **replay or dispute** a failed paid call from the CLI without opening a support ticket?

### Key export and wallet recovery

Power users will want to reuse the same wallet across machines; careless export creates theft risk.

#### Founder answer (2026-06-01)

Allow `npx agentcash export-key` with friction: user must type `I understand this key controls real funds` after a **5-second countdown**. Prompt backup of `~/.agentcash/wallet.key` at generation with SHA256 checksum. No CDP recovery — BYOK means user owns backup.

Do you allow exporting the demo wallet private key, and if yes, what friction (typed warning, `I understand`, delay)? For CDP wallets, what is the recovery story if they lose the session?

### Environment separation

Dev, staging, and prod wallets should not share balances or keys.

#### Founder answer (2026-06-01)

Three wallet personalities: **CI bot** (separate seed, tests only), **founder demo** (treat address as public), **user wallet** (per machine, BYOK). No public `npx` pool. `AGENTCASH_ENV=dev|staging|prod` switches facilitator endpoint and registry URL.

How many wallet **personalities** do you maintain (CI bot wallet, founder demo wallet, public npx pool)? Who is allowed to spend from the public pool in non-production environments?

---

## 2. Day 2 — Registry

### Sourcing APIs for the first catalog

#### Founder answer (2026-06-01)

Inclusion bar (all required): **x402 live today**, **USDC on Base**, **deterministic structured output** (JSON preferred; manual wrapper OK if you own it). OpenAPI nice-to-have. **Founder-curated only** for first pass — no automated crawl, no community PRs until 10 solid tested entries.


The registry is only as good as the endpoints agents can actually pay for via x402.

What is your **inclusion bar** for Day 2 — must expose x402 today, must accept USDC on your default chain, must have stable OpenAPI, or “we wrap manually”? Who owns the first pass of URL discovery — you, community PRs, or automated crawl?

### Flaky provider policy

#### Founder answer (2026-06-01)

After **3 failures in 10 minutes**: warning banner + **50% ranking drop** — do **not** auto-deprecate. **No refunds** (x402 cannot guarantee); ToS must state payment success ≠ API success.


Paid calls to flaky APIs burn trust and USDC.

When an endpoint fails 3 times in 10 minutes, do you **auto-deprecate**, downgrade ranking, show a warning banner, or keep billing until the provider fixes it? Do you refund the agent’s payment on your side or is that impossible with x402 semantics?

### Opt-in vs crawl

#### Founder answer (2026-06-01)

**Opt-in only at launch.** Ship `registry.yaml` in repo; providers submit PRs. CLI note: `Know an x402 API that should be listed? → agentcash.tech/submit`.


Crawling x402-capable sites without permission can create legal and reputational risk; opt-in is slower.

Is the registry **opt-in only** for launch, or will you index public x402 manifests without explicit partnership? If crawl, what robots/legal review happens before an entry goes live?

### Attribution and discovery credit

#### Founder answer (2026-06-01)

Send **`Referer: agentcash/v0`** on all routed calls. No on-chain memo v0. Provider claim via GitHub PR + domain proof (TXT or `/.well-known/agentcash.json` with wallet). Dashboard v1.


API owners will ask how they get traffic and whether competitors can bury them.

How do you attribute traffic (referrer header, on-chain memo, dashboard for providers)? Can providers **claim** a listing and edit metadata, and what verification proves they own the endpoint?

### Pricing staleness

#### Founder answer (2026-06-01)

Probe current **402 Payment Required** price on every router request (HEAD/GET); **60s cache max**. If settlement differs from advertised by **>20%**: log, show on receipt, flag listing for manual review.


x402 prices can change with gas, USD rates, or provider whims.

How often do you refresh listed prices — every request, hourly cron, on provider webhook, never (show “estimate”)? What do you do when on-chain settlement differs from the advertised price by more than X%?

### Capability taxonomy

#### Founder answer (2026-06-01)

≤**8 maintainer-assigned tags** for v0: `search` · `data` · `media` · `compute` · `scrape` · `enrich` · `generate` · `verify`. Providers do not self-tag until volume warrants human review.


Agents need to pick tools by intent (“search,” “scrape,” “infer”), not by hostname.

What is your **top-level taxonomy** for v0 (≤10 tags), and who defines it — you, JSON schema in each listing, or LLM-inferred at runtime? How do you prevent tag spam from providers gaming ranking?

### Legal list without partnership

#### Founder answer (2026-06-01)

Ship **"listed, not endorsed"** with real names, **no logos**. **48-hour** takedown SLA from first email to `legal@agentcash.tech` — footer on every registry surface.


You may want a “known good” list before formal deals exist.

Can you ship a **“listed, not endorsed”** legal disclaimer that still names real companies (OpenAI, Anthropic, Brave, etc.) without their logo partnership? What is the takedown SLA when a provider emails “remove us”?

### Duplicate and mirror endpoints

#### Founder answer (2026-06-01)

Show **all mirrors with price comparison** (feature, not bug). Flag identical response signatures as "may share infrastructure." v0: log suspicious mirrors + manual review — don't fully automate malicious-mirror detection.


Multiple gateways may front the same underlying API with different x402 prices.

Do you dedupe by upstream API ID, show all mirrors with price comparison, or pick a single canonical route? How do you detect malicious mirrors that exfiltrate prompts?

### Versioning and breaking changes

#### Founder answer (2026-06-01)

Each entry: `slug`, semver `version`, nullable `deprecated_at`, nullable `migration_slug`. v2 = new entry + deprecate old. Deprecated slug usage → CLI warning + `agentcash migrate` hint.


Providers will ship v2 paths without telling you.

Does each registry entry carry **semver**, `deprecatedAt`, and migration notes? What happens to in-flight agent plans that still reference the old slug?

### Open vs curated registry

#### Founder answer (2026-06-01)

**Founder-curated first 10.** Future PR checks: x402 probe, price sanity (reject >$1/call v0), ToS link required. **Founder approval** on every merge.


A fully open registry scales faster; curation protects quality.

For the first 10 entries, is the registry **writeable by anyone with a PR** or **founder-curated only**? What automated checks run on PR merge (x402 probe, price sanity, ToS link present)?

---

## 3. Days 3–5 — Router intelligence

### Claude vs open model for routing

#### Founder answer (2026-06-01)

**User-supplied `ANTHROPIC_API_KEY` only** for v0 — user pays inference. AgentCash supplies system prompt, tool schema, registry context. `--model-url` for OpenAI-compatible endpoints allowed but unsupported/untested.


The router must decompose tasks, pick registry entries, and synthesize results — model choice affects cost, latency, and quality.

Which model(s) are **allowed** for routing in v0 — Claude only, user-supplied Anthropic key only, local open-weight, or any OpenAI-compatible endpoint? Who pays inference cost for the router itself?

### Budget enforcement semantics

#### Founder answer (2026-06-01)

Budget is **per task** (`agentcash run "…" --budget 0.50`). At **80%** with critical step left: **ask once** with dollar amount (`Task needs ~$0.08 more… Approve? [y/N]`). No silent borrowing; optional `--allow-overage 20%`.


Agents without budgets will overspend; agents with tight budgets will fail mid-plan.

Is the budget **per task**, **per session**, **per calendar day**, or **per wallet**? When the router is 80% through budget but the remaining subtask is critical, do you **stop**, **ask**, or **borrow** from a soft overage?

### Parallel vs sequential paid calls

#### Founder answer (2026-06-01)

Default **sequential** for v0. Parallel is v1 (cap **3**/task, LLM dependency graph).


Parallelism reduces latency but increases burst spend and failure modes.

What is the default execution graph — sequential until dependencies clear, parallel fan-out with cap N, or LLM-decided each time? What is the maximum parallel x402 payments per task in v0?

### Synthesis quality bar

#### Founder answer (2026-06-01)

Launch minimum: cite **slug + price** per source; **total cost** line; explicit gaps on empty/error subtasks; **never hallucinate** missing API data. Hide intermediate steps unless `--verbose`.


Users judge AgentCash on the final answer, not on individual micropayments.

What is the **minimum acceptable synthesis** for launch — cite sources, show cost breakdown, refuse to hallucinate missing API data? Do you show intermediate subtask outputs or only the final packaged response?

### Error handling when a subtask fails

#### Founder answer (2026-06-01)

On paid failure: **retry once** same provider → **substitute** same capability → **partial results** with labeled gap. Max **2 retries**/subtask. **No refunds.** Fail whole task only if step was load-bearing for synthesis.


Partial success is normal when one paid API times out.

If subtask 2 of 4 fails after payment, do you **retry** (same wallet), **substitute** another registry entry, **refund** (how?), or return partial results with explicit gaps? How many retries before the whole task is marked failed?

### Planner transparency

#### Founder answer (2026-06-01)

Ship **`agentcash quote`** as **Day 1** trust infrastructure — show plan + est. costs; user approves or aborts (no plan editing v0).


Security-conscious users want to see the plan before money moves.

Do you expose a **dry-run / quote** mode that lists intended x402 calls and total USDC before execution? Can users edit the plan before confirming?

### Tool hallucination and registry grounding

#### Founder answer (2026-06-01)

**Forced JSON schema** of registry tool IDs only. Unknown ID → reject, pick closest registry match by embedding similarity, log hallucination. User sees: `Routing to [ProviderA] — closest available match.`


Models invent tools that do not exist in the registry.

How do you **constrain** tool selection — forced JSON schema from registry IDs, RAG over listings, or post-hoc validation that rejects unknown slugs? What user-facing message appears when the model asks for a tool you do not support?

### Long-running tasks and timeouts

#### Founder answer (2026-06-01)

**60s** global task timeout v0. Stream CLI status every **2s**. Ctrl-C: let in-flight x402 settlements finish, cancel pending HTTP, print payment count + `~/.agentcash/receipts.jsonl` pointer.


Some APIs take 30s; others take minutes.

What is the global task timeout, and do you stream progress to CLI/web? If the user Ctrl-C’s, do you cancel in-flight x402 settlements or let them complete?

### Evaluation before ship

#### Founder answer (2026-06-01)

**5 golden tasks** must pass before Days 3–5 ship (weather <$0.03; AI news summarize <$0.10; AAPL price; A vs B research ≥2 APIs <$0.20; idempotency double-run). Automate cost/receipt checks; manual quality rubric.


Router quality is subjective without benchmarks.

What **3–5 golden tasks** must pass before you call Days 3–5 done (e.g., “research X, summarize, under $0.20”)? Who scores them — you, blind tester, automated rubric?

---

## 4. Viral demo / GTM

### The exact tweet moment

#### Founder answer (2026-06-01)

Hero screenshot: `npx agentcash run "latest funding rounds in AI this week"` with live `Paying $0.04 → brave-search (tx: …)` lines, synthesized answer, **`Total: $0.06 in 8.2s`**. Real USDC, no magic.


Viral demos have one screenshot or terminal GIF that carries the story.

**🔴 Blocker:** What is the **single command + output line** you want in the tweet (copy-paste exact)? What USDC amount and which real API call proves x402 in one shot?

### Video script (60–90 seconds)

#### Founder answer (2026-06-01)

0–10s problem (agent can't pay APIs); 10–30s `npx agentcash run` + wallet/QR (cut 15s→5s); 30–45s payment lines + tx hashes; 45–60s answer + cost; 60–75s CTA `npx agentcash` + agentcash.tech. Blur only wallet **file path** if visible — keep address visible.


Short video beats thread for dev tools if the hook is instant.

Write the beat sheet: problem (10s), run command (20s), money moves (15s), answer appears (15s), CTA (10s). What do you **blur** in screen recording (keys, wallet address, provider URL)?

### `npx` zero-config vs security

#### Founder answer (2026-06-01)

Public content uses **pinned** `npx agentcash@0.1.0` (not `@latest`). README integrity hash optional. First-run permissions: `~/.agentcash/` filesystem + env vars only. Supply-chain one-liner: pin versions; directory holds signing key.


Zero-config drives installs; it also runs unaudited code with wallet access.

**🔴 Blocker:** What does `npx` execute — pinned package version, integrity hash, or latest `@latest`? What permissions do you request on first run (filesystem, env vars), and what is your stance on **supply-chain** if npm account is compromised?

### Mainnet “48 hours” claim

#### Founder answer (2026-06-01)

**Do not** claim "mainnet in 48 hours." Ship **Base mainnet Day 1** with chain picker defaulting to Base — no countdown narrative.

Founders often promise mainnet quickly; wallets and compliance lag.

Have you publicly committed to **mainnet USDC within 48 hours** of something? If yes, define start clock and scope (demo only vs production). If no, what promise **are** you willing to defend in comments?

### Which APIs to tag for launch buzz

#### Founder answer (2026-06-01)

**Tag:** Coinbase (x402), Brave Search if live, + one confirmed x402 provider at launch. **Off limits without partnership:** OpenAI, Anthropic, brands where you built the integration yourself.


@mentions can help or annoy legal teams.

Which **3 providers** do you want tagged in launch content, and do you have their permission or at least x402 docs link? Who is **off limits** to name until partnership (e.g., trademark-sensitive brands)?

### Open source license and contribution story

#### Founder answer (2026-06-01)

**MIT** license. Competitors may fork hosted versions — moat is **registry curation + `npx` distribution + default status**, not license lock-in.


OSS affects competition, enterprise sales, and contributor expectations.

**🔴 Blocker:** What license ships with the router/repo (MIT, Apache-2.0, BSL, source-available)? Can competitors fork and run a hosted version on day one, and are you okay with that?

### Landing vs CLI as hero

#### Founder answer (2026-06-01)

**Primary CTA: Run `npx agentcash`.** Landing = terminal GIF of tweet screenshot (not live balance). Waitlist secondary.


`agentcash.tech` and `app.agentcash.tech` exist; the CLI may be the real product.

For week one, is the **primary CTA** “run npx,” “read docs,” or “join waitlist”? Does the landing page show a live wallet balance demo or only animation?

### Developer persona for first 100 users

#### Founder answer (2026-06-01)

**Cursor + LangChain/CrewAI** builders with `ANTHROPIC_API_KEY` already set. Distribution order: **X → HN Show HN → AI Discords**.


Indie hackers, agency builders, and enterprise platform teams need different promises.

Who is the **ICP** for the first 100 users — Cursor users, LangChain shops, crypto-native agents, enterprise IT? What community (Discord, X list, HN) gets the first invite?

### Competitive positioning in public copy

#### Founder answer (2026-06-01)

One-liner: *AgentCash is the router and registry that lets your agent discover, pay for, and use x402 APIs — without you writing payment code.* **Don't claim:** cheapest, most APIs, only router, trustless. **Do claim:** simplest zero-to-self-funding-agent path.


RouteNet, x402 Bazaar, and DIY facilitators overlap your narrative.

One sentence: why AgentCash instead of **calling x402 APIs directly**? What do you **not** claim (e.g., “cheapest,” “most APIs,” “only router”)?

### Launch metrics instrumentation

#### Founder answer (2026-06-01)

PostHog: `install`, `wallet_created`, `wallet_funded`, `first_payment_sent`, `task_completed`, `task_failed`. Opt-out `AGENTCASH_NO_TELEMETRY=1`; disclose on first run with link to agentcash.tech/privacy. Never include prompts/responses.


You need to know if the demo worked beyond star count.

What events do you track on first run (install, wallet funded, first payment, task success)? Where do those events go (PostHog, CF Analytics, none) and is there a privacy policy link?

---

## 5. AgentCash product boundary

### Web app role vs CLI

#### Founder answer (2026-06-01)

In 30 days: **app.agentcash.tech = dashboard** (receipts, balance, registry browse, budgets). **CLI forever** for execution, keygen, export. Web **never** holds signing key.


The monorepo today is mostly marketing + health; the router may live in CLI first.

In 30 days, is `app.agentcash.tech` a **dashboard** (history, budgets, registry browse), **marketing only**, or **API console**? What features are CLI-only forever?

### Auth — return later?

#### Founder answer (2026-06-01)

**No login for paid CLI v0.** Anonymous fund + spend locally. Auth only for future dashboard sync. **No server-side task/prompt storage** — privacy differentiator.


Supabase auth subdomains are planned; shipping without auth is faster.

**🔴 Blocker:** Does v0 require **login** for any paid action, or can anonymous users spend via shared demo wallet until abuse forces auth? What user data do you store if auth is deferred?

### Monetization and take rate

#### Founder answer (2026-06-01)

**$0 year one** — no take rate, no inference charge. Later: **sponsored registry placement** (labeled) or **enterprise hosted router SLA**. Micropayment take rate deferred (broken unit economics + regulatory surface).


Micropayments through you invite a platform fee model.

Do you take a **take rate** on x402 volume, charge for hosted routing inference, sell enterprise SLA, or monetize later at $0 for growth? If take rate, is it transparent on-chain, in UI, or buried — and what % is fair at launch?

### Competition vs RouteNet / Bazaar

#### Founder answer (2026-06-01)

6-month wedge: **`npx` distribution + registry curation quality.** If squeezed on breadth → pivot **router-only** (thin wrapper over competitors). If squeezed on routing → pivot **registry-only**. Don't fight both.


Aggregators and marketplaces may subsume registry + routing.

What is your **defensible wedge** in 6 months — registry curation, synthesis quality, multi-wallet UX, compliance, or distribution via `npx`? What would make you pivot to “registry only” or “router only”?

### Enterprise vs indie dev

#### Founder answer (2026-06-01)

**Indie-first.** Reject in year one even for a deal: **SSO/SAML** (2-week build + legal review, wrong signal).


Enterprise wants SSO, invoices, and data residency; indie wants free and fast.

Are you **indie-first** with enterprise on roadmap, or chasing one design partner now? What enterprise feature would you **reject** in year one even if it costs a deal?

### API surface at `api.agentcash.tech`

#### Founder answer (2026-06-01)

**Local CLI only v0** — no hosted `/v1/task`. Hosted API is v1 after local flow + monetization proven.


Hosted router API vs local-only CLI changes ops burden.

Will third parties call **your hosted** `/v1/task` with their API keys, or only run local CLI? Rate limits, API keys, and billing attach to which surface?

### Docs site scope

#### Founder answer (2026-06-01)

Launch must-haves: x402 primer, wallet/BYOK setup, registry submit format, first-payment golden path, legal/ToS. Defer: architecture deep-dive, partnership playbooks, enterprise docs. Founder approves legal copy.


`docs.agentcash.tech` can be minimal or comprehensive.

What must be in docs before public launch — x402 primer, registry format, wallet setup, legal, all of the above? Who writes and owns docs updates (you vs agent vs community)?

### Brand promise in one line

#### Founder answer (2026-06-01)

*AgentCash is the payment layer for developers who need their agents to pay for APIs without human approval.* **Forbidden:** bank, guaranteed, trustless, autonomous, decentralized.


Internal alignment prevents scope creep.

Finish this line: **“AgentCash is the ___ for ___ who need ___.”** What words are forbidden in that sentence (e.g., “bank,” “guaranteed,” “autonomous”)?

---

## 6. Risk & compliance

### Demo wallet drain and abuse

#### Founder answer (2026-06-01)

No demo wallet. Abuse: **10 tasks/hour/wallet** default; ban wallet from **registry access** on illegal use (can't block on-chain spend); don't globally pause `npx`. Keep tx hashes for LE requests only.


A public funded wallet is a magnet for bots and griefers.

**🔴 Blocker:** What is your **incident playbook** when the demo wallet is drained or used for non-demo purposes (spam, illegal content requests)? Do you pause `npx`, rotate keys, or pursue on-chain tracing?

### API terms of service

#### Founder answer (2026-06-01)

Review **ToS for every registry entry** before listing. CLI: `You are responsible for complying with the ToS of each API you access through AgentCash.` (`--agree-tos` or first-run click-through).


Paying for an API does not automatically permit agentic resale or prompt logging.

Have you reviewed **ToS** for the first registry APIs regarding automated access, redistribution of responses, and commercial use? What do you tell users — “you are responsible for compliance” — and is that in CLI terms?

### Data retention of paid responses

#### Founder answer (2026-06-01)

Log locally only: tx hash, receipt ID, slug, amount, timestamp, HTTP status. **Never** prompt/body/auth headers. GDPR/CCPA story: all data on user's machine; servers retain no personal data v0.


Storing prompts and API responses creates privacy and IP obligations.

What do you **log and retain** (prompt, response body, headers, payment receipt), for how long, and can users opt out? GDPR/CCPA deletion — supported in v0 or not?

### Sanctions and geo restrictions

#### Founder answer (2026-06-01)

v0: **no VPN/geo blocking.** Not a money transmitter — users sign with own keys; on-ramp is exchange's problem. **One-hour legal consult** before mainnet marketing to validate posture.


USDC and US companies touch OFAC and export rules.

Will you block VPNs, restrict countries, or screen wallet addresses? What happens if a sanctioned address sends USDC to your facilitator-linked wallet?

### Anthropic (and other) API key exposure

#### Founder answer (2026-06-01)

**Keys never touch AgentCash servers** — local env only. Day 1 util strips `/sk-ant-[a-zA-Z0-9]+/` from logs and crash reports.


Router features may ask users to paste provider keys for synthesis.

**🔴 Blocker:** Do user API keys ever touch **your servers**, or only local CLI? If local only, how do you prevent accidental logging in debug traces and crash reports?

### Prompt injection via registry

#### Founder answer (2026-06-01)

Sanitize listing descriptions before model context: strip HTML/links, **truncate 500 chars**, **human review** before publish. Sufficient for v0.


Malicious registry metadata could steer agents to exfiltrate keys.

How do you sanitize listing descriptions shown to the model? Do you run registry content through a static scanner or human review before publish?

### Liability cap and warranties

#### Founder answer (2026-06-01)

Click-through / `--agree-tos` before first payment: *Not financial advice. Experimental software. No SLA. Payments are irreversible. Use at your own risk.*


Software that moves money needs clear disclaimers.

What warranty do you disclaim (“not financial advice,” “no SLA,” “experimental”)? Do you require click-through terms before first payment?

### Child safety and UGC

#### Founder answer (2026-06-01)

Rely on upstream + Anthropic policies; **Claude content filter** before plan generation; ban wallet on confirmed illegal use; Discord: ban + preserve logs, no public engagement.


Agents can be misused to generate harmful content using paid APIs.

Do you moderate task prompts, block categories, or rely entirely on upstream providers? What is your response if someone demos illegal use in your Discord?

### Insurance and entity structure

#### Founder answer (2026-06-01)

Form **LLC before mainnet marketing** (single-member). Cyber/E&O optional at launch but entity required — don't say "production ready" without it.


Serious enterprise asks about corp veil and coverage.

Is AgentCash a **personal project**, LLC, or planned C-corp before mainnet marketing? Do you carry or plan cyber / E&O insurance before claiming production readiness?

---

## 7. Prioritization

### What to cut if day 7 slips

#### Founder answer (2026-06-01)

Cut order: (1) web dashboard (2) Solana (3) full docs site (4) registry web UI (5) synthesis polish (6) multi-wallet (7) status page. **Non-negotiable:** local wallet, Base USDC detection, one x402 pay, receipts, quote mode.


A week sprint implies ruthless scope cuts.

Rank these for **cut first**: multi-wallet, registry UI, synthesis polish, web dashboard, Solana, docs site, status page. What is **non-negotiable** for a credible public demo?

### Single metric for success

#### Founder answer (2026-06-01)

**50 self-funded paid end-to-end tasks** week one = keep going; **<10** with good installs = funding UX broken, reconsider assumptions.


One metric focuses the team; too many metrics hide failure.

What is the **one number** for week-one success — successful paid end-to-end tasks, `npx` weekly active installs, registry entries live, USDC volume, or social impressions? What threshold means “keep going” vs “pivot”?

### First 10 registry entries

#### Founder answer (2026-06-01)

| # | Slug | Capability | Notes |
|---|------|------------|-------|
| 1 | `brave-search-v1` | search | **Hero — confirm E2E with real USDC first** |
| 2 | `weatherapi-v1` | data | Simple, reliable |
| 3 | `diffbot-extract-v1` | scrape | Research tasks |
| 4 | `serper-search-v1` | search | **Fallback hero** if Brave x402 not ready |
| 5 | `jina-reader-v1` | scrape | URL → clean text |
| 6 | `openai-embeddings-v1` | compute | Only if x402 live |
| 7 | `firecrawl-v1` | scrape | x402 ecosystem |
| 8 | `you-com-search-v1` | search | Third search option |
| 9 | `polygon-finance-v1` | data | Prices |
| 10 | `newsapi-v1` | data | News for research |

**Hero dependency:** `brave-search-v1`; substitute `serper-search-v1` if needed. **Do not launch** without personally testing hero with real USDC.


Concrete list beats abstract “good APIs.”

Name the **exact 10** endpoints or providers you want in the registry at launch (or 10 categories if names are TBD). Which one is the **hero** demo dependency?

### Day 1 vs Day 2 staffing

#### Founder answer (2026-06-01)

**Assume:** BYOK local EVM, Base mainnet default, no CDP required, no demo pool, quote Day 1, PostHog opt-out. **Block on:** facilitator URL confirmation, which registry entry is confirmed for golden path (deposit = agent wallet confirmed yes). **48h founder:** Brave/Serper x402 live, LLC started, ToS signed.


Two agents (code vs product) only work if boundaries are clear.

If engineering is ahead of your answers in §1–2, what should they **assume** vs **block on**? List decisions you must make in the next 48 hours.

### Support burden you can absorb

#### Founder answer (2026-06-01)

**5 hours/week** at launch. Deflect with: verbose CLI errors, FAQ (gas, key location, recovery), **`agentcash doctor`** health report.


Every public user is a potential Discord message.

How many hours per week can you spend on support at launch? What self-serve artifacts reduce that (FAQ, verbose errors, status page)?

### Post-launch week 2 bet

#### Founder answer (2026-06-01)

If metric hits: **registry breadth** (+10 confirmed x402 APIs). **Do not start week 2:** hosted API, enterprise, multi-chain, fundraising.


After demo buzz fades, you need a second act.

If week one hits the success metric, do you double down on **registry breadth**, **router intelligence**, **hosted API**, or **partnerships**? What do you explicitly **not** start in week two?

---


## Engineering handoff

Ordered build list derived from founder decisions (Day 1 → Day 7). Items marked ⚠️ are blocked on founder/ops actions in the decisions log.

### Day 1 — Wallet & x402 pay
- Local BYOK wallet: generate/load `~/.agentcash/wallet.key` (chmod 600), backup warning + SHA256 checksum
- **Deposit address = agent wallet** on selected chain (no custodial hop)
- Chain support: **Base mainnet** default; **Base Sepolia** via `--testnet`; ETH "coming soon" in `wallet chains`
- Integrate **Coinbase x402 facilitator** for Base USDC ⚠️ confirm exact facilitator URL
- `pay` with first-pay CLI copy, optimistic confirmation UX (>2s spinner, >5s warn+proceed)
- `fund wait`: poll USDC; gas error with `bridge.base.org` when USDC but no ETH
- Receipts append to `~/.agentcash/receipts.jsonl` (no prompts/responses); `receipt` / `replay` commands
- `export-key` with phrase + 5s countdown
- `doctor` health check (wallet, RPC, facilitator, balances, registry file)
- **`agentcash quote`** dry-run (plan + est. costs, no spend) — Day 1, not deferred
- API key scrubber for `sk-ant-*` in all logs
- `AGENTCASH_ENV` switches facilitator + registry URLs
- PostHog telemetry stub + `AGENTCASH_NO_TELEMETRY=1` first-run disclosure
- ToS: `--agree-tos` or first-run click-through stub
- Session/auth: local stub for challenge–response JWT (full server later)
- Wallet-based rate limits: 10 routing-only calls for new wallets; 10 tasks/hour default

### Day 2 — Registry
- `registry.yaml` with founder's **10 slugs** (status: confirmed | unverified | coming_soon)
- Maintainer-assigned capability tags (8 enums)
- `probe-price` with 60s cache; flag >20% price drift on receipt
- Opt-in PR docs + `Referer: agentcash/v0` on routed fetches
- Listed-not-endorsed disclaimer; semver + `deprecated_at` + `migration_slug` fields
- ⚠️ Founder manually probes and confirms hero entry (`brave-search-v1` or `serper-search-v1`)

### Days 3–5 — Task router
- `ANTHROPIC_API_KEY` required for decompose/synthesize (local only)
- Forced registry tool IDs in JSON schema; hallucination → closest match + log
- **Sequential** x402 execution only; per-task `--budget`; 80% budget ask-once
- Subtask errors: retry → substitute → partial result (max 2 retries); no refunds
- 60s task timeout; Ctrl-C behavior per spec
- Synthesis: cite slugs + prices + total; `--verbose` for full trace
- **5 golden tasks** automated cost/receipt checks + manual quality rubric

### Day 6 — Demo polish
- CLI output matches tweet screenshot (`run` with visible tx lines + total)
- `npx agentcash@0.1.0` pinned in README/GTM copy
- README header: Base only, Solana v1
- Video-ready terminal theme; `agentcash doctor` for support deflection

### Day 7 — Launch
- MIT license; minimal docs (primer, wallet, registry format, golden path, ToS)
- Landing: terminal GIF CTA → `npx agentcash`
- PostHog events wired for week-one metric (50 paid tasks)
- ⚠️ LLC formed; ⚠️ ToS approved; ⚠️ legal consult on non-custodial posture

### Explicitly defer (v0)
- Web dashboard (receipt sync UI)
- Hosted `api.agentcash.tech` `/v1/task`
- Solana / WalletConnect production
- Parallel x402 pays (>1 at a time)
- SSO/SAML, take rate, refunds
- Registry web UI (YAML in repo is enough)
- Community PR merge without founder approval

### Contradictions / tensions to resolve in implementation
1. **Dual-key auth vs challenge–response:** Server session key (KEY_2) vs "server never sees signing key" — v0 may stub local session file until auth service exists; document clearly.
2. **"No login for paid actions" vs KEY_2 in database:** Marketing says anonymous CLI; product still plans server session registration — scope v0 stub to local-only session.
3. **Quote mode Day 1 vs registry hero unverified:** Engineering can ship quote with placeholder/unverified entries but **golden path pay** must use a **confirmed** x402 endpoint (e.g. weather.hugen.tokyo) until Brave is verified.
4. **Default chain copy vs deposit-first narrative:** Early decisions log mentioned "move funds after deposit"; latest decision is **no custodial hop** — implement single local wallet address only.

---

## Next questions after you answer §1–3

Once wallet/payments, registry, and router intelligence sections have answers (even partial), a follow-up round will dig into:

1. **Hosted vs local economics** — unit cost per routed task, break-even take rate, and whether you ever subsidize x402 fees for growth.
2. **Provider partnership playbook** — outbound email template, co-marketing ask, and revenue share vs free listing.
3. **Agent framework integrations** — official plugins for LangChain, CrewAI, Cursor MCP vs “bring your own HTTP.”
4. **Observability contract** — standard trace IDs across x402 + upstream APIs for support and provider disputes.
5. **Versioning and migration** — how breaking router/registry changes ship without bricking existing `npx` installs.

---

*Last updated: 2026-06-01 (full founder decision pass) · Maintainer: founder · Consumers: product/strategy agents and engineering handoff.*
