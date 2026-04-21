-- Migration: graceful churn flow (Free Pause) + seasonal win-back tracking.
--
-- Per Decision #17. Every cancellation captures the "why" so we can cohort-analyze.
-- Free Pause lets users pause their subscription for 30 days instead of
-- canceling outright \u2014 the hero retention mechanic.

-- =====================================================
-- cancellation_surveys
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cancellation_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('price', 'content', 'timing', 'other', 'skipped')),
  feedback TEXT,
  last_7d_engagement_count INT,
  last_magic_moment TEXT,
  had_crisis_flags BOOLEAN NOT NULL DEFAULT FALSE,
  days_subscribed INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cancellation_surveys_reason
  ON public.cancellation_surveys (reason, created_at DESC);

ALTER TABLE public.cancellation_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own survey" ON public.cancellation_surveys;
CREATE POLICY "Users insert own survey"
  ON public.cancellation_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own survey" ON public.cancellation_surveys;
CREATE POLICY "Users view own survey"
  ON public.cancellation_surveys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- subscription_pauses (Free Pause \u2014 30 days)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscription_pauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paused_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resumes_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  ended_at TIMESTAMPTZ,
  reason_at_pause TEXT
);

CREATE INDEX IF NOT EXISTS idx_pauses_user_active
  ON public.subscription_pauses (user_id)
  WHERE ended_at IS NULL;

ALTER TABLE public.subscription_pauses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own pauses" ON public.subscription_pauses;
CREATE POLICY "Users view own pauses"
  ON public.subscription_pauses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT/UPDATE only via service role (Edge Function handles the RevenueCat
-- integration to actually pause the subscription there).

-- =====================================================
-- winback_sends \u2014 log seasonal + 60-day re-invitation emails so we
-- never spam (3-ignored-then-stop rule per Decision #17).
-- =====================================================
CREATE TABLE IF NOT EXISTS public.winback_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('60_day', 'advent', 'lent', 'easter', 'new_year')),
  opened_at TIMESTAMPTZ,
  resubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winback_sends_user_scope
  ON public.winback_sends (user_id, scope, created_at DESC);

ALTER TABLE public.winback_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own winback sends" ON public.winback_sends;
CREATE POLICY "Users view own winback sends"
  ON public.winback_sends
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.cancellation_surveys IS
  'Post-cancel survey per Decision #17. Captures reason + last engagement + crisis-flag count to cohort churn analysis.';
COMMENT ON TABLE public.subscription_pauses IS
  'Free Pause retention mechanic (30 days) per Decision #17. Does NOT lose Pro data.';
COMMENT ON TABLE public.winback_sends IS
  'Seasonal + 60-day re-invitation email log. 3 ignored touchpoints = stop.';
