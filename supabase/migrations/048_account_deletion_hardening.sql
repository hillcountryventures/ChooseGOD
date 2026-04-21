-- Migration: robust user data enumeration + 24h soft-delete grace window.
--
-- Two pieces:
--
-- 1. Canonical get_tables_with_user_id RPC that inspects information_schema
--    for every public table with a `user_id` column. Makes delete-account
--    automatically cover new tables as the schema evolves, closing the
--    audit finding that `obedience_steps`, `spiritual_moments`, and
--    `user_series_enrollments` were silently missed.
--
-- 2. `pending_deletions` table + helper function so the UX can queue a
--    deletion, send the user an export email, and give them a 24-hour
--    grace period to cancel before hard-delete. Reduces accidental-tap
--    account loss without compromising GDPR right-to-erasure.

-- =====================================================
-- 1. Dynamic user-scoped table discovery
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_tables_with_user_id()
RETURNS TABLE(table_name TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $func$
  SELECT c.table_name::TEXT
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON c.table_schema = t.table_schema
     AND c.table_name = t.table_name
   WHERE c.table_schema = 'public'
     AND c.column_name = 'user_id'
     AND t.table_type = 'BASE TABLE'
     -- Skip audit / bookkeeping tables that should persist beyond user life
     AND c.table_name NOT IN (
       'webhook_logs',
       'companion_audit_logs',
       'email_unsubscribe_tokens'
     )
   ORDER BY c.table_name;
$func$;

DO $grants$
BEGIN
  REVOKE ALL ON FUNCTION public.get_tables_with_user_id() FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION public.get_tables_with_user_id() TO service_role;
END
$grants$;

-- =====================================================
-- 2. Deletion grace window
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pending_deletions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  execute_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  export_url TEXT,
  cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pending_deletions_execute_at
  ON public.pending_deletions (execute_at) WHERE cancelled = FALSE;

ALTER TABLE public.pending_deletions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own pending deletion" ON public.pending_deletions;
CREATE POLICY "Users view own pending deletion"
  ON public.pending_deletions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users cancel own pending deletion" ON public.pending_deletions;
CREATE POLICY "Users cancel own pending deletion"
  ON public.pending_deletions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND cancelled = TRUE);

-- No INSERT for users \u2014 only delete-account Edge Function creates rows.

COMMENT ON TABLE public.pending_deletions IS
  'Soft-delete grace window. Deletion queued for 24h; user can cancel. Hard-delete executed by scheduled worker or delete-account finalize call.';

COMMENT ON FUNCTION public.get_tables_with_user_id() IS
  'Returns every public BASE TABLE with a user_id column (minus audit-retention tables). Used by delete-account Edge Function for GDPR-complete erasure.';
