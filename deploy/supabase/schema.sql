-- Portmetals Africa — Supabase schema
-- Run this once in Supabase → SQL Editor (or `psql` against your DB).
-- Idempotent: safe to re-run.
--
-- Security model:
--   * RLS enabled, zero policies            → anon/authenticated clients get nothing.
--   * RPCs granted ONLY to service_role     → the Express server is the only writer.
--   * Server-side gate: /api/sync also requires the SYNC_DEVICE_SECRET header
--     (see deploy/SUPABASE.md). Defense in depth — this file stays valid even if
--     that gate is ever removed.

-- ─── Business state sync ───────────────────────────────────────────────────
-- The whole app's business data (inventory, orders, wallet, loyalty, AI
-- conversations, settings, …) is stored as one JSONB document per user.
-- The Express server is the ONLY writer (service-role key, server-side).
-- RLS is enabled with NO policies, so anon/authenticated clients can never
-- touch this table directly — they must go through the app's /api/sync.

create table if not exists public.business_state (
  id         uuid primary key default gen_random_uuid(),
  user_key   text not null unique,
  payload    jsonb not null default '{}'::jsonb,
  version    bigint not null default 1,
  updated_at timestamptz not null default now()
);

create index if not exists business_state_updated_at_idx
  on public.business_state (updated_at desc);

-- Lock it down: service role bypasses RLS; everyone else is denied.
alter table public.business_state enable row level security;

-- ─── Atomic save (upsert + version bump in one statement) ──────────────────
-- Called by the server as an RPC: save_business_state(p_key, p_payload).
-- security definer + search_path pinned so the function can't be abused.

create or replace function public.save_business_state(p_key text, p_payload jsonb)
returns table (out_version bigint, out_updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_state (user_key, payload, version, updated_at)
  values (p_key, p_payload, 1, now())
  on conflict (user_key) do update
  set payload    = excluded.payload,
      version    = public.business_state.version + 1,
      updated_at = now();
  return query
    select public.business_state.version, public.business_state.updated_at
    from public.business_state
    where user_key = p_key;
end;
$$;

-- Only the service role (server) may call it. Anonymous clients get nothing.
revoke all on function public.save_business_state(text, jsonb) from public;
grant execute on function public.save_business_state(text, jsonb) to service_role;

-- ─── Optional: delete helper for the server ────────────────────────────────
create or replace function public.clear_business_state(p_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.business_state where user_key = p_key;
end;
$$;

revoke all on function public.clear_business_state(text) from public;
grant execute on function public.clear_business_state(text) to service_role;
