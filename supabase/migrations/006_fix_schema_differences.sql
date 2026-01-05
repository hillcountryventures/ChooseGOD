-- Migration: Fix schema differences between local and remote
-- Description: Adds missing columns to devotional tables that were created with different schema

-- Add missing columns to devotional_series
ALTER TABLE devotional_series
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS season_start_month INT CHECK (season_start_month IS NULL OR (season_start_month >= 1 AND season_start_month <= 12)),
  ADD COLUMN IF NOT EXISTS season_start_day INT CHECK (season_start_day IS NULL OR (season_start_day >= 1 AND season_start_day <= 31));

-- Generate slugs for existing records that don't have one
UPDATE devotional_series
SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', ''))
WHERE slug IS NULL;

-- Make slug unique and not null
ALTER TABLE devotional_series
  ALTER COLUMN slug SET NOT NULL;

-- Copy tags to topics if topics is empty but tags exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devotional_series' AND column_name = 'tags') THEN
    UPDATE devotional_series SET topics = tags WHERE topics = '{}' OR topics IS NULL;
  END IF;
END $$;

-- Create unique constraint on slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'devotional_series_slug_key'
  ) THEN
    ALTER TABLE devotional_series ADD CONSTRAINT devotional_series_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Add missing columns to onboarding_responses
ALTER TABLE onboarding_responses
  ADD COLUMN IF NOT EXISTS life_area_focus TEXT,
  ADD COLUMN IF NOT EXISTS life_stage TEXT CHECK (life_stage IN ('single', 'married', 'parent', 'empty_nester'));

-- Add missing columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS default_reminder_time TIME DEFAULT '07:00:00',
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_devotional_series_slug ON devotional_series(slug);
CREATE INDEX IF NOT EXISTS idx_devotional_series_seasonal ON devotional_series(is_seasonal) WHERE is_seasonal = TRUE;
CREATE INDEX IF NOT EXISTS idx_devotional_series_topics ON devotional_series USING GIN(topics);

-- Create or replace the get_recommended_series function with correct parameter names
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
    COALESCE(ds.topics, '{}') as topics,
    ds.is_seasonal,
    ds.difficulty_level,
    (
      CASE WHEN p_life_area IS NOT NULL AND p_life_area = ANY(COALESCE(ds.topics, '{}')) THEN 10 ELSE 0 END +
      CASE
        WHEN p_experience_level = 'new' AND ds.difficulty_level = 'beginner' THEN 5
        WHEN p_experience_level = 'growing' AND ds.difficulty_level IN ('beginner', 'intermediate') THEN 5
        WHEN p_experience_level = 'deep' AND ds.difficulty_level IN ('intermediate', 'advanced') THEN 5
        ELSE 0
      END
    )::INT as match_score
  FROM devotional_series ds
  WHERE ds.is_seasonal = FALSE
  ORDER BY match_score DESC, ds.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Ensure user_series_enrollments table exists
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

-- Enable RLS on user_series_enrollments
ALTER TABLE user_series_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_series_enrollments if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_series_enrollments' AND policyname = 'Users can view own enrollments') THEN
    CREATE POLICY "Users can view own enrollments" ON user_series_enrollments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_series_enrollments' AND policyname = 'Users can insert own enrollments') THEN
    CREATE POLICY "Users can insert own enrollments" ON user_series_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_series_enrollments' AND policyname = 'Users can update own enrollments') THEN
    CREATE POLICY "Users can update own enrollments" ON user_series_enrollments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_series_enrollments' AND policyname = 'Users can delete own enrollments') THEN
    CREATE POLICY "Users can delete own enrollments" ON user_series_enrollments FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_series_enrollments' AND policyname = 'Service role full access to user_series_enrollments') THEN
    CREATE POLICY "Service role full access to user_series_enrollments" ON user_series_enrollments FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Create indexes for user_series_enrollments
CREATE INDEX IF NOT EXISTS idx_user_series_enrollments_user ON user_series_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_series_enrollments_active ON user_series_enrollments(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_series_enrollments_primary ON user_series_enrollments(user_id, is_primary) WHERE is_primary = TRUE;

-- Create devotional_days table if it doesn't exist
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

-- Enable RLS on devotional_days
ALTER TABLE devotional_days ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for devotional_days
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'devotional_days' AND policyname = 'Anyone can view devotional days') THEN
    CREATE POLICY "Anyone can view devotional days" ON devotional_days FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'devotional_days' AND policyname = 'Service role full access to devotional_days') THEN
    CREATE POLICY "Service role full access to devotional_days" ON devotional_days FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_devotional_days_series ON devotional_days(series_id);
CREATE INDEX IF NOT EXISTS idx_devotional_days_series_day ON devotional_days(series_id, day_number);

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
