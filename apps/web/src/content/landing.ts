/**
 * Central copy and links for the AgentCash marketing site.
 * Agent 2 can refine strings here without touching component layout.
 */

export const URLS = {
  docs: "https://docs.agentcash.tech",
  status: "https://status.agentcash.tech",
  waitlist: "mailto:hello@agentcash.tech?subject=AgentCash%20early%20access",
  contact: "mailto:hello@agentcash.tech?subject=AgentCash%20contact",
  health: "/api/v1/health",
} as const;

export const nav = [
  { label: "Platform", href: "#platform", external: false },
  { label: "Docs", href: URLS.docs, external: true },
  { label: "Status", href: URLS.status, external: true },
  { label: "Contact", href: URLS.contact, external: true },
] as const;

export const hero = {
  eyebrow: "Early access",
  headline: "COMING SOON",
  rotatingPhrases: [
    "x402 USDC payments",
    "agent wallets",
    "pay-per-call APIs",
    "task routing",
  ] as const,
  subhead:
    "The wallet and control plane for autonomous spend — x402 USDC on Base, budget caps, and approvals before a cent leaves your key.",
  trustPills: ["x402", "USDC on Base", "Open source CLI", "BYOK wallet"] as const,
  primaryCta: "Join waitlist",
  secondaryCta: "Read the docs",
} as const;

export const logoStrip = {
  caption: "Built for the next wave of agent infrastructure",
  names: [
    "OpenAI Agents",
    "Coinbase x402",
    "Anthropic",
    "LangChain",
    "Vercel AI",
    "Cloudflare",
  ] as const,
} as const;

export const problemSolution = {
  eyebrow: "The gap",
  titleLead: "Agents can spend money.",
  titleAccent: "Nothing stops them.",
  description:
    "Autonomous runs need payment rails — but credit cards and shared API keys weren't designed for machines making thousands of micro-decisions.",
  problem: {
    title: "Without guardrails",
    items: [
      "Agents call paid APIs with no spend ceiling",
      "One compromised tool can drain a shared wallet",
      "Humans find out after the invoice, not before the charge",
    ] as const,
  },
  solution: {
    title: "With AgentCash",
    items: [
      "Hard budgets per task, enforced before settlement",
      "Merchant allowlists and policy gates on every x402 intent",
      "Approval flows when spend crosses your threshold",
    ] as const,
  },
} as const;

export const featuresSection = {
  eyebrow: "Platform",
  title: "Spend rails built for autonomous runs",
  description:
    "One control plane for CLI agents, HTTP tools, and future registry integrations — same guardrails everywhere.",
} as const;

export const features = [
  {
    title: "Micro-budgets",
    description: "Cap every run at cents, not cards — hard stops before an agent overspends.",
    featured: true,
  },
  {
    title: "Task Router",
    description: "Queue work, attach policy, and release funds only when the task is allowed to proceed.",
  },
  {
    title: "Human approvals",
    description: "Escalate edge cases to Slack, email, or magic links when spend needs a second pair of eyes.",
  },
  {
    title: "Agent wallets",
    description: "Dedicated wallets per agent or environment — testnet today, mainnet when you're ready.",
  },
] as const;

export const howItWorks = {
  eyebrow: "How it works",
  title: "From wallet to paid API in three steps",
  description:
    "No custodial hop. Deposit USDC to your agent address, pick services from the registry, and let the task router settle each call.",
  steps: [
    {
      step: "01",
      title: "Connect wallet",
      description: "Create a local BYOK wallet on Base, fund USDC, and verify with doctor.",
    },
    {
      step: "02",
      title: "Discover services",
      description: "Browse the curated x402 registry — search, data, weather, and more by capability.",
    },
    {
      step: "03",
      title: "Pay & execute",
      description: "Quote or run a task under budget; each subtask pays via x402 and logs a receipt.",
    },
  ] as const,
} as const;

export const docsPreview = {
  eyebrow: "Documentation",
  title: "How AgentCash fits your stack",
  description:
    "Product docs live at docs.agentcash.tech — wallet setup, x402 settlement, registry slugs, and the task router. Use this map to jump in; the site stays a preview until the dashboard ships.",
  guides: [
    {
      title: "Day 1 wallet & CLI",
      description:
        "Create ~/.agentcash/wallet.key, run doctor on testnet, and pay your first x402 merchant without a hosted custodian.",
      href: URLS.docs,
      tag: "Quickstart",
    },
    {
      title: "x402 USDC payments",
      description:
        "HTTP 402 flows, Coinbase facilitator config, USDC on Base, and receipts on disk for every settled call.",
      href: URLS.docs,
      tag: "Payments",
    },
    {
      title: "Curated registry",
      description:
        "registry.yaml slugs for search, weather, and data APIs — planners stay on merchants you allow.",
      href: URLS.docs,
      tag: "Registry",
    },
    {
      title: "Task Router v0",
      description:
        "quote and run under a budget; sequential subtasks, per-slug spend, and audit-friendly logs.",
      href: URLS.docs,
      tag: "Router",
    },
    {
      title: "MCP & agent tools",
      description:
        "Wire spend into MCP servers and autonomous loops — same guardrails as the CLI, built for agents.",
      href: URLS.docs,
      tag: "Agents",
    },
    {
      title: "Operations & status",
      description: "Health checks, facilitator outages, and network choice — monitor before mainnet spend.",
      href: URLS.status,
      tag: "Status",
    },
  ] as const,
  primaryCta: "Open documentation",
  secondaryCta: "View system status",
} as const;

export const developersSection = {
  eyebrow: "Developers",
  title: "Ship with the agentcash CLI",
  description:
    "Wallet, pay, quote, and run — same binary as @agentcash/x402-client and @agentcash/task-router.",
  terminalLabel: "CLI preview",
  primaryCta: "Get the CLI",
  secondaryCta: "Read the docs",
} as const;

export type CliTabId = "wallet" | "pay" | "quote" | "run";

export const cliTabs: { id: CliTabId; label: string }[] = [
  { id: "wallet", label: "wallet" },
  { id: "pay", label: "pay" },
  { id: "quote", label: "quote" },
  { id: "run", label: "run" },
];

export const cliTabContent: Record<
  CliTabId,
  { command: string; lines: { kind: "cmd" | "out" | "ok"; text: string }[] }
> = {
  wallet: {
    command: "npx agentcash wallet create --agree-tos",
    lines: [
      { kind: "cmd", text: "$ npx agentcash wallet create --agree-tos" },
      { kind: "out", text: "→ Created ~/.agentcash/wallet.key (chmod 600)" },
      { kind: "out", text: "→ Address: 0x7a3…f2c · Base mainnet" },
      { kind: "ok", text: "✓ Run wallet info to see balances and deposit address" },
    ],
  },
  pay: {
    command:
      "npx agentcash pay --url https://weather.hugen.tokyo/weather/current --agree-tos",
    lines: [
      {
        kind: "cmd",
        text: "$ npx agentcash pay --url https://weather.hugen.tokyo/weather/current --agree-tos",
      },
      { kind: "out", text: "→ x402: payment intent · ~$0.01 USDC" },
      { kind: "out", text: "→ Settlement via Coinbase facilitator (Base)" },
      { kind: "ok", text: "✓ 200 OK · receipt ac_weather_01…" },
    ],
  },
  quote: {
    command: 'npx agentcash quote "research SOL price" --budget 0.20',
    lines: [
      { kind: "cmd", text: '$ npx agentcash quote "research SOL price" --budget 0.20' },
      { kind: "out", text: "→ Planner: registry heuristic (no spend)" },
      { kind: "out", text: "→ Subtasks: brave-search-v1 · projected $0.12 USDC" },
      { kind: "ok", text: "✓ Under budget · dry-run only" },
    ],
  },
  run: {
    command: 'npx agentcash run "get weather in Tokyo" --budget 0.50',
    lines: [
      { kind: "cmd", text: '$ npx agentcash run "get weather in Tokyo" --budget 0.50' },
      { kind: "out", text: "→ Subtask 1/1: weatherapi-v1 · Referer: agentcash/v0" },
      { kind: "out", text: "→ x402 paid fetch · spent $0.01 USDC" },
      { kind: "ok", text: "✓ Run complete · total $0.01 · receipt ac_run_9k2…" },
    ],
  },
};

export const getStarted = {
  titleLead: "Start with",
  titleAccent: "cents",
  titleTail: ", scale to production",
  description: "Join the beta — ship agent payments without rewriting your stack.",
  cta: "Request beta access",
  tiers: [
    {
      name: "Developer",
      price: "Free",
      detail: "Local wallet + CLI during beta",
      features: ["Testnet wallets", "Budget caps", "Receipt export"],
    },
    {
      name: "Team",
      price: "Soon",
      detail: "Shared policies & approvals",
      features: ["Task Router", "Slack approvals", "Spend dashboards"],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Talk to us",
      detail: "Custom settlement & compliance",
      features: ["Dedicated facilitator", "SSO & audit logs", "Custom merchant rules"],
    },
  ] as const,
} as const;

export const faqSection = {
  eyebrow: "FAQ",
  title: "Questions teams ask before wiring spend",
  description: "Straight answers on x402, keys, pricing, and what ships today versus next.",
} as const;

export const faqs = [
  {
    q: "What is x402 and how does AgentCash use it?",
    a: "x402 is the HTTP 402 payment flow for machine-to-machine spend. AgentCash ships a buyer CLI that discovers merchant requirements, signs USDC on Base, and stores receipts — so agents pay APIs without a human authorizing every call.",
  },
  {
    q: "Where are wallet keys stored?",
    a: "By default, keys live locally at ~/.agentcash/wallet.key on the machine running the CLI. The marketing site and future dashboard never hold signing material. CDP and WalletConnect modes are opt-in for teams that want hosted or browser-linked wallets.",
  },
  {
    q: "How is pricing structured?",
    a: "You pay merchants per their x402 quotes (often cents per call) plus chain gas. AgentCash tooling is open source today; hosted dashboard and registry features may add paid tiers later — we will publish pricing before anything is billed.",
  },
  {
    q: "Is AgentCash open source?",
    a: "Yes. The x402 client, registry, and task-router packages live in the public monorepo. You can self-host, audit the payment path, and list providers in the curated registry via pull request.",
  },
  {
    q: "Which networks and assets are supported?",
    a: "Day 1 focuses on USDC on Base mainnet and testnet. The CLI surfaces network choice, facilitator config, and balance checks so you can dry-run on testnet before sending real funds.",
  },
  {
    q: "Can I require human approval before spend?",
    a: "That is the product direction: micro-budgets per task, merchant allowlists, and escalation when a run exceeds policy. Task Router v0 ships in-repo now; Slack, email, and magic-link approvals are on the roadmap.",
  },
] as const;

export const finalCta = {
  eyebrow: "Get started",
  title: "Ready to give your agents a budget?",
  description:
    "Cap a run at cents, settle over x402, and keep receipts on disk — same path as the hero, no wallet required to explore the developer flow.",
  primaryCta: "Start building",
  secondaryCta: "Read the docs",
} as const;

export const reviewsSection = {
  eyebrow: "Builders shipping with AgentCash",
  ariaLabel: "What builders are saying about AgentCash",
} as const;

export const reviews = [
  {
    name: "Maya Chen",
    username: "mayac",
    body: "Our agents settle x402 merchants in USDC—no more pre-funding a dozen API dashboards.",
    role: "Founder, Lattice Agents",
  },
  {
    name: "Jordan Okonkwo",
    username: "jokonkwo",
    body: "agentcash quote + run turned our registry into one budgeted workflow the team actually trusts.",
    role: "Staff engineer, Orbit Ops",
  },
  {
    name: "Sam Rivera",
    username: "samr",
    body: "BYOK wallet at ~/.agentcash means we own keys and Base settlement without a hosted custodian.",
    role: "Infra lead, Synthwave AI",
  },
  {
    name: "Priya Nair",
    username: "priyan",
    body: "Sub-cent micro-payments per tool call—our bot fleet stopped hoarding giant prepaid credits.",
    role: "CTO, Parcelmind",
  },
  {
    name: "Alex Kim",
    username: "alexk",
    body: "Task router v0 paid each registry slug sequentially; receipts on disk are our audit trail.",
    role: "Platform, Driftstack",
  },
  {
    name: "Taylor Brooks",
    username: "tbrooks",
    body: "CLI doctor on testnet caught our facilitator config before we burned mainnet USDC.",
    role: "DevRel, Northline",
  },
  {
    name: "Riley Santos",
    username: "rileys",
    body: "Curated registry.yaml keeps planners on slugs we allow—no surprise paid endpoints in prod.",
    role: "Security, Helix Foundry",
  },
  {
    name: "Morgan Lee",
    username: "morganl",
    body: "Coinbase x402 facilitator plus USDC on Base—agents settle while we sleep.",
    role: "CEO, Autonode Labs",
  },
] as const;

export const footer = {
  tagline:
    "Micro-payments and task routing for autonomous agents — x402, USDC on Base, open source CLI.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Platform", href: "#platform" },
        { label: "How it works", href: "#how-it-works" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Developers",
      links: [
        { label: "Documentation", href: URLS.docs },
        { label: "CLI & examples", href: "#developers" },
        { label: "API health", href: URLS.health },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Status", href: URLS.status },
        { label: "Contact", href: URLS.contact },
        { label: "Early access", href: URLS.waitlist },
      ],
    },
  ] as const,
  legal: "Open source · x402 · USDC on Base",
} as const;

export const dock = {
  nav: [{ href: URLS.docs, label: "Docs", external: true as const }],
  social: [
    { name: "Waitlist", href: URLS.waitlist, external: true as const },
    { name: "Status", href: URLS.status, external: true as const },
  ],
} as const;
