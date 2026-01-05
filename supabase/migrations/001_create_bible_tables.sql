-- Migration: Create Bible verses table with vector embeddings
-- Run this in your Supabase SQL Editor

-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the bible_verses table
CREATE TABLE IF NOT EXISTS bible_verses (
  id BIGSERIAL PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT 'kjv',
  embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536 dimensions
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to prevent duplicate verses
  UNIQUE(book, chapter, verse, translation)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bible_verses_book ON bible_verses(book);
CREATE INDEX IF NOT EXISTS idx_bible_verses_translation ON bible_verses(translation);
CREATE INDEX IF NOT EXISTS idx_bible_verses_chapter ON bible_verses(book, chapter);
CREATE INDEX IF NOT EXISTS idx_bible_verses_reference ON bible_verses(book, chapter, verse);

-- Create a GIN index for full-text search on verse text
CREATE INDEX IF NOT EXISTS idx_bible_verses_text_search ON bible_verses
  USING GIN (to_tsvector('english', text));

-- Create HNSW index for fast vector similarity search
-- HNSW is faster than IVFFlat for queries, though it uses more memory
CREATE INDEX IF NOT EXISTS idx_bible_verses_embedding ON bible_verses
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Create query_logs table for analytics
CREATE TABLE IF NOT EXISTS query_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT 'kjv',
  response TEXT,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for query analytics
CREATE INDEX IF NOT EXISTS idx_query_logs_user ON query_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_created ON query_logs(created_at DESC);

-- Add Row Level Security (RLS) policies
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Bible verses are publicly readable" ON bible_verses;
DROP POLICY IF EXISTS "Users can read their own query logs" ON query_logs;
DROP POLICY IF EXISTS "Service role can insert query logs" ON query_logs;

-- Bible verses are readable by everyone (public data)
CREATE POLICY "Bible verses are publicly readable" ON bible_verses
  FOR SELECT USING (true);

-- Only authenticated users can read their own query logs
CREATE POLICY "Users can read their own query logs" ON query_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert query logs
CREATE POLICY "Service role can insert query logs" ON query_logs
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON bible_verses TO anon, authenticated;
GRANT SELECT ON query_logs TO authenticated;
GRANT INSERT ON query_logs TO service_role;

COMMENT ON TABLE bible_verses IS 'Bible verses with vector embeddings for semantic search';
COMMENT ON TABLE query_logs IS 'User query logs for analytics and improving responses';
COMMENT ON COLUMN bible_verses.embedding IS 'Vector embedding from OpenAI text-embedding-3-small (1536 dimensions)';
