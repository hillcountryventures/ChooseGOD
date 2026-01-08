-- Migration: Create Wayfarer Bible Reading Plan tables
-- Description: Adds tables for adaptive 365-day Bible reading plans with progress tracking and missed session handling

-- =====================================================
-- READING PLANS CATALOG
-- =====================================================

-- Master catalog of all Bible reading plans
CREATE TABLE IF NOT EXISTS reading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  total_days INT NOT NULL CHECK (total_days > 0),
  plan_type TEXT DEFAULT 'canonical' CHECK (plan_type IN ('canonical', 'chronological', 'thematic', 'gospels_first')),
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily reading sections for each plan
CREATE TABLE IF NOT EXISTS plan_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number > 0),
  display_title TEXT NOT NULL,
  verses_json JSONB NOT NULL DEFAULT '[]'::JSONB,
  summary_text TEXT,
  summary_prompt TEXT,
  estimated_read_minutes INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, day_number)
);

-- =====================================================
-- USER READING PROGRESS
-- =====================================================

-- Track user progress in reading plans
CREATE TABLE IF NOT EXISTS user_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  current_day INT DEFAULT 1 CHECK (current_day > 0),
  completed_days INT[] DEFAULT '{}',
  is_adaptive_mode_active BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE DEFAULT CURRENT_DATE,
  planned_end_date DATE,
  last_read_at TIMESTAMPTZ,
  streak_count INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_chapters_read INT DEFAULT 0,
  reminder_time TIME DEFAULT '07:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- =====================================================
-- SKIPPED/MISSED SESSIONS
-- =====================================================

-- Track missed days for AI analysis and adaptive features
CREATE TABLE IF NOT EXISTS skipped_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  progress_id UUID NOT NULL REFERENCES user_reading_progress(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  original_date DATE NOT NULL,
  skipped_at TIMESTAMPTZ DEFAULT NOW(),
  resolution_type TEXT CHECK (resolution_type IN ('grace_summary', 'patient_shift', 'caught_up', 'pending')),
  resolved_at TIMESTAMPTZ,
  ai_summary TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- READING SESSION LOGS
-- =====================================================

-- Detailed log of each reading session for analytics
CREATE TABLE IF NOT EXISTS reading_session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  progress_id UUID NOT NULL REFERENCES user_reading_progress(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  verses_read JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reading_plans_slug ON reading_plans(slug);
CREATE INDEX IF NOT EXISTS idx_reading_plans_active ON reading_plans(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_plan_sections_plan ON plan_sections(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_sections_plan_day ON plan_sections(plan_id, day_number);

CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user ON user_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_active ON user_reading_progress(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_adaptive ON user_reading_progress(user_id, is_adaptive_mode_active) WHERE is_adaptive_mode_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_skipped_sessions_user ON skipped_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_skipped_sessions_progress ON skipped_sessions(progress_id);
CREATE INDEX IF NOT EXISTS idx_skipped_sessions_pending ON skipped_sessions(user_id, resolution_type) WHERE resolution_type = 'pending';

CREATE INDEX IF NOT EXISTS idx_reading_session_logs_user ON reading_session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_session_logs_progress ON reading_session_logs(progress_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE skipped_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_session_logs ENABLE ROW LEVEL SECURITY;

-- Reading plans: public read access (everyone can browse available plans)
CREATE POLICY "Anyone can view reading plans" ON reading_plans
  FOR SELECT USING (TRUE);

-- Plan sections: public read access
CREATE POLICY "Anyone can view plan sections" ON plan_sections
  FOR SELECT USING (TRUE);

-- User reading progress: users only see their own
CREATE POLICY "Users can view own reading progress" ON user_reading_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading progress" ON user_reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading progress" ON user_reading_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading progress" ON user_reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Skipped sessions: users only see their own
CREATE POLICY "Users can view own skipped sessions" ON skipped_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skipped sessions" ON skipped_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skipped sessions" ON skipped_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skipped sessions" ON skipped_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Reading session logs: users only see their own
CREATE POLICY "Users can view own reading session logs" ON reading_session_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading session logs" ON reading_session_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading session logs" ON reading_session_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update timestamp on reading progress changes
CREATE OR REPLACE FUNCTION update_reading_progress_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS trigger_update_reading_progress_timestamp ON user_reading_progress;
CREATE TRIGGER trigger_update_reading_progress_timestamp
  BEFORE UPDATE ON user_reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_progress_timestamp();

-- Function to get user's reading plan progress with plan details
CREATE OR REPLACE FUNCTION get_user_reading_plan_progress(p_user_id UUID)
RETURNS TABLE (
  progress_id UUID,
  plan_id UUID,
  plan_name TEXT,
  plan_slug TEXT,
  total_days INT,
  current_day INT,
  completed_days INT[],
  is_adaptive_mode_active BOOLEAN,
  is_active BOOLEAN,
  start_date DATE,
  planned_end_date DATE,
  last_read_at TIMESTAMPTZ,
  streak_count INT,
  longest_streak INT,
  progress_percentage FLOAT,
  days_remaining INT,
  pending_skipped_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    urp.id as progress_id,
    urp.plan_id,
    rp.name as plan_name,
    rp.slug as plan_slug,
    rp.total_days,
    urp.current_day,
    urp.completed_days,
    urp.is_adaptive_mode_active,
    urp.is_active,
    urp.start_date,
    urp.planned_end_date,
    urp.last_read_at,
    urp.streak_count,
    urp.longest_streak,
    (COALESCE(array_length(urp.completed_days, 1), 0)::FLOAT / rp.total_days * 100) as progress_percentage,
    (rp.total_days - COALESCE(array_length(urp.completed_days, 1), 0)) as days_remaining,
    (SELECT COUNT(*) FROM skipped_sessions ss WHERE ss.progress_id = urp.id AND ss.resolution_type = 'pending') as pending_skipped_count
  FROM user_reading_progress urp
  JOIN reading_plans rp ON rp.id = urp.plan_id
  WHERE urp.user_id = p_user_id
    AND urp.is_active = TRUE
  ORDER BY urp.last_read_at DESC NULLS LAST;
END;
$$;

-- Function to check and update streak count
CREATE OR REPLACE FUNCTION update_reading_streak(p_progress_id UUID)
RETURNS TABLE (
  new_streak INT,
  is_streak_continued BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_read_at TIMESTAMPTZ;
  v_current_streak INT;
  v_longest_streak INT;
  v_days_since_last INT;
  v_is_continued BOOLEAN;
BEGIN
  -- Get current progress
  SELECT last_read_at, streak_count, longest_streak
  INTO v_last_read_at, v_current_streak, v_longest_streak
  FROM user_reading_progress
  WHERE id = p_progress_id;

  -- Calculate days since last read
  IF v_last_read_at IS NULL THEN
    v_days_since_last := 0;
  ELSE
    v_days_since_last := EXTRACT(DAY FROM (CURRENT_TIMESTAMP - v_last_read_at));
  END IF;

  -- Determine if streak continues
  IF v_days_since_last <= 1 THEN
    v_current_streak := v_current_streak + 1;
    v_is_continued := TRUE;
  ELSE
    v_current_streak := 1;
    v_is_continued := FALSE;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update the record
  UPDATE user_reading_progress
  SET
    streak_count = v_current_streak,
    longest_streak = v_longest_streak,
    last_read_at = NOW()
  WHERE id = p_progress_id;

  new_streak := v_current_streak;
  is_streak_continued := v_is_continued;
  RETURN NEXT;
END;
$$;

-- Function to get today's reading for a user
CREATE OR REPLACE FUNCTION get_todays_reading(p_user_id UUID, p_plan_id UUID DEFAULT NULL)
RETURNS TABLE (
  progress_id UUID,
  plan_id UUID,
  plan_name TEXT,
  day_number INT,
  display_title TEXT,
  verses_json JSONB,
  summary_text TEXT,
  is_adaptive_mode_active BOOLEAN,
  days_missed INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress_id UUID;
  v_plan_id UUID;
  v_current_day INT;
  v_last_read_at TIMESTAMPTZ;
  v_days_since_last INT;
BEGIN
  -- Get user's active progress (primary or specified plan)
  SELECT urp.id, urp.plan_id, urp.current_day, urp.last_read_at
  INTO v_progress_id, v_plan_id, v_current_day, v_last_read_at
  FROM user_reading_progress urp
  WHERE urp.user_id = p_user_id
    AND urp.is_active = TRUE
    AND (p_plan_id IS NULL OR urp.plan_id = p_plan_id)
  ORDER BY urp.last_read_at DESC NULLS LAST
  LIMIT 1;

  IF v_progress_id IS NULL THEN
    RETURN;
  END IF;

  -- Calculate days since last read
  IF v_last_read_at IS NULL THEN
    v_days_since_last := 0;
  ELSE
    v_days_since_last := EXTRACT(DAY FROM (CURRENT_DATE - v_last_read_at::DATE));
  END IF;

  RETURN QUERY
  SELECT
    v_progress_id as progress_id,
    rp.id as plan_id,
    rp.name as plan_name,
    v_current_day as day_number,
    ps.display_title,
    ps.verses_json,
    ps.summary_text,
    urp.is_adaptive_mode_active,
    v_days_since_last as days_missed
  FROM reading_plans rp
  JOIN plan_sections ps ON ps.plan_id = rp.id AND ps.day_number = v_current_day
  JOIN user_reading_progress urp ON urp.plan_id = rp.id AND urp.user_id = p_user_id
  WHERE rp.id = v_plan_id;
END;
$$;

-- Function to mark a day as completed
CREATE OR REPLACE FUNCTION complete_reading_day(
  p_progress_id UUID,
  p_day_number INT,
  p_duration_seconds INT DEFAULT NULL,
  p_reflection TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_current_day INT,
  new_streak INT,
  total_completed INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_completed INT[];
  v_total_days INT;
  v_new_day INT;
  v_streak INT;
BEGIN
  -- Get current state
  SELECT urp.user_id, urp.completed_days, rp.total_days
  INTO v_user_id, v_current_completed, v_total_days
  FROM user_reading_progress urp
  JOIN reading_plans rp ON rp.id = urp.plan_id
  WHERE urp.id = p_progress_id;

  -- Verify user owns this progress
  IF v_user_id != auth.uid() THEN
    success := FALSE;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Add day to completed if not already there
  IF NOT p_day_number = ANY(v_current_completed) THEN
    v_current_completed := array_append(v_current_completed, p_day_number);
  END IF;

  -- Calculate new current day
  v_new_day := p_day_number + 1;
  IF v_new_day > v_total_days THEN
    v_new_day := v_total_days;
  END IF;

  -- Update progress
  UPDATE user_reading_progress
  SET
    completed_days = v_current_completed,
    current_day = v_new_day,
    total_chapters_read = total_chapters_read + 3, -- Average chapters per day
    is_adaptive_mode_active = FALSE
  WHERE id = p_progress_id;

  -- Update streak
  SELECT new_streak INTO v_streak
  FROM update_reading_streak(p_progress_id);

  -- Log the session
  INSERT INTO reading_session_logs (user_id, progress_id, day_number, completed_at, duration_seconds, reflection)
  VALUES (v_user_id, p_progress_id, p_day_number, NOW(), p_duration_seconds, p_reflection);

  success := TRUE;
  new_current_day := v_new_day;
  new_streak := v_streak;
  total_completed := array_length(v_current_completed, 1);
  RETURN NEXT;
END;
$$;

-- Function to apply grace path (AI summary for missed days)
CREATE OR REPLACE FUNCTION apply_grace_path(
  p_progress_id UUID,
  p_ai_summary TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  days_summarized INT,
  new_current_day INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_day INT;
  v_last_read_at TIMESTAMPTZ;
  v_days_missed INT;
  v_i INT;
BEGIN
  -- Get current state
  SELECT user_id, current_day, last_read_at
  INTO v_user_id, v_current_day, v_last_read_at
  FROM user_reading_progress
  WHERE id = p_progress_id;

  -- Verify user owns this progress
  IF v_user_id != auth.uid() THEN
    success := FALSE;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate days missed
  IF v_last_read_at IS NULL THEN
    v_days_missed := 0;
  ELSE
    v_days_missed := EXTRACT(DAY FROM (CURRENT_DATE - v_last_read_at::DATE));
  END IF;

  -- Mark missed days as resolved with grace path
  FOR v_i IN 1..v_days_missed LOOP
    INSERT INTO skipped_sessions (user_id, progress_id, day_number, original_date, resolution_type, resolved_at, ai_summary)
    VALUES (
      v_user_id,
      p_progress_id,
      v_current_day + v_i - 1,
      v_last_read_at::DATE + v_i,
      'grace_summary',
      NOW(),
      p_ai_summary
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Advance current day to catch up with calendar
  UPDATE user_reading_progress
  SET
    current_day = current_day + v_days_missed,
    is_adaptive_mode_active = FALSE,
    last_read_at = NOW()
  WHERE id = p_progress_id
  RETURNING current_day INTO v_current_day;

  success := TRUE;
  days_summarized := v_days_missed;
  new_current_day := v_current_day;
  RETURN NEXT;
END;
$$;

-- Function to apply patient path (shift schedule forward)
CREATE OR REPLACE FUNCTION apply_patient_path(p_progress_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  days_shifted INT,
  new_planned_end_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_day INT;
  v_last_read_at TIMESTAMPTZ;
  v_days_missed INT;
  v_total_days INT;
  v_new_end_date DATE;
  v_i INT;
BEGIN
  -- Get current state
  SELECT urp.user_id, urp.current_day, urp.last_read_at, rp.total_days
  INTO v_user_id, v_current_day, v_last_read_at, v_total_days
  FROM user_reading_progress urp
  JOIN reading_plans rp ON rp.id = urp.plan_id
  WHERE urp.id = p_progress_id;

  -- Verify user owns this progress
  IF v_user_id != auth.uid() THEN
    success := FALSE;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate days missed
  IF v_last_read_at IS NULL THEN
    v_days_missed := 0;
  ELSE
    v_days_missed := EXTRACT(DAY FROM (CURRENT_DATE - v_last_read_at::DATE));
  END IF;

  -- Calculate new end date
  v_new_end_date := CURRENT_DATE + (v_total_days - v_current_day + 1);

  -- Mark missed days as resolved with patient path
  FOR v_i IN 1..v_days_missed LOOP
    INSERT INTO skipped_sessions (user_id, progress_id, day_number, original_date, resolution_type, resolved_at, notes)
    VALUES (
      v_user_id,
      p_progress_id,
      v_current_day + v_i - 1,
      v_last_read_at::DATE + v_i,
      'patient_shift',
      NOW(),
      'Schedule shifted forward'
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Update progress with new end date (keep current day the same)
  UPDATE user_reading_progress
  SET
    planned_end_date = v_new_end_date,
    is_adaptive_mode_active = FALSE,
    last_read_at = NOW()
  WHERE id = p_progress_id;

  success := TRUE;
  days_shifted := v_days_missed;
  new_planned_end_date := v_new_end_date;
  RETURN NEXT;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS FOR ANON/AUTHENTICATED
-- =====================================================

GRANT EXECUTE ON FUNCTION get_user_reading_plan_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_reading_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_todays_reading(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_reading_day(UUID, INT, INT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_grace_path(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_patient_path(UUID) TO authenticated;
