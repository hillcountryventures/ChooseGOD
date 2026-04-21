-- Migration: Pro-delight infrastructure per Decision #17.
--
-- Three surfaces backed by this migration:
-- 1. life_events \u2014 periodic "what's going on in your life?" check-in.
--    Answers reshape notification tone + devotional recs for ~60 days.
-- 2. check_ins \u2014 generic log of 6-month Covenant Check-Ins and similar.
-- 3. annual_reviews \u2014 cached payload for the December "Walk with God" review.

-- =====================================================
-- life_events
-- =====================================================
CREATE TABLE IF NOT EXISTS public.life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('thriving', 'struggling', 'big_change', 'same')),
  context_note TEXT, -- optional free text ("I lost my dad")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Convenience: for how many days should this event reshape the experience
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 days')
);

CREATE INDEX IF NOT EXISTS idx_life_events_user_active
  ON public.life_events (user_id, expires_at DESC);

ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own life events" ON public.life_events;
CREATE POLICY "Users manage own life events"
  ON public.life_events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- check_ins (6-month Covenant Check-In + future check-ins)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('six_month', 'annual', 'trial_end')),
  response TEXT CHECK (response IN ('still_loving', 'want_more', 'thinking_of_canceling', 'sharing_feedback')),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_check_ins_user
  ON public.check_ins (user_id, created_at DESC);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own check_ins" ON public.check_ins;
CREATE POLICY "Users manage own check_ins"
  ON public.check_ins
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- annual_reviews (cached payload, regenerated each year)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.annual_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  payload JSONB NOT NULL, -- stats, themes, top verses, narrative arc
  narration_url TEXT, -- founder-voice audio via Voicebox (optional)
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, year)
);

CREATE INDEX IF NOT EXISTS idx_annual_reviews_user_year
  ON public.annual_reviews (user_id, year DESC);

ALTER TABLE public.annual_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own annual reviews" ON public.annual_reviews;
CREATE POLICY "Users view own annual reviews"
  ON public.annual_reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No write policy \u2014 service role / Edge Function writes.

COMMENT ON TABLE public.life_events IS
  'Decision #17: life-event awareness. Answers reshape notifications + devotional recs for 60 days.';
COMMENT ON TABLE public.check_ins IS
  'Decision #17: 6-month Covenant Check-In + future check-ins (annual, trial-end).';
COMMENT ON TABLE public.annual_reviews IS
  'Decision #17: annual "Your Walk with God" review, delivered Dec 15 before Jan auto-renewal.';
