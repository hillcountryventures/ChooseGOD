-- Migration: user_insights cache table for Journey Insights real-AI generation.
--
-- One row per user. Payload is the AIInsight JSON produced by the
-- journey-insights Edge Function. We keep 7-day TTL in code (not constraint)
-- to avoid blocking Pro users from seeing their latest view when they force-refresh.
--
-- RLS: user can read their own row only. Service role writes via Edge Function.

CREATE TABLE IF NOT EXISTS public.user_insights (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_insights_generated_at
  ON public.user_insights (generated_at DESC);

ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own insights" ON public.user_insights;
CREATE POLICY "Users can read own insights"
  ON public.user_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No direct write policy for users; only service role (Edge Function) can write.

CREATE OR REPLACE FUNCTION public.touch_user_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_insights_updated_at ON public.user_insights;
CREATE TRIGGER user_insights_updated_at
  BEFORE UPDATE ON public.user_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_user_insights_updated_at();

COMMENT ON TABLE public.user_insights IS
  'Cache for AI-generated Journey Insights. One row per user. Populated by journey-insights Edge Function. TTL 7 days enforced in application code.';
