-- Migration: Fix Supabase security linter warnings
-- Fixes:
--   1. function_search_path_mutable for get_recommended_series
--   2. function_search_path_mutable for get_user_devotional_progress
--   3. extension_in_public for vector extension

-- =====================================================
-- FIX FUNCTION SEARCH PATH ISSUES
-- =====================================================
-- Setting search_path to '' (empty) prevents search_path manipulation attacks
-- by requiring all references to be schema-qualified

-- Fix get_recommended_series function
CREATE OR REPLACE FUNCTION public.get_recommended_series(
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
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
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
  FROM public.devotional_series ds
  WHERE ds.is_seasonal = FALSE
  ORDER BY match_score DESC, ds.created_at ASC
  LIMIT p_limit;
END;
$$;

-- Fix get_user_devotional_progress function
CREATE OR REPLACE FUNCTION public.get_user_devotional_progress(p_user_id UUID)
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
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
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
  FROM public.user_series_enrollments use
  JOIN public.devotional_series ds ON ds.id = use.series_id
  WHERE use.user_id = p_user_id
    AND use.is_active = TRUE
  ORDER BY use.is_primary DESC, use.last_activity_at DESC;
END;
$$;

-- Fix ensure_single_primary_enrollment trigger function
CREATE OR REPLACE FUNCTION public.ensure_single_primary_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE public.user_series_enrollments
    SET is_primary = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

-- =====================================================
-- FIX VECTOR EXTENSION LOCATION
-- =====================================================
-- Move vector extension to extensions schema if it's still in public

DO $$
BEGIN
  -- Check if vector extension exists in public schema
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'vector' AND n.nspname = 'public'
  ) THEN
    -- Create extensions schema if needed
    CREATE SCHEMA IF NOT EXISTS extensions;

    -- Grant usage
    GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

    -- Drop and recreate in extensions schema
    DROP EXTENSION IF EXISTS vector CASCADE;
    CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

    RAISE NOTICE 'Moved vector extension from public to extensions schema';
  END IF;
END $$;

-- Ensure search path includes extensions schema
ALTER DATABASE postgres SET search_path TO public, extensions;
