-- ============================================================
-- ChooseGOD — Recommended Row-Level Security (RLS) Policies
-- Apply via Supabase Dashboard → SQL Editor
-- ============================================================
-- These policies enforce: each authenticated user can only
-- read / write their own rows. No cross-user data access.
-- ============================================================

-- 1. reading_progress
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading progress"
  ON reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress"
  ON reading_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading progress"
  ON reading_progress FOR DELETE
  USING (auth.uid() = user_id);

-- 2. bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 3. highlights
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own highlights"
  ON highlights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
  ON highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own highlights"
  ON highlights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
  ON highlights FOR DELETE
  USING (auth.uid() = user_id);

-- 4. prayers
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prayers"
  ON prayers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayers"
  ON prayers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers"
  ON prayers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayers"
  ON prayers FOR DELETE
  USING (auth.uid() = user_id);

-- 5. journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 6. chat_logs
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat logs"
  ON chat_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat logs"
  ON chat_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Chat logs are append-only: no update/delete for integrity
-- If you want users to delete their chat history, uncomment:
-- CREATE POLICY "Users can delete own chat logs"
--   ON chat_logs FOR DELETE
--   USING (auth.uid() = user_id);

-- ============================================================
-- user_profiles — users can only read/write their own profile
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can upsert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
