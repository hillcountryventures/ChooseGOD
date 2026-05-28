-- 061_webhook_idempotency.sql
-- Idempotency for RevenueCat webhook deliveries.
--
-- RevenueCat retries webhook deliveries (and can deliver out of order). Without
-- a dedup guard, a replayed event re-runs the subscriptions upsert and any
-- downstream grant. This table records each processed RevenueCat event id; the
-- edge function INSERTs here first and skips on a duplicate-key conflict.

create table if not exists public.processed_webhook_events (
  event_id     text primary key,
  event_type   text,
  processed_at timestamptz not null default now()
);

-- Service-role only (the edge function writes/reads this). Enable RLS with NO
-- policies so anon/authenticated callers get nothing; service_role bypasses RLS.
alter table public.processed_webhook_events enable row level security;
