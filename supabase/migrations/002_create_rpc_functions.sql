-- Migration: Create RPC functions for vector and keyword search
-- Run this in your Supabase SQL Editor AFTER 001_create_bible_tables.sql

-- Function: match_verses
-- Performs vector similarity search using cosine distance
-- Returns verses most semantically similar to the query embedding
CREATE OR REPLACE FUNCTION match_verses(
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
  FROM bible_verses bv
  WHERE
    bv.translation = filter_translation
    AND bv.embedding IS NOT NULL
    AND 1 - (bv.embedding <=> query_embedding) > similarity_threshold
  ORDER BY bv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: search_verses
-- Performs full-text keyword search as a fallback
-- Uses PostgreSQL's full-text search capabilities
CREATE OR REPLACE FUNCTION search_verses(
  search_query TEXT,
  p_translation TEXT DEFAULT 'kjv',
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  book TEXT,
  chapter INT,
  verse INT,
  text TEXT,
  translation TEXT,
  rank FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  processed_query TEXT;
BEGIN
  -- Convert search query to tsquery format
  -- Split words and join with & for AND matching
  processed_query := regexp_replace(
    trim(search_query),
    '\s+',
    ' & ',
    'g'
  );

  RETURN QUERY
  SELECT
    bv.id,
    bv.book,
    bv.chapter,
    bv.verse,
    bv.text,
    bv.translation,
    ts_rank(
      to_tsvector('english', bv.text),
      to_tsquery('english', processed_query)
    ) AS rank
  FROM bible_verses bv
  WHERE
    bv.translation = p_translation
    AND to_tsvector('english', bv.text) @@ to_tsquery('english', processed_query)
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$;

-- Function: get_random_verse
-- Returns a random verse, optionally filtered by book or translation
-- Useful for daily verse feature
CREATE OR REPLACE FUNCTION get_random_verse(
  p_translation TEXT DEFAULT 'kjv',
  p_book TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  book TEXT,
  chapter INT,
  verse INT,
  text TEXT,
  translation TEXT
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
    bv.translation
  FROM bible_verses bv
  WHERE
    bv.translation = p_translation
    AND (p_book IS NULL OR bv.book = p_book)
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$;

-- Function: get_chapter
-- Returns all verses in a specific chapter
-- Useful for Bible reading feature
CREATE OR REPLACE FUNCTION get_chapter(
  p_book TEXT,
  p_chapter INT,
  p_translation TEXT DEFAULT 'kjv'
)
RETURNS TABLE (
  id BIGINT,
  book TEXT,
  chapter INT,
  verse INT,
  text TEXT,
  translation TEXT
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
    bv.translation
  FROM bible_verses bv
  WHERE
    bv.book = p_book
    AND bv.chapter = p_chapter
    AND bv.translation = p_translation
  ORDER BY bv.verse;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION match_verses TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_verses TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_random_verse TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_chapter TO anon, authenticated, service_role;

-- Add helpful comments
COMMENT ON FUNCTION match_verses IS 'Vector similarity search for Bible verses using cosine distance';
COMMENT ON FUNCTION search_verses IS 'Full-text keyword search for Bible verses';
COMMENT ON FUNCTION get_random_verse IS 'Get a random verse, optionally filtered by book or translation';
COMMENT ON FUNCTION get_chapter IS 'Get all verses in a specific chapter';
