-- Migration: Create devotional series and onboarding tables
-- Description: Adds tables for devotional series catalog, daily content, user enrollments, and onboarding responses

-- =====================================================
-- DEVOTIONAL SERIES CATALOG
-- =====================================================

-- Master catalog of all devotional series
CREATE TABLE IF NOT EXISTS devotional_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  total_days INT NOT NULL CHECK (total_days > 0),
  topics TEXT[] DEFAULT '{}',
  is_seasonal BOOLEAN DEFAULT FALSE,
  season_start_month INT CHECK (season_start_month IS NULL OR (season_start_month >= 1 AND season_start_month <= 12)),
  season_start_day INT CHECK (season_start_day IS NULL OR (season_start_day >= 1 AND season_start_day <= 31)),
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily content for each series
CREATE TABLE IF NOT EXISTS devotional_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES devotional_series(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number > 0),
  title TEXT NOT NULL,
  scripture_refs JSONB NOT NULL DEFAULT '[]'::JSONB,
  content_prompt TEXT NOT NULL,
  reflection_questions TEXT[] DEFAULT '{}',
  prayer_focus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, day_number)
);

-- =====================================================
-- USER SERIES ENROLLMENTS
-- =====================================================

-- Track user enrollments in devotional series (supports multiple simultaneous)
CREATE TABLE IF NOT EXISTS user_series_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES devotional_series(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  current_day INT DEFAULT 1 CHECK (current_day > 0),
  completed_days INT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  reminder_time TIME DEFAULT '07:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, series_id)
);

-- =====================================================
-- ONBOARDING DATA
-- =====================================================

-- Store user onboarding quiz responses for personalization
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  life_area_focus TEXT,
  time_available TEXT CHECK (time_available IN ('5-10min', '10-20min', '20+min')),
  experience_level TEXT CHECK (experience_level IN ('new', 'growing', 'deep')),
  life_stage TEXT CHECK (life_stage IN ('single', 'married', 'parent', 'empty_nester')),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MODIFY EXISTING TABLES
-- =====================================================

-- Add onboarding completion flag to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS default_reminder_time TIME DEFAULT '07:00:00',
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_devotional_series_slug ON devotional_series(slug);
CREATE INDEX IF NOT EXISTS idx_devotional_series_seasonal ON devotional_series(is_seasonal) WHERE is_seasonal = TRUE;
CREATE INDEX IF NOT EXISTS idx_devotional_series_topics ON devotional_series USING GIN(topics);

CREATE INDEX IF NOT EXISTS idx_devotional_days_series ON devotional_days(series_id);
CREATE INDEX IF NOT EXISTS idx_devotional_days_series_day ON devotional_days(series_id, day_number);

CREATE INDEX IF NOT EXISTS idx_user_series_enrollments_user ON user_series_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_series_enrollments_active ON user_series_enrollments(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_series_enrollments_primary ON user_series_enrollments(user_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user ON onboarding_responses(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE devotional_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotional_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_series_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Devotional series: public read access (everyone can browse the catalog)
CREATE POLICY "Anyone can view devotional series" ON devotional_series
  FOR SELECT USING (TRUE);

-- Devotional days: public read access
CREATE POLICY "Anyone can view devotional days" ON devotional_days
  FOR SELECT USING (TRUE);

-- User series enrollments: users only see their own
CREATE POLICY "Users can view own enrollments" ON user_series_enrollments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON user_series_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON user_series_enrollments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own enrollments" ON user_series_enrollments
  FOR DELETE USING (auth.uid() = user_id);

-- Onboarding responses: users only see their own
CREATE POLICY "Users can view own onboarding responses" ON onboarding_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding responses" ON onboarding_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding responses" ON onboarding_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role full access for edge functions
CREATE POLICY "Service role full access to devotional_series" ON devotional_series
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to devotional_days" ON devotional_days
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to user_series_enrollments" ON user_series_enrollments
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to onboarding_responses" ON onboarding_responses
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to ensure only one primary enrollment per user
CREATE OR REPLACE FUNCTION ensure_single_primary_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    -- Set all other enrollments for this user to non-primary
    UPDATE user_series_enrollments
    SET is_primary = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single primary enrollment
DROP TRIGGER IF EXISTS trigger_ensure_single_primary ON user_series_enrollments;
CREATE TRIGGER trigger_ensure_single_primary
  AFTER INSERT OR UPDATE OF is_primary ON user_series_enrollments
  FOR EACH ROW
  WHEN (NEW.is_primary = TRUE)
  EXECUTE FUNCTION ensure_single_primary_enrollment();

-- Function to get recommended series based on onboarding responses
CREATE OR REPLACE FUNCTION get_recommended_series(
  p_life_area TEXT DEFAULT NULL,
  p_experience_level TEXT DEFAULT NULL,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  description TEXT,
  cover_image_url TEXT,
  total_days INT,
  topics TEXT[],
  is_seasonal BOOLEAN,
  difficulty_level TEXT,
  match_score INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id,
    ds.slug,
    ds.title,
    ds.description,
    ds.cover_image_url,
    ds.total_days,
    ds.topics,
    ds.is_seasonal,
    ds.difficulty_level,
    (
      CASE WHEN p_life_area IS NOT NULL AND p_life_area = ANY(ds.topics) THEN 10 ELSE 0 END +
      CASE
        WHEN p_experience_level = 'new' AND ds.difficulty_level = 'beginner' THEN 5
        WHEN p_experience_level = 'growing' AND ds.difficulty_level IN ('beginner', 'intermediate') THEN 5
        WHEN p_experience_level = 'deep' AND ds.difficulty_level IN ('intermediate', 'advanced') THEN 5
        ELSE 0
      END
    )::INT as match_score
  FROM devotional_series ds
  WHERE ds.is_seasonal = FALSE  -- Exclude seasonal by default
  ORDER BY match_score DESC, ds.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current devotional progress
CREATE OR REPLACE FUNCTION get_user_devotional_progress(p_user_id UUID)
RETURNS TABLE (
  enrollment_id UUID,
  series_id UUID,
  series_title TEXT,
  series_slug TEXT,
  total_days INT,
  current_day INT,
  completed_days INT[],
  is_primary BOOLEAN,
  is_active BOOLEAN,
  progress_percentage FLOAT,
  days_remaining INT,
  last_activity_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    use.id as enrollment_id,
    use.series_id,
    ds.title as series_title,
    ds.slug as series_slug,
    ds.total_days,
    use.current_day,
    use.completed_days,
    use.is_primary,
    use.is_active,
    (COALESCE(array_length(use.completed_days, 1), 0)::FLOAT / ds.total_days * 100) as progress_percentage,
    (ds.total_days - COALESCE(array_length(use.completed_days, 1), 0)) as days_remaining,
    use.last_activity_at
  FROM user_series_enrollments use
  JOIN devotional_series ds ON ds.id = use.series_id
  WHERE use.user_id = p_user_id
    AND use.is_active = TRUE
  ORDER BY use.is_primary DESC, use.last_activity_at DESC;
END;
$$ LANGUAGE plpgsql;
