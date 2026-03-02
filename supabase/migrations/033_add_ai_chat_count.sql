-- Add lifetime AI chat count to user profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS ai_chat_count INTEGER NOT NULL DEFAULT 0;

-- Atomic increment function (avoids race conditions from client-side read-then-write)
CREATE OR REPLACE FUNCTION increment_ai_chat_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE user_profiles
  SET ai_chat_count = ai_chat_count + 1,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING ai_chat_count INTO new_count;
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_ai_chat_count(UUID) TO authenticated;
