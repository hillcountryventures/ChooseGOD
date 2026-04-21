-- Migration: crisis_flags audit log + RLS lockdown.
--
-- When the companion Edge Function detects crisis signals in a user's
-- message, it logs a row here. Purpose:
-- (1) product-side review (are we catching signals correctly?)
-- (2) proactive follow-up on next app open ('Earlier you shared
--     something heavy \u2014 how are you doing right now?')
-- (3) honest transparency to the user \u2014 users can view their own flags
--     in Settings (Privacy pillar #4) and delete any flagged conversation.

CREATE TABLE IF NOT EXISTS public.crisis_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier INT NOT NULL CHECK (tier BETWEEN 1 AND 4),
  matches TEXT[] NOT NULL DEFAULT '{}',
  message_preview TEXT NOT NULL, -- first 200 chars of the message that fired
  thread_id TEXT,
  followed_up BOOLEAN NOT NULL DEFAULT FALSE,
  followed_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crisis_flags_user_created
  ON public.crisis_flags (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crisis_flags_pending_followup
  ON public.crisis_flags (user_id, tier)
  WHERE followed_up = FALSE;

ALTER TABLE public.crisis_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own crisis flags" ON public.crisis_flags;
CREATE POLICY "Users view own crisis flags"
  ON public.crisis_flags
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own flags (the dignified 'forget this moment' affordance).
DROP POLICY IF EXISTS "Users delete own crisis flags" ON public.crisis_flags;
CREATE POLICY "Users delete own crisis flags"
  ON public.crisis_flags
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT / UPDATE only via service role (Edge Function).

COMMENT ON TABLE public.crisis_flags IS
  'Per Decision #14/#16: server-side log of detected crisis signals. Users can view and delete their own rows for transparency. Never shared with advertisers, churches, or third parties.';
