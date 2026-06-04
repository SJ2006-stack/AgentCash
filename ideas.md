# AgentCash — YC startup landing page design research

**Date:** June 4, 2026  
**Purpose:** Capture concrete visual and UX patterns from notable Y Combinator (and closely adjacent agent-fintech) marketing sites to inform AgentCash’s coming-soon / agent-wallet landing—without copying any single brand wholesale.

**Research method:** Live review via Cursor browser MCP (screenshots, accessibility snapshots, limited CDP `getComputedStyle` where the DOM cooperated), plus public page fetch for copy/structure. `Private.md` was not present at repo root. No secrets or credentials are recorded here.

**Scope:** 12 sites—10 confirmed YC alumni across devtools, AI infra, and fintech, plus 2 agent-wallet / terminal-banking peers highly relevant to AgentCash (YC affiliation not verified for those two).

---

## Linear

- **URL:** https://linear.app  
- **YC:** Winter 2020  
- **Color palette:** Near-black canvas `rgb(8, 9, 10)` / design-system `#010102` with cool gray text `rgb(247, 248, 248)`; single lavender accent `#5e6ad2` used sparingly; 4-step surface ladder (`#0f1011` → `#191a1b`) and hairline borders `#23252a`–`#3e3e44` instead of heavy shadows.  
- **Typography:** Inter Variable at custom weights (510/590) for UI; Inter Display for marketing headlines (~56px hero); Berkeley Mono for code/diffs; tight negative letter-spacing on large type.  
- **Layout:** Hero is not a static tagline—it embeds a **live product UI mock** (issue board, agent chat, diff viewer) as the proof. Long scroll with numbered chapters (Intake → Plan → Build → Diffs → Monitor). Dense information, generous vertical rhythm between chapters.  
- **Motion / animation:** Scroll-driven section reveals; interactive hero widgets (agent assignment, kanban columns); subtle hover on CTAs; changelog marquee-style social proof. Feels “instrument panel,” not marketing fluff.  
- **Components:** Minimal top nav (logo, Log in, Sign up pill); product screenshots as sections; expandable `+` feature rows; logo wall; dual footer CTA (“Get started” / “Contact sales”).  
- **Overall vibe:** Dark, restrained, **software-craft documentary**—one accent color, no gradient wallpaper.  
- **Ideas for AgentCash:**
  - Use a **single chromatic accent** on a near-black base; let borders/surface lift carry hierarchy.
  - Replace abstract wallet art with a **credible UI slice** (balance, policy limits, agent spend log) in the hero.
  - Structure the page as **chapters** (Problem → Agent wallet → Controls → Waitlist) with numbered labels like Linear’s `FIG` / section indices.

---

## Raycast

- **URL:** https://www.raycast.com  
- **YC:** Summer 2020  
- **Color palette:** True black hero `#000000`; white primary type; brand red/salmon in logo mark; soft red/orange **grainy glow** behind headline (atmospheric, not a full gradient mesh).  
- **Typography:** Bold geometric sans for hero (“Your shortcut to everything.”); smaller supporting line below; clear weight contrast between H1 and body.  
- **Layout:** Ultra-minimal hero—centered headline only. Floating **pill nav bar** (rounded container, logo left, hamburger right). Later sections: keyboard illustration, extension grid, testimonial wall, YouTube carousel.  
- **Motion / animation:** Keyboard UI likely animated on scroll; extension cards as dense grid; AI demo areas with disabled/send states in snapshot (interactive prototypes).  
- **Components:** Download CTAs with version string + Homebrew install; category tabs (Productivity / Engineering / Design / Writing); extension cards with app icons; newsletter capture at footer.  
- **Overall vibe:** **Pro-tool luxury**—Mac-native, speed, keyboard-first.  
- **Ideas for AgentCash:**
  - **Floating pill header** on coming-soon: logo + one menu (Docs, Discord, Waitlist).
  - One-line hero with **subtle colored glow** behind “agent wallet” words—not full WebGL.
  - Show a **keyboard-shortcut or CLI command** metaphor (`agentcash fund --agent …`) as the “speed” story.

---

## Clerk

- **URL:** https://clerk.com  
- **YC:** Summer 2019  
- **Color palette:** Marketing hero observed as **light** (`#FAFAFA`-style) with blueprint/schematic background texture; purple primary CTA (~violet `#6C47FF` class of); black announcement bar for news. (Site also supports dark contexts in product demos—CDP on `/` varied by section.)  
- **Typography:** DM Sans ~60px / 700 for H1 on dark sections; clean sans for body; monospace component names (`<SignUp />`) in feature lists.  
- **Layout:** Centered hero + dual CTA (“Start building for free” / “Build with agents” dropdown); **live embedded UI components** (sign-up, org create, waitlist) as scroll sections; logo strip; Twitter-style testimonial cards; deep footer.  
- **Motion / animation:** Component tabs switch live previews; subtle blueprint parallax on background.  
- **Components:** Announcement strip; floating nav; dropdown secondary CTA; `<Component />` naming in copy; “Explore all components” pattern.  
- **Overall vibe:** **Developer SaaS polished**—trust through UI proof, not stock photography.  
- **Ideas for AgentCash:**
  - **Embed a real widget** in hero: waitlist, policy preview, or “agent balance” read-only card.
  - Top **news pill** (“Coming soon — join waitlist”) in high-contrast bar.
  - Name primitives in copy (`Wallet`, `Spend cap`, `MCP tool`) like Clerk names components.

---

## Dub

- **URL:** https://dub.co  
- **YC:** Winter 2024  
- **Color palette:** Light mode hero `rgb(250, 250, 250)`; headline `rgb(23, 23, 23)`; **Satoshi** display face; neutral gray secondary text; primary CTA solid gray/black pill (not neon).  
- **Typography:** Satoshi 48px hero; sans body; monospace in product chrome.  
- **Layout:** Centered hero on **faint grid background**; announcement pill with gradient border; tabbed product switcher (Affiliate / Analytics / Links) driving hero demo; interactive dashboards (clicks, LTV, partner cards); live counters; API request/response panel.  
- **Motion / animation:** Tab swaps hero product; “Play demo” buttons; animated stat counters; changelog list.  
- **Components:** Dual CTA (Start for free / Get a demo); comparison section vs Bitly et al.; customer quote cards; trust badges (G2, Product Hunt).  
- **Overall vibe:** **Clean PLG infra**—grid = precision; demos = credibility.  
- **Ideas for AgentCash:**
  - Subtle **grid or ledger-line background** on light theme for fintech trust without bank clichés.
  - **Tabbed hero** switching “Human dashboard” vs “Agent MCP” views.
  - Pair **self-serve + contact** CTAs when enterprise trust matters.

---

## Resend

- **URL:** https://resend.com/home  
- **YC:** Winter 2023  
- **Color palette:** True black `#000000` canvas; off-white ink `#FDFDFD` / `#f0f0f0`; optional warm gradients (eggshell, iron, stone) after rebrand; orange accent family `#ff5900` / `#ff801f` in brand system; **one white primary button per viewport**.  
- **Typography:** **Domaine Display** serif 76–96px for “Email for developers”; ABC Favorit body; Inter UI; Geist Mono in code blocks.  
- **Layout:** Centered hero with **3D brand object** (cube); announcement pill with iridescent border; SDK tabs (Node, Go, Rust…) above code sample; long feature scroll with editor mock, webhook diagrams, testimonial carousel.  
- **Motion / animation:** Code tab switching; test-mode event simulator; horizontal logo marquee; restrained scroll fades.  
- **Components:** Minimal hamburger nav; `Get started` + `Documentation`; feature grids with “Learn more”; philosophy/footer culture links (Humans, Wallpapers).  
- **Overall vibe:** **Cinematic developer luxury**—gallery black, editorial serif, code as hero.  
- **Ideas for AgentCash:**
  - Consider **serif display + mono code** pairing for “trust + buildability.”
  - One **3D or abstract asset** (vault, coin, agent node) centered on black—not a busy illustration.
  - **SDK/MCP tabs** in hero showing agent integration snippets.

---

## Modal

- **URL:** https://modal.com  
- **YC:** Winter 2021 (approx.; verify on YC site if needed)  
- **Color palette:** Dark base with **green accent** on CTAs and highlights; white/gray text; code blocks on elevated panels (typical devtools dark theme).  
- **Typography:** Sans-serif marketing headings; monospace in SDK snippets; strong H1 “AI infrastructure that developers love.”  
- **Layout:** Classic devtools landing: hero + dual CTA (Get Started / Contact Us); capability sections (Inference, Training, Sandboxes); GPU infra map; customer metrics; example recipe cards (“Transcribe speech…”).  
- **Motion / animation:** Autoscaling counters; globe/region visuals; hover on workload cards.  
- **Components:** Workload switcher rows; security/compliance badges (SOC2, HIPAA); pricing hook “$30 / month free compute.”  
- **Overall vibe:** **Infra-serious dark mode**—performance and scale first.  
- **Ideas for AgentCash:**
  - Frame agent wallet as **infrastructure** (“execution layer for agent money”) not consumer banking.
  - Surface **compliance/security** strip early (even if “coming soon” disclaimers).
  - Offer a **concrete code sample** above the fold (MCP tool call or API curl).

---

## Mercury

- **URL:** https://mercury.com  
- **YC:** Winter 2019  
- **Color palette:** **Full-bleed photography** (muted greens, warm sunset sky, office still life); white headline type; **blue–violet gradient** on primary “Open account” button; dark translucent legal footer bar.  
- **Typography:** Uppercase spaced **MERCURY** wordmark; large friendly sans headline “Radically different banking”; smaller subdued subcopy.  
- **Layout:** Cinematic hero with **email capture inline** (glass-style input + embedded CTA); accordion feature sections with embedded video demos; stat blocks (300K+, 1 in 3 startups); press headline cards; split business vs personal closing CTAs.  
- **Motion / animation:** Video play buttons in accordions; carousel tabs for testimonials; subtle parallax on hero photo.  
- **Components:** Email + opt-out checkbox + FDIC disclaimer; “Launch demo” for product tour; trust metrics; dual footer CTAs.  
- **Overall vibe:** **Premium lifestyle fintech**—emotion-first, UI-second.  
- **Ideas for AgentCash:**
  - For coming-soon, borrow **single-field email + gradient CTA** in a glass pill—not a full dashboard screenshot.
  - Use **one strong metaphor image** (calm, control) rather than cluttered fintech UI.
  - Prominent **stat row** once you have waitlist or design-partner numbers.

---

## Ramp

- **URL:** https://ramp.com  
- **YC:** Winter 2019  
- **Color palette:** Light/white dominant with **yellow–green accent** on brand; black text; product UI screenshots with saturated data viz.  
- **Typography:** Bold sans headlines (“Time is money. Save both.”); subheads explaining AI agents; testimonial pull quotes.  
- **Layout:** Hero with **live counter** (“US corporate payments processed…”); logo wall; before/after “five systems” diagram; agent-themed sections (Policy Agents, Ramp Intelligence); long testimonial grid; repeated closing CTA.  
- **Motion / animation:** Animated odometer-style counter; scroll reveals on testimonial cards; demo embeds.  
- **Components:** “Get started for free” repeated; enterprise “Stack” callout; integration logos (200+).  
- **Overall vibe:** **Enterprise PLG with AI narrative**—busy but structured.  
- **Ideas for AgentCash:**
  - A **single live metric** (waitlist signups, agents funded) builds momentum like Ramp’s counter.
  - **Before/after** diagram: “five apps” → “one agent wallet.”
  - Repeat one primary CTA every ~2 scroll sections.

---

## Mintlify

- **URL:** https://mintlify.com  
- **YC:** Winter 2022 (approx.)  
- **Color palette:** Light/white marketing site; soft neutrals; purple/blue accents on buttons; subtle gradients in “intelligence age” hero art.  
- **Typography:** Large sans headline “The Intelligent Knowledge Platform”; clean body; customer logos in grid.  
- **Layout:** Hero dual CTA (Start now / demo); feature trio (LLMs.txt & MCP, self-updating docs, AI assistant); enterprise block; **customer story cards** with metrics (e.g. “2M+ developers”).  
- **Motion / animation:** Workflow/product videos in cards; logo grids.  
- **Components:** “Built for both people and AI” positioning—direct parallel to AgentCash audience.  
- **Overall vibe:** **AI-native B2B**—docs as product, agents as first-class.  
- **Ideas for AgentCash:**
  - Mirror **“built for humans and agents”** split headline pattern.
  - Publish **llms.txt / MCP** links in footer for developer discovery.
  - Customer-style cards even for design partners (“how X uses AgentCash”).

---

## Retool

- **URL:** https://retool.com  
- **YC:** Winter 2017  
- **Color palette:** White/light gray base; **yellow** brand accent; navy/black text; colorful app screenshots in product tiles.  
- **Typography:** Split headline (“Build how you want. Ship on a platform you can trust.”); enterprise subcopy; sans throughout.  
- **Layout:** Enterprise narrative (Govern / Build / Launch / Scale); persona columns (Data, Ops, Eng); ROI stats (Ramp, DoorDash); “Start building with a prompt” CTA.  
- **Motion / animation:** AppGen demos; tabbed product stories.  
- **Components:** Heavy social proof with **dollar and hours saved**; demo booking vs prompt CTA.  
- **Overall vibe:** **Enterprise builder**—credibility through logos and quantified outcomes.  
- **Ideas for AgentCash:**
  - When targeting founders, use **quantified proof** placeholders (time saved reconciling agent spend).
  - Persona strips: **founder / finance / agent builder**.
  - “Build with a prompt” → **“Fund your agent with a prompt.”**

---

## moneydevkit (agent-wallet peer)

- **URL:** https://moneydevkit.com  
- **YC:** Not confirmed on YC directory at research time—listed as **adjacent peer** for agent payments.  
- **Color palette:** Dark green–black gradient hero; **mint/seafoam** accent on “dev” in wordmark; white primary text; editorial serif logo treatment.  
- **Typography:** Serif **money dev kit** logotype; sans section headings; mono-friendly feature labels (`▸ agent / autonomous`).  
- **Layout:** Minimal nav; hero dual CTA (Get started / Read docs); two-column audience split (vibe-coders vs agents); **showcase cards** (Ori, Unhuman Store); 2×2 feature grid (MCP, Agent Wallet, Next.js, Replit); giant **2.0%** pricing numeral.  
- **Motion / animation:** Subtle scanline/grid texture; radial green glow from bottom.  
- **Components:** “Made with moneydevkit” social proof; docs-first secondary path; Discord/GitHub/X footer.  
- **Overall vibe:** **Agent-native payments**—developer editorial, not bank branch.  
- **Ideas for AgentCash:**
  - **One-number pricing** or fee clarity above fold when ready.
  - **Showcase cards** linking to real agents using the wallet.
  - Docs-first secondary CTA beside waitlist primary.

---

## Kibble (terminal-fintech peer)

- **URL:** https://kibble.sh  
- **YC:** Not confirmed on YC directory at research time—listed as **adjacent peer** for terminal/agent banking.  
- **Color palette:** White canvas; **brick red** `#C4302B`-class accent (banner, logo, CTA); black headlines; gray body.  
- **Typography:** Bold sans H1; **monospace section labels** (`00 / HERO`, `01 / PROBLEM`); command strings in copy (`kibble init`, `kibble charge`).  
- **Layout:** Long-form **numbered manifesto** scroll; problem/solution cards; **live terminal mock** in Experience section; comparison table (Without Kibble / With Kibble); FAQ accordions; repeated waitlist forms top and bottom.  
- **Motion / animation:** Terminal typing aesthetic (static in snapshot); accordion expand.  
- **Components:** Early-access email + country; cred strip (“LI.FI, Ripple, Aave”); dismissible top banner for product split (`v1.kibble.sh`).  
- **Overall vibe:** **CLI-first fintech manifesto**—red accent, documentation structure.  
- **Ideas for AgentCash:**
  - Use **numbered sections** and monospace labels for a coming-soon “spec sheet” feel.
  - Hero **terminal block** showing `agentcash` commands, not dashboard chrome.
  - Comparison table vs “browser banking” / “manual cards.”

---

## Synthesis

### Cross-cutting patterns

| Pattern | Who does it well | Notes |
|--------|------------------|-------|
| **Dark near-black + one accent** | Linear, Raycast, Resend, Modal | Avoid pure `#000` flatness; use surface steps or grain (Linear, Resend). |
| **Light grid / blueprint hero** | Dub, Clerk | Signals precision; good for “trustworthy fintech infra.” |
| **Serif display + sans/mono body** | Resend, moneydevkit | Editorial trust without looking like a legacy bank. |
| **Product UI as hero** | Linear, Clerk, Dub | Stronger than abstract 3D for dev/fintech audiences. |
| **Agent/MCP positioning above fold** | Clerk, Mintlify, moneydevkit, Kibble | Explicit “humans + agents” or CLI/MCP vocabulary. |
| **Dual CTA: start + docs/demo** | Resend, moneydevkit, Dub, Mercury | Reduces bounce from technical visitors. |
| **Single shocking number** | Ramp (counter), moneydevkit (2.0%) | Memorable pricing or traction metric. |
| **Numbered long-scroll story** | Kibble, Linear | Educates while selling; suits coming-soon narrative. |
| **Cinematic photography** | Mercury | Emotional differentiation—use sparingly with AgentCash brand. |
| **Testimonial density** | Ramp, Retool, Resend | Social proof blocks repeated down-page. |

### Color & type trends (2025–2026 YC marketing)

- **Devtools:** Near-black canvases, hairline borders, one cool or lavender accent; Inter family still dominant; mono for code paths.  
- **AI infra / docs:** Light grids, purple CTAs, “AI-native” subheads; MCP/llms.txt mentioned explicitly.  
- **Fintech:** Either **premium photo + gradient CTA** (Mercury) or **manifesto + terminal** (Kibble) or **editorial dark** (moneydevkit)—convergence away from generic blue “bank” palettes.  
- **Typography split:** Sans-only (Linear, Dub) vs **serif hero + sans body** (Resend, moneydevkit) for premium feel.

### CTA patterns

1. **Primary:** “Get started” / “Open account” / “Start for free” — high contrast pill on dark or gradient on photo.  
2. **Secondary:** “Read docs” / “Get a demo” / “Documentation” — outline or text link, never competing visually with primary.  
3. **Capture:** Inline email in hero (Mercury, Kibble) for waitlist-era products.  
4. **Repeated close:** Same CTA pair in footer (Linear, Dub, Resend).

### Animation trends

- Subtle **grain/glow** behind type (Raycast, moneydevkit), not full WebGL heroes.  
- **Tab-driven hero demos** (Dub, Resend SDK tabs).  
- **Live or simulated UI** (Linear agent chat, Resend test mode).  
- **Counters** for scale (Ramp, Dub stats).  
- Avoid excessive parallax; prefer **credibility motion** (code typing, status ticks).

---

## Recommended experiments for AgentCash web

1. **Hero A/B concept**
   - **A (Linear-style):** Near-black, one accent, embedded wallet UI slice (balance, spend cap, last 3 agent transactions).  
   - **B (Resend-style):** True black + serif headline “Money your agents can hold” + MCP code tabs.  
   - **C (Kibble-style):** White manifesto + terminal `agentcash` commands + waitlist inline.

2. **Typography pairing trial:** Domaine/serif or similar for H1 only + Inter/Geist for body and Geist Mono for commands; keep AgentCash wordmark sans for recognition.

3. **Section architecture for coming-soon:** `00 / VISION` → `01 / PROBLEM` (agents can’t spend) → `02 / WALLET` → `03 / CONTROLS` → `04 / WAITLIST` with monospace indices (Kibble + Linear chapter model).

4. **Dual audience strip:** Two columns—“For founders” vs “For agents/builders”—with MCP docs link (moneydevkit / Mintlify pattern).

5. **Trust without bank clichés:** Grid background + hairline cards (Dub) OR surface ladder on dark (Linear); skip stock photos unless brand demands Mercury-like warmth.

6. **CTA set:** Primary “Join waitlist” (email inline); secondary “Read docs” / “MCP server”; footer repeat; optional “Contact” for design partners.

7. **Motion budget:** One ambient glow + optional counter (waitlist count); tab switcher for “Dashboard vs MCP” if build bandwidth allows.

8. **Footer developer discovery:** Link `llms.txt`, MCP endpoint docs, GitHub, status—signals builder-first (Mintlify, Resend, Clerk).

---

## Research limitations

- Some fetches (e.g. `resend.com` root, `supabase.com`) return **LLM-oriented index pages** instead of marketing HTML; browser navigation to `/home` was required for Resend.  
- CDP color sampling failed on pages without a stable `document.body` or during transitions—values above combine **live CDP** (Linear, Dub) with **published brand/design write-ups** (Resend, Linear system docs) where noted.  
- **moneydevkit** and **Kibble** are included for agent-wallet relevance; verify YC batch on [ycombinator.com/companies](https://www.ycombinator.com/companies) before citing them as YC alumni in external materials.

---

*Document is research-only. Does not change AgentCash application source.*
