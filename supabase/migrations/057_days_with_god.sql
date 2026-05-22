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
