-- Migration: Drop all versions of get_recommended_series and recreate with secure search_path
-- The previous migration only updated one signature, but there may be multiple overloaded versions

-- Drop ALL versions of the function first
DROP FUNCTION IF EXISTS public.get_recommended_series();
DROP FUNCTION IF EXISTS public.get_recommended_series(TEXT);
DROP FUNCTION IF EXISTS public.get_recommended_series(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_recommended_series(TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS public.get_recommended_series(TEXT, TEXT, INTEGER);

-- Recreate with secure search_path
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_recommended_series(TEXT, TEXT, INT) TO anon, authenticated, service_role;
