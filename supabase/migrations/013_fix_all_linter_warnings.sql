-- Migration: Fix all Supabase database linter warnings
-- Addresses:
--   1. function_search_path_mutable for match_verses, get_recommended_series
--   2. rls_policy_always_true for query_logs INSERT policy
--   3. auth_rls_initplan - RLS policies using auth.uid()/auth.role() without subselect
--   4. unindexed_foreign_keys - missing indexes on foreign key columns

-- =====================================================
-- FIX 1: FUNCTION SEARCH_PATH ISSUES
-- =====================================================
-- Re-create functions with proper search_path settings

-- Fix match_verses function
CREATE OR REPLACE FUNCTION public.match_verses(
  query_embedding vector(1536),
  match_count INT DEFAULT 10,
  filter_translation TEXT DEFAULT 'kjv',
  similarity_threshold FLOAT DEFAULT 0.4
)
RETURNS TABLE (
  id BIGINT,
  book TEXT,
  chapter INT,
  verse INT,
  text TEXT,
  translation TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bv.id,
    bv.book,
    bv.chapter,
    bv.verse,
    bv.text,
    bv.translation,
    1 - (bv.embedding <=> query_embedding) AS similarity
  FROM public.bible_verses bv
  WHERE
    bv.translation = filter_translation
    AND bv.embedding IS NOT NULL
    AND 1 - (bv.embedding <=> query_embedding) > similarity_threshold
  ORDER BY bv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

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
SET search_path = public
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

-- =====================================================
-- FIX 2: OVERLY PERMISSIVE RLS POLICY
-- =====================================================
-- Replace query_logs INSERT policy with proper service role check

DROP POLICY IF EXISTS "Service role can insert query logs" ON public.query_logs;
CREATE POLICY "Service role can insert query logs" ON public.query_logs
  FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');

-- =====================================================
-- FIX 3: RLS POLICIES - AUTH FUNCTION INITPLAN
-- =====================================================
-- Replace auth.uid() with (select auth.uid()) and auth.role() with (select auth.role())
-- This prevents re-evaluation for each row, improving performance at scale

-- ----- query_logs -----
DROP POLICY IF EXISTS "Users can read their own query logs" ON public.query_logs;
CREATE POLICY "Users can read their own query logs" ON public.query_logs
  FOR SELECT USING ((select auth.uid()) = user_id);

-- ----- spiritual_moments -----
DROP POLICY IF EXISTS "Users can view own spiritual moments" ON public.spiritual_moments;
DROP POLICY IF EXISTS "Users can insert own spiritual moments" ON public.spiritual_moments;
DROP POLICY IF EXISTS "Users can update own spiritual moments" ON public.spiritual_moments;
DROP POLICY IF EXISTS "Users can delete own spiritual moments" ON public.spiritual_moments;
DROP POLICY IF EXISTS "Service role full access to spiritual_moments" ON public.spiritual_moments;

CREATE POLICY "Users can view own spiritual moments" ON public.spiritual_moments
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own spiritual moments" ON public.spiritual_moments
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own spiritual moments" ON public.spiritual_moments
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own spiritual moments" ON public.spiritual_moments
  FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to spiritual_moments" ON public.spiritual_moments
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- prayer_requests -----
DROP POLICY IF EXISTS "Users can view own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can insert prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can update own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can delete own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Service role full access to prayer_requests" ON public.prayer_requests;

CREATE POLICY "Users can view own prayer requests" ON public.prayer_requests
  FOR SELECT USING (
    (select auth.uid()) = user_id OR
    circle_id IN (SELECT cm.circle_id FROM public.circle_members cm WHERE cm.user_id = (select auth.uid()))
  );
CREATE POLICY "Users can insert prayer requests" ON public.prayer_requests
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own prayer requests" ON public.prayer_requests
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own prayer requests" ON public.prayer_requests
  FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to prayer_requests" ON public.prayer_requests
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- memory_verses -----
DROP POLICY IF EXISTS "Users can view own memory verses" ON public.memory_verses;
DROP POLICY IF EXISTS "Users can insert own memory verses" ON public.memory_verses;
DROP POLICY IF EXISTS "Users can update own memory verses" ON public.memory_verses;
DROP POLICY IF EXISTS "Users can delete own memory verses" ON public.memory_verses;
DROP POLICY IF EXISTS "Service role full access to memory_verses" ON public.memory_verses;

CREATE POLICY "Users can view own memory verses" ON public.memory_verses
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own memory verses" ON public.memory_verses
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own memory verses" ON public.memory_verses
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own memory verses" ON public.memory_verses
  FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to memory_verses" ON public.memory_verses
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- obedience_steps -----
DROP POLICY IF EXISTS "Users can view own obedience steps" ON public.obedience_steps;
DROP POLICY IF EXISTS "Users can insert own obedience steps" ON public.obedience_steps;
DROP POLICY IF EXISTS "Users can update own obedience steps" ON public.obedience_steps;
DROP POLICY IF EXISTS "Users can delete own obedience steps" ON public.obedience_steps;
DROP POLICY IF EXISTS "Service role full access to obedience_steps" ON public.obedience_steps;

CREATE POLICY "Users can view own obedience steps" ON public.obedience_steps
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own obedience steps" ON public.obedience_steps
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own obedience steps" ON public.obedience_steps
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own obedience steps" ON public.obedience_steps
  FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to obedience_steps" ON public.obedience_steps
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- rhythm_enrollments -----
DROP POLICY IF EXISTS "Users can view own rhythms" ON public.rhythm_enrollments;
DROP POLICY IF EXISTS "Users can insert own rhythms" ON public.rhythm_enrollments;
DROP POLICY IF EXISTS "Users can update own rhythms" ON public.rhythm_enrollments;
DROP POLICY IF EXISTS "Users can delete own rhythms" ON public.rhythm_enrollments;
DROP POLICY IF EXISTS "Service role full access to rhythm_enrollments" ON public.rhythm_enrollments;

CREATE POLICY "Users can view own rhythms" ON public.rhythm_enrollments
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own rhythms" ON public.rhythm_enrollments
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own rhythms" ON public.rhythm_enrollments
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own rhythms" ON public.rhythm_enrollments
  FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to rhythm_enrollments" ON public.rhythm_enrollments
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- prayer_circles -----
DROP POLICY IF EXISTS "Circle members can view circles" ON public.prayer_circles;
DROP POLICY IF EXISTS "Users can create circles" ON public.prayer_circles;
DROP POLICY IF EXISTS "Circle creators can update" ON public.prayer_circles;
DROP POLICY IF EXISTS "Circle creators can delete" ON public.prayer_circles;
DROP POLICY IF EXISTS "Service role full access to prayer_circles" ON public.prayer_circles;

CREATE POLICY "Circle members can view circles" ON public.prayer_circles
  FOR SELECT USING (
    created_by = (select auth.uid()) OR
    id IN (SELECT cm.circle_id FROM public.circle_members cm WHERE cm.user_id = (select auth.uid()))
  );
CREATE POLICY "Users can create circles" ON public.prayer_circles
  FOR INSERT WITH CHECK ((select auth.uid()) = created_by);
CREATE POLICY "Circle creators can update" ON public.prayer_circles
  FOR UPDATE USING ((select auth.uid()) = created_by);
CREATE POLICY "Circle creators can delete" ON public.prayer_circles
  FOR DELETE USING ((select auth.uid()) = created_by);
CREATE POLICY "Service role full access to prayer_circles" ON public.prayer_circles
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- circle_members -----
DROP POLICY IF EXISTS "Circle members can view members" ON public.circle_members;
DROP POLICY IF EXISTS "Users can join circles" ON public.circle_members;
DROP POLICY IF EXISTS "Users can leave circles" ON public.circle_members;
DROP POLICY IF EXISTS "Service role full access to circle_members" ON public.circle_members;

CREATE POLICY "Circle members can view members" ON public.circle_members
  FOR SELECT USING (
    user_id = (select auth.uid()) OR
    circle_id IN (SELECT cm.circle_id FROM public.circle_members cm WHERE cm.user_id = (select auth.uid()))
  );
CREATE POLICY "Users can join circles" ON public.circle_members
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can leave circles" ON public.circle_members
  FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to circle_members" ON public.circle_members
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- growth_insights -----
DROP POLICY IF EXISTS "Users can view own insights" ON public.growth_insights;
DROP POLICY IF EXISTS "Users can insert own insights" ON public.growth_insights;
DROP POLICY IF EXISTS "Service role full access to growth_insights" ON public.growth_insights;

CREATE POLICY "Users can view own insights" ON public.growth_insights
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own insights" ON public.growth_insights
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to growth_insights" ON public.growth_insights
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- user_profiles -----
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role full access to user_profiles" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Service role full access to user_profiles" ON public.user_profiles
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- onboarding_responses -----
DROP POLICY IF EXISTS "Users can view own onboarding responses" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Users can insert own onboarding responses" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Users can update own onboarding responses" ON public.onboarding_responses;
DROP POLICY IF EXISTS "Service role full access to onboarding_responses" ON public.onboarding_responses;

CREATE POLICY "Users can view own onboarding responses" ON public.onboarding_responses
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own onboarding responses" ON public.onboarding_responses
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own onboarding responses" ON public.onboarding_responses
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to onboarding_responses" ON public.onboarding_responses
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- user_series_enrollments -----
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.user_series_enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.user_series_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.user_series_enrollments;
DROP POLICY IF EXISTS "Users can delete own enrollments" ON public.user_series_enrollments;
DROP POLICY IF EXISTS "Service role full access to user_series_enrollments" ON public.user_series_enrollments;

CREATE POLICY "Users can view own enrollments" ON public.user_series_enrollments
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own enrollments" ON public.user_series_enrollments
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own enrollments" ON public.user_series_enrollments
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own enrollments" ON public.user_series_enrollments
  FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Service role full access to user_series_enrollments" ON public.user_series_enrollments
  FOR ALL USING ((select auth.role()) = 'service_role');

-- ----- devotional_series and devotional_days -----
-- These use TRUE for public access which is appropriate for SELECT
DROP POLICY IF EXISTS "Service role full access to devotional_series" ON public.devotional_series;
DROP POLICY IF EXISTS "Service role full access to devotional_days" ON public.devotional_days;

CREATE POLICY "Service role full access to devotional_series" ON public.devotional_series
  FOR ALL USING ((select auth.role()) = 'service_role');
CREATE POLICY "Service role full access to devotional_days" ON public.devotional_days
  FOR ALL USING ((select auth.role()) = 'service_role');

-- =====================================================
-- FIX 4: UNINDEXED FOREIGN KEYS
-- =====================================================
-- Add indexes for foreign key columns that are missing coverage

-- circle_members.user_id (foreign key to auth.users)
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);

-- obedience_steps.source_moment_id (foreign key to spiritual_moments)
CREATE INDEX IF NOT EXISTS idx_obedience_steps_source_moment_id ON public.obedience_steps(source_moment_id);

-- prayer_circles.created_by (foreign key to auth.users)
CREATE INDEX IF NOT EXISTS idx_prayer_circles_created_by ON public.prayer_circles(created_by);

-- rhythm_enrollments.user_id (foreign key to auth.users)
CREATE INDEX IF NOT EXISTS idx_rhythm_enrollments_user_id ON public.rhythm_enrollments(user_id);

-- user_series_enrollments.series_id (foreign key to devotional_series)
CREATE INDEX IF NOT EXISTS idx_user_series_enrollments_series_id ON public.user_series_enrollments(series_id);
