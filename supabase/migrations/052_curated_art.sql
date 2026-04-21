-- Migration: curated_art table for the Daily Art+Verse Drop content engine.
--
-- Per Decision #9 Part 4. The Museum Art Service + Strong's Concordance +
-- 14-translation Bible already sit in our infra \u2014 this table is the
-- one-time-curated pool of brand-aligned pieces we compose daily drops from.
--
-- The founder does a single ~20-hour curation pass selecting ~500 pieces
-- from Met / Rijksmuseum / Art Institute, tagging each emotionally and
-- theologically so daily drops pick verse FIRST, then art from this
-- filtered pool instead of hitting the live API and getting off-brand results.

CREATE TABLE IF NOT EXISTS public.curated_art (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('met', 'rijksmuseum', 'chicago', 'other')),
  source_id TEXT NOT NULL, -- museum-internal ID
  title TEXT NOT NULL,
  artist TEXT,
  year TEXT,
  image_url TEXT NOT NULL,
  attribution TEXT NOT NULL,
  -- Emotional + theological tags used by the daily-drop selector
  tags TEXT[] NOT NULL DEFAULT '{}',
  themes TEXT[] NOT NULL DEFAULT '{}',
  -- Brand-fit score 1-5 (founder review). Below 3 excluded from rotation.
  brand_fit INT NOT NULL DEFAULT 3 CHECK (brand_fit BETWEEN 1 AND 5),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_curated_art_tags
  ON public.curated_art USING GIN (tags)
  WHERE is_active = TRUE AND brand_fit >= 3;

CREATE INDEX IF NOT EXISTS idx_curated_art_themes
  ON public.curated_art USING GIN (themes)
  WHERE is_active = TRUE AND brand_fit >= 3;

-- Public read for anonymous users so daily drops can be rendered before login.
-- No write access via RLS \u2014 only service role (curation script) + founder.
ALTER TABLE public.curated_art ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Curated art is public-read" ON public.curated_art;
CREATE POLICY "Curated art is public-read"
  ON public.curated_art
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE AND brand_fit >= 3);

-- =====================================================
-- daily_drops \u2014 the scheduled art+verse pairings (generated weekly)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_date DATE NOT NULL UNIQUE,
  verse_book TEXT NOT NULL,
  verse_chapter INT NOT NULL,
  verse_start INT NOT NULL,
  verse_end INT,
  translation TEXT NOT NULL DEFAULT 'NIV',
  art_id UUID NOT NULL REFERENCES public.curated_art(id),
  narration_url TEXT, -- founder voice via Voicebox (optional)
  video_url TEXT,     -- composed Ken Burns video (optional)
  caption TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'published', 'skipped')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_drops_date
  ON public.daily_drops (drop_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_drops_pending
  ON public.daily_drops (drop_date) WHERE status = 'pending';

ALTER TABLE public.daily_drops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published drops are public-read" ON public.daily_drops;
CREATE POLICY "Published drops are public-read"
  ON public.daily_drops
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

COMMENT ON TABLE public.curated_art IS
  'Pre-curated pool of public-domain biblical art. Founder does the one-time curation pass; daily-drop scheduler picks from here only.';

COMMENT ON TABLE public.daily_drops IS
  'Daily verse+art+narration pairings. Generated in batches (21 candidates/Mon); founder approves 7/week to publish.';
