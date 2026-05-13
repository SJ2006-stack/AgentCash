-- Mandate v0.1: agents, mandates, MCP keys, payment ledger + RLS

create extension if not exists pgcrypto;

-- Agents (owned by auth user)
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  stripe_cardholder_id text,
  created_at timestamptz not null default now()
);

create index agents_user_id_idx on public.agents (user_id);

-- Mandates (1:1 per agent for v0.1)
create table public.agent_mandates (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  max_amount_cents_per_request int not null check (max_amount_cents_per_request > 0),
  monthly_max_cents int not null check (monthly_max_cents > 0),
  allowed_merchants text[] not null default '{}',
  currency text not null default 'usd',
  updated_at timestamptz not null default now(),
  unique (agent_id)
);

create index agent_mandates_user_id_idx on public.agent_mandates (user_id);

-- MCP credentials (hashed); plain key shown once in dashboard
create table public.agent_mcp_keys (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  key_prefix text not null,
  secret_hash text not null,
  created_at timestamptz not null default now()
);

create index agent_mcp_keys_agent_id_idx on public.agent_mcp_keys (agent_id);

-- Ledger (inserts from MCP use service role; users read via RLS)
create table public.payment_ledger (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  amount_cents int not null check (amount_cents > 0),
  merchant text not null,
  justification text,
  status text not null check (status in ('approved', 'rejected', 'stripe_failed')),
  stripe_card_id text,
  policy_error text,
  created_at timestamptz not null default now()
);

create index payment_ledger_agent_id_idx on public.payment_ledger (agent_id);
create index payment_ledger_created_at_idx on public.payment_ledger (created_at);

-- ---------- RLS ----------
alter table public.agents enable row level security;
alter table public.agent_mandates enable row level security;
alter table public.agent_mcp_keys enable row level security;
alter table public.payment_ledger enable row level security;

-- agents: owner CRUD
create policy agents_select_own on public.agents
  for select to authenticated using (user_id = (select auth.uid()));

create policy agents_insert_own on public.agents
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy agents_update_own on public.agents
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy agents_delete_own on public.agents
  for delete to authenticated using (user_id = (select auth.uid()));

-- mandates: same owner
create policy agent_mandates_select_own on public.agent_mandates
  for select to authenticated using (user_id = (select auth.uid()));

create policy agent_mandates_insert_own on public.agent_mandates
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy agent_mandates_update_own on public.agent_mandates
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy agent_mandates_delete_own on public.agent_mandates
  for delete to authenticated using (user_id = (select auth.uid()));

-- mcp keys: owner can manage (read/list for UI); agent JWT story deferred — dashboard-only
create policy agent_mcp_keys_select_own on public.agent_mcp_keys
  for select to authenticated using (
    exists (select 1 from public.agents a where a.id = agent_id and a.user_id = (select auth.uid()))
  );

create policy agent_mcp_keys_insert_own on public.agent_mcp_keys
  for insert to authenticated with check (
    exists (select 1 from public.agents a where a.id = agent_id and a.user_id = (select auth.uid()))
  );

create policy agent_mcp_keys_delete_own on public.agent_mcp_keys
  for delete to authenticated using (
    exists (select 1 from public.agents a where a.id = agent_id and a.user_id = (select auth.uid()))
  );

-- ledger: owners read their agents' rows
create policy payment_ledger_select_own on public.payment_ledger
  for select to authenticated using (
    exists (select 1 from public.agents a where a.id = agent_id and a.user_id = (select auth.uid()))
  );

-- No insert/update/delete for authenticated on ledger — MCP uses service_role (bypasses RLS)
