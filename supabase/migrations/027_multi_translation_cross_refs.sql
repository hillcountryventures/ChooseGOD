-- Migration: Multi-Translation Cross-Reference Support
-- Enables cross-references to work across all translations (KJV, ESV, NIV, NASB, NLT)
-- by mapping through book/chapter/verse instead of direct verse_id joins
--
-- The cross_references table stores KJV verse_ids, but this function
-- translates them to any supported translation at query time.

-- =====================================================
-- STEP 1: CREATE CANONICAL CROSS-REFERENCE LOOKUP
-- =====================================================

-- Drop existing function to replace with multi-translation version
DROP FUNCTION IF EXISTS public.get_cross_references(BIGINT, TEXT, INT, INT);

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
DECLARE
  v_source_book TEXT;
  v_source_chapter INT;
  v_source_verse INT;
  v_kjv_verse_id BIGINT;
BEGIN
  -- Step 1: Get the book/chapter/verse of the input verse
  SELECT bv.book, bv.chapter, bv.verse
  INTO v_source_book, v_source_chapter, v_source_verse
  FROM public.bible_verses bv
  WHERE bv.id = p_verse_id;

  -- Step 2: Find the corresponding KJV verse_id for cross-ref lookup
  -- (Cross-references are stored with KJV verse IDs)
  SELECT bv.id
  INTO v_kjv_verse_id
  FROM public.bible_verses bv
  WHERE bv.book = v_source_book
    AND bv.chapter = v_source_chapter
    AND bv.verse = v_source_verse
    AND bv.translation = 'kjv'
  LIMIT 1;

  -- If no KJV equivalent found, return empty
  IF v_kjv_verse_id IS NULL THEN
    RETURN;
  END IF;

  -- Step 3: Get cross-references and map to target translation
  RETURN QUERY
  -- Outgoing references (verses this verse points to)
  SELECT
    target_trans.id,
    target_trans.book,
    target_trans.chapter,
    target_trans.verse,
    target_trans.text,
    target_trans.translation,
    cr.votes,
    'to'::TEXT as direction
  FROM public.cross_references cr
  -- Join to KJV to get book/chapter/verse of the referenced verse
  JOIN public.bible_verses kjv_ref ON kjv_ref.id = cr.to_verse_id
  -- Join to target translation using book/chapter/verse
  JOIN public.bible_verses target_trans ON (
    target_trans.book = kjv_ref.book
    AND target_trans.chapter = kjv_ref.chapter
    AND target_trans.verse = kjv_ref.verse
    AND target_trans.translation = p_translation
  )
  WHERE cr.from_verse_id = v_kjv_verse_id
    AND cr.votes >= p_min_votes

  UNION ALL

  -- Incoming references (verses that point to this verse)
  SELECT
    target_trans.id,
    target_trans.book,
    target_trans.chapter,
    target_trans.verse,
    target_trans.text,
    target_trans.translation,
    cr.votes,
    'from'::TEXT as direction
  FROM public.cross_references cr
  -- Join to KJV to get book/chapter/verse of the referencing verse
  JOIN public.bible_verses kjv_ref ON kjv_ref.id = cr.from_verse_id
  -- Join to target translation using book/chapter/verse
  JOIN public.bible_verses target_trans ON (
    target_trans.book = kjv_ref.book
    AND target_trans.chapter = kjv_ref.chapter
    AND target_trans.verse = kjv_ref.verse
    AND target_trans.translation = p_translation
  )
  WHERE cr.to_verse_id = v_kjv_verse_id
    AND cr.votes >= p_min_votes

  ORDER BY votes DESC
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- STEP 2: CREATE HELPER FUNCTION FOR VERSE LOOKUP
-- =====================================================

-- Helper function to get cross-refs by book/chapter/verse directly
-- (useful when you don't have a verse_id)
CREATE OR REPLACE FUNCTION public.get_cross_references_by_ref(
  p_book TEXT,
  p_chapter INT,
  p_verse INT,
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
  direction TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_verse_id BIGINT;
BEGIN
  -- Find the verse_id for the given reference
  SELECT bv.id
  INTO v_verse_id
  FROM public.bible_verses bv
  WHERE bv.book = p_book
    AND bv.chapter = p_chapter
    AND bv.verse = p_verse
    AND bv.translation = p_translation
  LIMIT 1;

  -- Use the main function
  IF v_verse_id IS NOT NULL THEN
    RETURN QUERY
    SELECT * FROM public.get_cross_references(v_verse_id, p_translation, p_limit, p_min_votes);
  END IF;
END;
$$;

-- =====================================================
-- STEP 3: UPDATE MATCH_VERSES FOR MULTI-TRANSLATION
-- =====================================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.match_verses(vector(1536), INT, TEXT, FLOAT, BOOLEAN, INT, INT);

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
      -- Get cross-references for each primary match using the new multi-translation function
      SELECT DISTINCT ON (cr_result.id)
        cr_result.id,
        cr_result.book,
        cr_result.chapter,
        cr_result.verse,
        cr_result.text,
        cr_result.translation,
        pm.similarity * 0.9 AS similarity,  -- Slightly lower similarity for cross-refs
        true AS is_cross_ref,
        cr_result.votes AS cross_ref_votes
      FROM primary_matches pm
      CROSS JOIN LATERAL public.get_cross_references(pm.id, filter_translation, cross_ref_limit, min_votes) cr_result
      WHERE cr_result.id NOT IN (SELECT pm2.id FROM primary_matches pm2)
      ORDER BY cr_result.id, cr_result.votes DESC
    )
    -- Combine and return
    SELECT * FROM primary_matches
    UNION ALL
    SELECT * FROM (
      SELECT * FROM cross_ref_matches
      ORDER BY cross_ref_votes DESC
      LIMIT cross_ref_limit * match_count
    ) limited_cross_refs
    ORDER BY is_cross_ref ASC, similarity DESC
    LIMIT match_count * 2;
  ELSE
    -- Standard query without cross-references
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
-- STEP 4: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.get_cross_references(BIGINT, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cross_references(BIGINT, TEXT, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_cross_references(BIGINT, TEXT, INT, INT) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_cross_references_by_ref(TEXT, INT, INT, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cross_references_by_ref(TEXT, INT, INT, TEXT, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_cross_references_by_ref(TEXT, INT, INT, TEXT, INT, INT) TO service_role;

GRANT EXECUTE ON FUNCTION public.match_verses(vector(1536), INT, TEXT, FLOAT, BOOLEAN, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_verses(vector(1536), INT, TEXT, FLOAT, BOOLEAN, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION public.match_verses(vector(1536), INT, TEXT, FLOAT, BOOLEAN, INT, INT) TO service_role;

-- =====================================================
-- STEP 5: ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.get_cross_references IS 
'Get cross-references for a verse in any translation. 
Maps through book/chapter/verse to support KJV, ESV, NIV, NASB, NLT.
Cross-references are sourced from Treasury of Scripture Knowledge.';

COMMENT ON FUNCTION public.get_cross_references_by_ref IS
'Get cross-references by book/chapter/verse reference instead of verse_id.
Useful when you have a reference string but not the database ID.';
