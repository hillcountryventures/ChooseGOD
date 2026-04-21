-- Migration: Prayer Circle moderation primitives.
--
-- Establishes the minimum surface area needed to handle harassment and spam
-- inside prayer circles without shipping a full admin backoffice.
--
-- 1. `reports` \u2014 users flag a prayer or a circle member; support/admin
--    triages manually via Supabase Studio for now.
-- 2. `user_blocks` \u2014 client-side hides blocked users' content across the app.
-- 3. Indexes + RLS so users can only read/write their own rows.
-- 4. Enforces the 50-member cap at the DB level via trigger, mirroring the
--    client-side check in prayerCircleStore.ts (defense-in-depth).

-- =====================================================
-- reports
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('prayer_request', 'circle_member', 'prayer_circle')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewing', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_reports_target
  ON public.reports (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON public.reports (status) WHERE status = 'open';

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create own reports" ON public.reports;
CREATE POLICY "Users can create own reports"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_user_id);

-- No UPDATE/DELETE for users \u2014 only service role / admin tooling.

-- =====================================================
-- user_blocks
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_user_id, blocked_user_id),
  CHECK (blocker_user_id <> blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker
  ON public.user_blocks (blocker_user_id);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own blocks" ON public.user_blocks;
CREATE POLICY "Users manage own blocks"
  ON public.user_blocks
  FOR ALL
  TO authenticated
  USING (auth.uid() = blocker_user_id)
  WITH CHECK (auth.uid() = blocker_user_id);

-- =====================================================
-- Circle member cap trigger (defense-in-depth)
-- =====================================================
CREATE OR REPLACE FUNCTION public.enforce_circle_member_cap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
DECLARE
  current_count INT;
  CIRCLE_MAX_MEMBERS CONSTANT INT := 50;
BEGIN
  SELECT COUNT(*)
    INTO current_count
    FROM public.circle_members
   WHERE circle_id = NEW.circle_id;

  IF current_count >= CIRCLE_MAX_MEMBERS THEN
    RAISE EXCEPTION 'Circle is full (% members)', CIRCLE_MAX_MEMBERS
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$func$;

DO $trigger_setup$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'circle_members'
  ) THEN
    DROP TRIGGER IF EXISTS trg_enforce_circle_cap ON public.circle_members;
    CREATE TRIGGER trg_enforce_circle_cap
      BEFORE INSERT ON public.circle_members
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_circle_member_cap();
  END IF;
END
$trigger_setup$;

COMMENT ON TABLE public.reports IS
  'User-submitted reports for prayers/members/circles. Triaged manually via Supabase Studio in Phase 1; proper admin UI is Phase 2.';
COMMENT ON TABLE public.user_blocks IS
  'Per-user block list. Client hides blocked users\u2019 content across circles + shared surfaces.';
