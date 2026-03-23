-- Migration: Create spiritual_health_scores table for tracking period-over-period growth
-- Scores are computed locally and stored here for historical comparison
-- Enables the "change %" feature in Journey → Insights

CREATE TABLE IF NOT EXISTS public.spiritual_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  period TEXT NOT NULL,           -- 'week' | 'month' | 'quarter' | 'year'
  period_start TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for efficient historical queries
CREATE INDEX idx_health_scores_user_period
  ON public.spiritual_health_scores(user_id, period, period_start DESC);

CREATE INDEX idx_health_scores_recorded_at
  ON public.spiritual_health_scores(user_id, recorded_at DESC);

-- Row level security
ALTER TABLE public.spiritual_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own scores"
  ON public.spiritual_health_scores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own scores"
  ON public.spiritual_health_scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT ON public.spiritual_health_scores TO authenticated;

-- DOWN:
-- DROP TABLE IF EXISTS public.spiritual_health_scores;
