-- Migration: Add server-side audio URL enforcement for premium users
-- Day 1 episodes are always free; days 2+ require premium subscription
-- This RPC returns episodes with audio_url nullified for non-premium users on day > 1

CREATE OR REPLACE FUNCTION get_devotional_episodes(p_series_id UUID)
RETURNS TABLE (
  id UUID,
  series_id UUID,
  day_number INT,
  title TEXT,
  scripture_refs JSONB,
  content_prompt TEXT,
  reflection_questions JSONB,
  prayer_focus TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.series_id,
    d.day_number,
    d.title,
    d.scripture_refs,
    d.content_prompt,
    d.reflection_questions,
    d.prayer_focus,
    CASE
      WHEN d.day_number = 1 THEN d.audio_url
      WHEN is_user_premium(auth.uid()) THEN d.audio_url
      ELSE NULL
    END AS audio_url,
    d.created_at
  FROM devotional_days d
  WHERE d.series_id = p_series_id
  ORDER BY d.day_number;
END;
$$;

GRANT EXECUTE ON FUNCTION get_devotional_episodes(UUID) TO authenticated;

-- DOWN:
-- DROP FUNCTION IF EXISTS get_devotional_episodes(UUID);
