-- Weekly Digest Email Feature
-- Adds opt-in preference for weekly summary emails

-- =====================================================
-- 1. ADD PREFERENCE COLUMN
-- =====================================================

-- Add weekly_digest_enabled to user profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'weekly_digest_enabled'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN weekly_digest_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add last_digest_sent_at to track when we last sent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'last_digest_sent_at'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN last_digest_sent_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- =====================================================
-- 2. BIBLE READING HISTORY TABLE
-- =====================================================

-- Track what chapters users have read for digest stats
CREATE TABLE IF NOT EXISTS bible_reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  translation TEXT NOT NULL DEFAULT 'KJV',
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user ON bible_reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_date ON bible_reading_history(read_at);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE bible_reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading history" ON bible_reading_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading history" ON bible_reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role for digest function
CREATE POLICY "Service role full access to reading history" ON bible_reading_history
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 4. FUNCTION TO LOG CHAPTER READ
-- =====================================================

CREATE OR REPLACE FUNCTION log_chapter_read(
  p_book TEXT,
  p_chapter INTEGER,
  p_translation TEXT DEFAULT 'KJV',
  p_time_spent_seconds INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO bible_reading_history (user_id, book, chapter, translation, time_spent_seconds)
  VALUES (auth.uid(), p_book, p_chapter, p_translation, p_time_spent_seconds)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CRON JOB FOR WEEKLY DIGEST (requires pg_cron extension)
-- =====================================================

-- Note: This requires pg_cron extension to be enabled in Supabase
-- The actual cron job should be set up in Supabase Dashboard > Database > Extensions > pg_cron
-- Schedule: Every Sunday at 8:00 AM UTC

-- Example cron setup (run in SQL editor after enabling pg_cron):
-- SELECT cron.schedule(
--   'weekly-digest',
--   '0 8 * * 0', -- Every Sunday at 8:00 AM UTC
--   $$
--   SELECT net.http_post(
--     url := 'https://<project-ref>.supabase.co/functions/v1/weekly-digest',
--     headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
--   );
--   $$
-- );
