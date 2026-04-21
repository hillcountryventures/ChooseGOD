-- Migration: one-shot unsubscribe tokens for email digests.
--
-- Allows users to unsubscribe from a specific email scope (weekly_digest,
-- seasonal_winback, etc.) with a single click \u2014 no login required.
-- Tokens are single-use and expire in 180 days.

CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('weekly_digest', 'seasonal_winback', 'product_updates', 'all')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '180 days')
);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribe_tokens_user
  ON public.email_unsubscribe_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribe_tokens_expires
  ON public.email_unsubscribe_tokens (expires_at)
  WHERE used_at IS NULL;

-- RLS: users cannot directly read/write these tokens.
-- Tokens are validated by the unsubscribe Edge Function (service role).
ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct access" ON public.email_unsubscribe_tokens;
CREATE POLICY "No direct access"
  ON public.email_unsubscribe_tokens
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Ensure user_preferences supports the digest opt-out.
-- Idempotent: only adds the column if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_preferences'
      AND column_name = 'weekly_digest_enabled'
  ) THEN
    ALTER TABLE public.user_preferences
      ADD COLUMN weekly_digest_enabled BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- user_preferences table doesn't exist yet; defer creation to app layer
  NULL;
END $$;

COMMENT ON TABLE public.email_unsubscribe_tokens IS
  'Single-use tokens for one-click email unsubscribe. Consumed by unsubscribe Edge Function.';
