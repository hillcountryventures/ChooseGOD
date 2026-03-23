-- Migration: Create user_streaks table for server-side streak storage
-- Previously streaks were local-only via UserDefaults; this enables persistence across reinstall
-- Also allows public streak leaderboards in future (when we add them)

CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficiency
CREATE INDEX idx_user_streaks_updated_at ON public.user_streaks(updated_at DESC);
CREATE INDEX idx_user_streaks_longest ON public.user_streaks(longest_streak DESC);

-- Row level security
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own streak"
  ON public.user_streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users upsert own streak"
  ON public.user_streaks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_user_streaks_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.user_streaks TO authenticated;

-- DOWN:
-- DROP TRIGGER IF EXISTS user_streaks_updated_at ON public.user_streaks;
-- DROP FUNCTION IF EXISTS update_user_streaks_updated_at();
-- DROP TABLE IF EXISTS public.user_streaks;
