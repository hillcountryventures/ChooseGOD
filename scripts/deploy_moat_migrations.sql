-- ============================================================================
-- ChooseGOD — MOAT-ESSENTIAL migrations (production-safe subset)
-- Run in: Supabase Dashboard -> SQL Editor (project rtozduhxrfsksygsmwuj).
--
-- Only 057 (Days With God) + 059 (user_intentions) — the moat + wedge inputs.
-- Both are fully self-contained (no dependency on tables your prod is missing).
-- Deferred: 056 (Founding) + 060 (Pastor) = gated features the demo doesn't use;
--           058 (Free Pause) needs 'subscription_pauses' from migration 054,
--           which this project never received. Reconcile prod migration history
--           later if you want those.
-- Generated 2026-05-26T17:37:58Z
-- ============================================================================

-- ============================================================================
-- 057_days_with_god.sql
-- ============================================================================
-- 057_days_with_god.sql
-- Strategy Decision #8: cumulative "Days With God" counter that never resets.
-- Replaces consecutive streak as the primary engagement number on the Home
-- screen. Consecutive streak (`current_streak`) stays as a secondary "this
-- week" signal.
--
-- Also adds Grace Days per-month tracking (2/month free, unlimited Pro):
-- `grace_days_used_this_month` + `grace_days_month_anchor` to detect rollover.
--
-- All additive + idempotent so it can re-run cleanly.

DO $migration$
BEGIN
  -- Ensure user_streaks exists (defensive — should already exist from earlier work).
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_streaks'
  ) THEN
    CREATE TABLE public.user_streaks (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_activity_date DATE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users manage own streaks" ON public.user_streaks;
    CREATE POLICY "Users manage own streaks"
      ON public.user_streaks
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Days With God (cumulative, never decrements)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_streaks'
      AND column_name = 'days_with_god'
  ) THEN
    ALTER TABLE public.user_streaks
      ADD COLUMN days_with_god INTEGER NOT NULL DEFAULT 0
      CHECK (days_with_god >= 0);
  END IF;

  -- Grace Days monthly tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_streaks'
      AND column_name = 'grace_days_used_this_month'
  ) THEN
    ALTER TABLE public.user_streaks
      ADD COLUMN grace_days_used_this_month INTEGER NOT NULL DEFAULT 0
      CHECK (grace_days_used_this_month >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_streaks'
      AND column_name = 'grace_days_month_anchor'
  ) THEN
    ALTER TABLE public.user_streaks
      ADD COLUMN grace_days_month_anchor DATE;
  END IF;
END $migration$;

COMMENT ON COLUMN public.user_streaks.days_with_god IS
  'Decision #8: cumulative count of distinct days with any activity. Never resets. Primary engagement number on Home screen.';

COMMENT ON COLUMN public.user_streaks.grace_days_used_this_month IS
  'Decision #8: count of Grace Days used since grace_days_month_anchor. Free users auto-granted 2/month; Pro users unbounded.';

COMMENT ON COLUMN public.user_streaks.grace_days_month_anchor IS
  'First-of-month date used to detect monthly rollover for grace_days_used_this_month.';

-- ============================================================================
-- 059_user_intentions.sql
-- ============================================================================
-- 059_user_intentions.sql
-- Decision G2 — front-load intention capture in onboarding so the
-- companion AI knows the user from Day 0, not Day 7+. Solves the
-- cold-start problem for the personalization moat.
--
-- Schema notes:
--   * Single active intention per user — older ones can be archived but
--     are not surfaced to the AI by default.
--   * 30-day expiry — intentions go stale; the companion shouldn't keep
--     referencing a 6-month-old prayer ask.
--   * RLS: users only see their own.

CREATE TABLE IF NOT EXISTS public.user_intentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 1000),
    set_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    archived_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'onboarding'
        CHECK (source IN ('onboarding', 'settings', 'check_in'))
);

-- Only one active intention per user — replace by setting old to inactive.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_intentions_one_active
    ON public.user_intentions (user_id) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_intentions_user_set
    ON public.user_intentions (user_id, set_at DESC);

ALTER TABLE public.user_intentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own intentions" ON public.user_intentions;
CREATE POLICY "Users manage own intentions"
    ON public.user_intentions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RPC — set_user_intention: archive any prior active row, insert new active row.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_user_intention(
    p_content TEXT,
    p_source TEXT DEFAULT 'settings'
)
RETURNS public.user_intentions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
    new_intention public.user_intentions;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'authenticated user required'
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.user_intentions
       SET is_active = FALSE,
           archived_at = NOW()
     WHERE user_id = auth.uid()
       AND is_active = TRUE;

    INSERT INTO public.user_intentions (user_id, content, source)
    VALUES (auth.uid(), p_content, p_source)
    RETURNING * INTO new_intention;

    RETURN new_intention;
END;
$func$;

DO $grants$
BEGIN
    GRANT EXECUTE ON FUNCTION public.set_user_intention(TEXT, TEXT) TO authenticated;
END $grants$;

COMMENT ON TABLE public.user_intentions IS
    'Decision G2 — what the user is praying through right now. Injected into the companion AI system prompt so personalization starts on Day 0, not Day 7.';

