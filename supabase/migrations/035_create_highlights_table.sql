-- Migration: Create verse_highlights table for verse highlighting

CREATE TABLE IF NOT EXISTS public.verse_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT 'yellow',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_verse_highlight UNIQUE (user_id, book, chapter, verse)
);

CREATE INDEX IF NOT EXISTS idx_verse_highlights_user_chapter
  ON public.verse_highlights(user_id, book, chapter);

ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own highlights"
  ON public.verse_highlights FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.verse_highlights TO authenticated;
