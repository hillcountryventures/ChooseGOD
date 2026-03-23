-- Migration: Create bookmarks table for persistent user bookmarks

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  verse_text TEXT NOT NULL DEFAULT '',
  translation TEXT NOT NULL DEFAULT 'KJV',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_verse_bookmark UNIQUE (user_id, book, chapter, verse, translation)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_chapter
  ON public.bookmarks(user_id, book, chapter);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookmarks"
  ON public.bookmarks FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
