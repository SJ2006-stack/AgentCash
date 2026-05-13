-- v0.15 power features: shadow mode, approval bridge, semantic justification, exploding cards

-- 1. Mandate: shadow mode + approval channels + thresholds
alter table public.agent_mandates
  add column shadow_mode boolean not null default false,
  add column require_approval_above_cents int,
  add column always_require_approval boolean not null default false,
  add column approval_channel text not null default 'none'
    check (approval_channel in ('none', 'slack', 'whatsapp', 'both')),
  add column slack_webhook_url text,
  add column whatsapp_to_e164 text,
  add column approval_timeout_seconds int not null default 180
    check (approval_timeout_seconds between 30 and 1800);

-- 2. Ledger: semantic intent + mode + card metadata
alter table public.payment_ledger
  add column intent text,
  add column source_context text,
  add column mode text not null default 'live'
    check (mode in ('live', 'shadow')),
  add column card_kind text
    check (card_kind in ('single_use', 'subscription_lock')),
  add column merchant_lock text,
  add column expires_at timestamptz;

-- Allow new ledger status values without recreating column
alter table public.payment_ledger
  drop constraint if exists payment_ledger_status_check;
alter table public.payment_ledger
  add constraint payment_ledger_status_check check (
    status in ('approved', 'rejected', 'stripe_failed', 'shadow_approved', 'awaiting_approval', 'approval_denied', 'approval_timeout')
  );

-- 3. Approvals queue
create table public.pending_approvals (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  token text not null unique,
  amount_cents int not null check (amount_cents > 0),
  merchant text not null,
  intent text not null,
  source_context text,
  card_kind text not null check (card_kind in ('single_use', 'subscription_lock')),
  subscription_period_days int check (subscription_period_days between 1 and 365),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied', 'timeout', 'cancelled')),
  decided_by text,
  decided_via text check (decided_via in ('dashboard', 'slack', 'whatsapp', 'magic_link')),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index pending_approvals_agent_status_idx on public.pending_approvals (agent_id, status);
create index pending_approvals_token_idx on public.pending_approvals (token);

-- 4. Issued cards (live tracking for exploding cards and cancel)
create table public.agent_cards (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  ledger_id uuid references public.payment_ledger (id) on delete set null,
  stripe_card_id text not null,
  last4 text,
  card_kind text not null check (card_kind in ('single_use', 'subscription_lock')),
  merchant_lock text not null,
  amount_cents int not null,
  expires_at timestamptz,
  status text not null default 'active'
    check (status in ('active', 'expired', 'cancelled')),
  created_at timestamptz not null default now()
);

create index agent_cards_agent_status_idx on public.agent_cards (agent_id, status);

-- 5. RLS for new tables (owner reads, server writes via service_role)
alter table public.pending_approvals enable row level security;
alter table public.agent_cards enable row level security;

create policy pending_approvals_select_own on public.pending_approvals
  for select to authenticated using (
    exists (select 1 from public.agents a where a.id = agent_id and a.user_id = (select auth.uid()))
  );

-- Owners can mark decisions from dashboard
create policy pending_approvals_update_own on public.pending_approvals
  for update to authenticated using (
    exists (select 1 from public.agents a where a.id = agent_id and a.user_id = (select auth.uid()))
  );

create policy agent_cards_select_own on public.agent_cards
  for select to authenticated using (
    exists (select 1 from public.agents a where a.id = agent_id and a.user_id = (select auth.uid()))
  );

create policy agent_cards_update_own on public.agent_cards
  for update to authenticated using (
    exists (select 1 from public.agents a where a.id = agent_id and a.user_id = (select auth.uid()))
  );

-- 6. Anonymous magic-link decision RPC (token-scoped, no auth required)
create or replace function public.decide_pending_approval(
  p_token text,
  p_decision text,
  p_via text,
  p_actor text
) returns table (status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.pending_approvals;
begin
  if p_decision not in ('approved', 'denied') then
    raise exception 'invalid_decision';
  end if;
  if p_via not in ('dashboard', 'slack', 'whatsapp', 'magic_link') then
    raise exception 'invalid_via';
  end if;
  select * into v_row from public.pending_approvals where token = p_token;
  if not found then
    raise exception 'unknown_token';
  end if;
  if v_row.status <> 'pending' then
    return query select v_row.status;
    return;
  end if;
  update public.pending_approvals
    set status = p_decision,
        decided_by = p_actor,
        decided_via = p_via,
        decided_at = now()
    where token = p_token and status = 'pending';
  return query select p_decision;
end;
$$;

revoke all on function public.decide_pending_approval(text, text, text, text) from public;
grant execute on function public.decide_pending_approval(text, text, text, text) to anon, authenticated, service_role;
