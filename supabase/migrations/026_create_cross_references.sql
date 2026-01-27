-- Migration: Create cross_references table and enhanced match_verses function
-- Enables deeper Scripture study by linking related verses from Treasury of Scripture Knowledge
--
-- Run ingestion script after this migration:
--   node supabase/scripts/ingest-cross-refs.js ~/Desktop/cross_references.txt kjv

-- =====================================================
-- STEP 1: CREATE CROSS_REFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cross_references (
  id BIGSERIAL PRIMARY KEY,
  from_verse_id BIGINT NOT NULL REFERENCES public.bible_verses(id) ON DELETE CASCADE,
  to_verse_id BIGINT NOT NULL REFERENCES public.bible_verses(id) ON DELETE CASCADE,
  votes INTEGER DEFAULT 0,
  source TEXT DEFAULT 'TSK',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate cross-references
  CONSTRAINT unique_cross_reference UNIQUE (from_verse_id, to_verse_id),

  -- Prevent self-references
  CONSTRAINT no_self_reference CHECK (from_verse_id != to_verse_id)
);

-- Add comment for documentation
COMMENT ON TABLE public.cross_references IS 'Bible cross-references from Treasury of Scripture Knowledge and other sources';
COMMENT ON COLUMN public.cross_references.votes IS 'Relevance score from source (higher = more relevant)';
COMMENT ON COLUMN public.cross_references.source IS 'Source of the cross-reference (TSK, manual, etc.)';

-- =====================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for looking up cross-refs FROM a verse
CREATE INDEX IF NOT EXISTS idx_cross_refs_from_verse
  ON public.cross_references(from_verse_id);

-- Index for looking up cross-refs TO a verse (bidirectional lookup)
CREATE INDEX IF NOT EXISTS idx_cross_refs_to_verse
  ON public.cross_references(to_verse_id);

-- Index for sorting by votes (most relevant first)
CREATE INDEX IF NOT EXISTS idx_cross_refs_votes
  ON public.cross_references(votes DESC);

-- Composite index for efficient joins with votes ordering
CREATE INDEX IF NOT EXISTS idx_cross_refs_from_votes
  ON public.cross_references(from_verse_id, votes DESC);

-- =====================================================
-- STEP 3: CREATE HELPER FUNCTION TO GET CROSS-REFS
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_cross_references(
  p_verse_id BIGINT,
  p_translation TEXT DEFAULT 'kjv',
  p_limit INT DEFAULT 5,
  p_min_votes INT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  book TEXT,
  chapter INT,
  verse INT,
  text TEXT,
  translation TEXT,
  votes INT,
  direction TEXT  -- 'from' or 'to' indicating relationship direction
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  -- Get verses that this verse references (outgoing)
  SELECT
    bv.id,
    bv.book,
    bv.chapter,
    bv.verse,
    bv.text,
    bv.translation,
    cr.votes,
    'to'::TEXT as direction
  FROM public.cross_references cr
  JOIN public.bible_verses bv ON bv.id = cr.to_verse_id
  WHERE cr.from_verse_id = p_verse_id
    AND bv.translation = p_translation
    AND cr.votes >= p_min_votes

  UNION ALL

  -- Get verses that reference this verse (incoming)
  SELECT
    bv.id,
    bv.book,
    bv.chapter,
    bv.verse,
    bv.text,
    bv.translation,
    cr.votes,
    'from'::TEXT as direction
  FROM public.cross_references cr
  JOIN public.bible_verses bv ON bv.id = cr.from_verse_id
  WHERE cr.to_verse_id = p_verse_id
    AND bv.translation = p_translation
    AND cr.votes >= p_min_votes

  ORDER BY votes DESC
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- STEP 4: ENHANCED MATCH_VERSES WITH CROSS-REFS SUPPORT
-- =====================================================

-- Drop the existing function first (signature is changing)
DROP FUNCTION IF EXISTS public.match_verses(vector(1536), INT, TEXT, FLOAT);

CREATE OR REPLACE FUNCTION public.match_verses(
  query_embedding vector(1536),
  match_count INT DEFAULT 10,
  filter_translation TEXT DEFAULT 'kjv',
  similarity_threshold FLOAT DEFAULT 0.4,
  include_cross_refs BOOLEAN DEFAULT false,
  cross_ref_limit INT DEFAULT 3,
  min_votes INT DEFAULT 1
)
RETURNS TABLE (
  id BIGINT,
  book TEXT,
  chapter INT,
  verse INT,
  text TEXT,
  translation TEXT,
  similarity FLOAT,
  is_cross_ref BOOLEAN,
  cross_ref_votes INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF include_cross_refs THEN
    -- Return primary matches plus their top cross-references
    RETURN QUERY
    WITH primary_matches AS (
      -- First, get the primary semantic matches
      SELECT
        bv.id,
        bv.book,
        bv.chapter,
        bv.verse,
        bv.text,
        bv.translation,
        1 - (bv.embedding <=> query_embedding) AS similarity,
        false AS is_cross_ref,
        0 AS cross_ref_votes
      FROM public.bible_verses bv
      WHERE
        bv.translation = filter_translation
        AND bv.embedding IS NOT NULL
        AND 1 - (bv.embedding <=> query_embedding) > similarity_threshold
      ORDER BY bv.embedding <=> query_embedding
      LIMIT match_count
    ),
    cross_ref_matches AS (
      -- Then get cross-references for each primary match
      SELECT DISTINCT ON (bv.id)
        bv.id,
        bv.book,
        bv.chapter,
        bv.verse,
        bv.text,
        bv.translation,
        pm.similarity * 0.9 AS similarity,  -- Slightly lower similarity for cross-refs
        true AS is_cross_ref,
        cr.votes AS cross_ref_votes
      FROM primary_matches pm
      JOIN public.cross_references cr ON cr.from_verse_id = pm.id
      JOIN public.bible_verses bv ON bv.id = cr.to_verse_id
      WHERE
        bv.translation = filter_translation
        AND cr.votes >= min_votes
        AND bv.id NOT IN (SELECT pm2.id FROM primary_matches pm2)  -- Exclude already matched
      ORDER BY bv.id, cr.votes DESC
    )
    -- Combine and return
    SELECT * FROM primary_matches
    UNION ALL
    SELECT * FROM (
      SELECT * FROM cross_ref_matches
      ORDER BY cross_ref_votes DESC
      LIMIT cross_ref_limit * match_count  -- Limit total cross-refs
    ) limited_cross_refs
    ORDER BY is_cross_ref ASC, similarity DESC  -- Primary matches first
    LIMIT match_count * 2;  -- Allow room for cross-refs
  ELSE
    -- Standard query without cross-references (original behavior)
    RETURN QUERY
    SELECT
      bv.id,
      bv.book,
      bv.chapter,
      bv.verse,
      bv.text,
      bv.translation,
      1 - (bv.embedding <=> query_embedding) AS similarity,
      false AS is_cross_ref,
      0 AS cross_ref_votes
    FROM public.bible_verses bv
    WHERE
      bv.translation = filter_translation
      AND bv.embedding IS NOT NULL
      AND 1 - (bv.embedding <=> query_embedding) > similarity_threshold
    ORDER BY bv.embedding <=> query_embedding
    LIMIT match_count;
  END IF;
END;
$$;

-- =====================================================
-- STEP 5: RLS POLICIES FOR CROSS_REFERENCES
-- =====================================================

-- Enable RLS
ALTER TABLE public.cross_references ENABLE ROW LEVEL SECURITY;

-- Everyone can read cross-references (public Bible data)
CREATE POLICY "Anyone can read cross references" ON public.cross_references
  FOR SELECT USING (true);

-- Only service role can modify (via ingestion script)
CREATE POLICY "Service role can manage cross references" ON public.cross_references
  FOR ALL USING ((select auth.role()) = 'service_role');

-- =====================================================
-- STEP 6: GRANT PERMISSIONS
-- =====================================================

-- Grant execute on new functions
GRANT EXECUTE ON FUNCTION public.get_cross_references(BIGINT, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cross_references(BIGINT, TEXT, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_cross_references(BIGINT, TEXT, INT, INT) TO service_role;

GRANT EXECUTE ON FUNCTION public.match_verses(vector(1536), INT, TEXT, FLOAT, BOOLEAN, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_verses(vector(1536), INT, TEXT, FLOAT, BOOLEAN, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION public.match_verses(vector(1536), INT, TEXT, FLOAT, BOOLEAN, INT, INT) TO service_role;

-- Grant table access
GRANT SELECT ON public.cross_references TO authenticated;
GRANT SELECT ON public.cross_references TO anon;
GRANT ALL ON public.cross_references TO service_role;

-- Grant sequence access for inserts
GRANT USAGE, SELECT ON SEQUENCE public.cross_references_id_seq TO service_role;
