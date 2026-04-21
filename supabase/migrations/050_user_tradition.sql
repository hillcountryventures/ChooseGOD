-- Migration: per-user tradition preference for Option D positioning.
--
-- Added to user_preferences so it syncs across devices and gets passed to
-- the AI system prompt on every companion/journal-reflection/journey-insights
-- call. Default is 'non_denominational' to match the existing evangelical
-- baseline without forcing an answer on early users.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_preferences'
  ) THEN
    CREATE TABLE public.user_preferences (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
    CREATE POLICY "Users manage own preferences"
      ON public.user_preferences
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add tradition column (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_preferences'
      AND column_name = 'tradition'
  ) THEN
    ALTER TABLE public.user_preferences
      ADD COLUMN tradition TEXT NOT NULL DEFAULT 'non_denominational'
      CHECK (tradition IN (
        'catholic',
        'protestant_conservative',
        'protestant_progressive',
        'orthodox',
        'non_denominational',
        'exploring'
      ));
  END IF;
END $$;

COMMENT ON COLUMN public.user_preferences.tradition IS
  'Christian tradition per Decision #13 (Option D). Injected into AI system prompts for tradition-aware responses.';
