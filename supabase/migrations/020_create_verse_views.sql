-- ============================================================================
-- Migration: 020_create_verse_views
-- Description: Community verse engagement tracking
--
-- Purpose: Track anonymous verse views to show "fellowship breadcrumbs"
-- Example: "Join 1,240 others reflecting on John 3:16 today"
--
-- Inspired by Hebrews 10:24-25 - encouraging one another
-- ============================================================================

-- Create verse_views table for anonymous engagement tracking
CREATE TABLE IF NOT EXISTS verse_views (
  id BIGSERIAL PRIMARY KEY,
  verse_reference TEXT NOT NULL,        -- e.g., "John 3:16", "Genesis 1:1"
  translation TEXT DEFAULT 'kjv',       -- Bible translation (kjv, niv, esv, etc.)
  viewed_at DATE DEFAULT CURRENT_DATE,  -- Date of views (not timestamp for privacy)
  view_count INT DEFAULT 1,             -- Number of views for this day
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(verse_reference, translation, viewed_at)
);

-- Index for fast lookups by verse reference and date
CREATE INDEX IF NOT EXISTS idx_verse_views_reference_date
ON verse_views(verse_reference, viewed_at);

-- Index for translation-specific queries
CREATE INDEX IF NOT EXISTS idx_verse_views_translation
ON verse_views(translation);

-- ============================================================================
-- RPC Function: increment_verse_view
-- Atomically increment view count or create new record
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_verse_view(
  p_verse_reference TEXT,
  p_translation TEXT DEFAULT 'kjv'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
AS $$
BEGIN
  -- Upsert: insert new record or increment existing count
  INSERT INTO verse_views (verse_reference, translation, viewed_at, view_count)
  VALUES (p_verse_reference, p_translation, CURRENT_DATE, 1)
  ON CONFLICT (verse_reference, translation, viewed_at)
  DO UPDATE SET
    view_count = verse_views.view_count + 1,
    updated_at = NOW();
END;
$$;

-- ============================================================================
-- RPC Function: get_popular_verses
-- Returns most viewed verses for a given time period
-- ============================================================================

CREATE OR REPLACE FUNCTION get_popular_verses(
  p_days_back INT DEFAULT 7,
  p_translation TEXT DEFAULT 'kjv',
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  verse_reference TEXT,
  total_views BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vv.verse_reference,
    SUM(vv.view_count)::BIGINT as total_views
  FROM verse_views vv
  WHERE vv.translation = p_translation
    AND vv.viewed_at >= CURRENT_DATE - p_days_back
  GROUP BY vv.verse_reference
  ORDER BY total_views DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE verse_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read verse views (anonymous stats)
CREATE POLICY "Anyone can read verse views"
ON verse_views
FOR SELECT
USING (true);

-- Policy: Only service role can write (via RPC functions)
CREATE POLICY "Service role can manage verse views"
ON verse_views
FOR ALL
USING (auth.role() = 'service_role');

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE verse_views IS
'Anonymous tracking of verse engagement for community breadcrumbs. No PII stored.';

COMMENT ON COLUMN verse_views.verse_reference IS
'Full verse reference (e.g., "John 3:16", "Psalm 23:1")';

COMMENT ON COLUMN verse_views.translation IS
'Bible translation code (kjv, niv, esv, etc.)';

COMMENT ON COLUMN verse_views.viewed_at IS
'Date of views (no time component for privacy)';

COMMENT ON COLUMN verse_views.view_count IS
'Number of views for this verse on this date';

COMMENT ON FUNCTION increment_verse_view IS
'Atomically increment view count for a verse reference. Called by client apps.';

COMMENT ON FUNCTION get_popular_verses IS
'Returns most viewed verses over the past N days. Useful for trending insights.';
