-- Migration: Add embedding column to bible_verses table
-- The embedding column was lost when the vector extension was moved to the extensions schema

-- Ensure the vector extension is available
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add the embedding column if it doesn't exist
ALTER TABLE bible_verses
  ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

-- Create HNSW index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_bible_verses_embedding ON bible_verses
  USING hnsw (embedding extensions.vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Update the match_verses function to use the correct schema
CREATE OR REPLACE FUNCTION match_verses(
  query_embedding extensions.vector(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5,
  target_translation TEXT DEFAULT 'kjv'
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
  WHERE bv.translation = target_translation
    AND bv.embedding IS NOT NULL
    AND (1 - (bv.embedding <=> query_embedding)) > match_threshold
  ORDER BY bv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION match_verses TO anon, authenticated, service_role;
