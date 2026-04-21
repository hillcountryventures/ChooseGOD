-- Migration: Add missing Row Level Security (RLS) to security-critical tables.
--
-- Three tables previously had no RLS and could be read/written directly
-- by any authenticated user via the anon key:
--   - subscriptions         (premium status — revenue-critical)
--   - chat_interactions     (fraud-detection audit log)
--   - companion_audit_logs  (Scripture-fidelity audit log)
--
-- After this migration:
--   - Users can READ their own subscription record only (service role still writes via webhook).
--   - Users can READ their own chat_interactions only; inserts are server-side only.
--   - companion_audit_logs is fully locked down to admins/service role.

-- =====================================================
-- subscriptions
-- =====================================================
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated users.
-- Only the service role (used by the revenuecat-webhook Edge Function) can write.

-- =====================================================
-- chat_interactions
-- =====================================================
ALTER TABLE IF EXISTS public.chat_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own interactions" ON public.chat_interactions;
CREATE POLICY "Users can view own interactions"
  ON public.chat_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies — only server-side (companion Edge Function) inserts.
-- This prevents users from deleting anomaly-detection rows to cover fraud attempts.

-- =====================================================
-- companion_audit_logs
-- =====================================================
ALTER TABLE IF EXISTS public.companion_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No user access to audit logs" ON public.companion_audit_logs;
CREATE POLICY "No user access to audit logs"
  ON public.companion_audit_logs
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Only the service role can read/write audit logs.

-- =====================================================
-- Sanity check
-- =====================================================
DO $$
DECLARE
  tbl TEXT;
  missing_rls TEXT[] := '{}';
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['subscriptions', 'chat_interactions', 'companion_audit_logs'])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = tbl
        AND rowsecurity = true
    ) THEN
      missing_rls := array_append(missing_rls, tbl);
    END IF;
  END LOOP;

  IF array_length(missing_rls, 1) > 0 THEN
    RAISE WARNING 'RLS not enabled on: %. Table may not exist yet.', array_to_string(missing_rls, ', ');
  END IF;
END $$;
