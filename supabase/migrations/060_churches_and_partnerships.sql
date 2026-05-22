-- 060_churches_and_partnerships.sql
-- Decision G3 + G7 — pastor partnerships are now the primary distribution
-- channel. This migration adds:
--   * `churches` — partner organizations
--   * `church_sermons` — sermon text submitted by pastors for sermon-companion drops
--   * `church_install_log` — per-church install attribution (anonymous count, no PII)
--   * `user_profiles.church_id` — FK so users installing via a church slug
--     are linked back to the church for analytics
--
-- Pastor Pack flow:
--   1. Pastor signs up via web → row in `churches` with unique slug
--   2. iOS install via `choosegod.app/[slug]` → user_profiles.church_id set
--   3. Pastor enters weekly sermon on dashboard → row in `church_sermons`
--   4. Congregation members of that church see "This week at [Church]" card

-- ============================================================================
-- churches
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE
        CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
    name TEXT NOT NULL,
    denomination TEXT,
    city TEXT,
    state TEXT,
    pastor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    pastor_email TEXT,
    welcome_message TEXT,
    crest_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_churches_pastor ON public.churches (pastor_user_id);
CREATE INDEX IF NOT EXISTS idx_churches_slug ON public.churches (slug);

ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active churches public-read" ON public.churches;
CREATE POLICY "Active churches public-read"
    ON public.churches
    FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Pastors update own church" ON public.churches;
CREATE POLICY "Pastors update own church"
    ON public.churches
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = pastor_user_id)
    WITH CHECK (auth.uid() = pastor_user_id);

-- INSERT into churches happens via the `register_church` RPC (security definer).

-- ============================================================================
-- user_profiles.church_id — link a user to the church they installed via
-- ============================================================================

DO $migration$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_profiles'
          AND column_name = 'church_id'
    ) THEN
        ALTER TABLE public.user_profiles
            ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL;
        CREATE INDEX idx_user_profiles_church ON public.user_profiles (church_id);
    END IF;
END $migration$;

-- ============================================================================
-- church_sermons — weekly sermon text submitted by pastors
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.church_sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    sermon_date DATE NOT NULL,
    title TEXT NOT NULL,
    body_text TEXT NOT NULL,
    scripture_refs TEXT[] NOT NULL DEFAULT '{}',
    devotional_drop_text TEXT,    -- AI-generated companion drop, populated by edge fn
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (church_id, sermon_date)
);

CREATE INDEX IF NOT EXISTS idx_church_sermons_church_date
    ON public.church_sermons (church_id, sermon_date DESC);

ALTER TABLE public.church_sermons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sermons readable by church members" ON public.church_sermons;
CREATE POLICY "Sermons readable by church members"
    ON public.church_sermons
    FOR SELECT
    TO authenticated
    USING (
        is_published = TRUE
        AND church_id IN (
            SELECT church_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Pastors manage own church sermons" ON public.church_sermons;
CREATE POLICY "Pastors manage own church sermons"
    ON public.church_sermons
    FOR ALL
    TO authenticated
    USING (
        church_id IN (
            SELECT id FROM public.churches WHERE pastor_user_id = auth.uid()
        )
    )
    WITH CHECK (
        church_id IN (
            SELECT id FROM public.churches WHERE pastor_user_id = auth.uid()
        )
    );

-- ============================================================================
-- church_install_log — analytics for pastor dashboard (no PII)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.church_install_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (church_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_church_install_log_church_date
    ON public.church_install_log (church_id, installed_at DESC);

ALTER TABLE public.church_install_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pastors view own church installs" ON public.church_install_log;
CREATE POLICY "Pastors view own church installs"
    ON public.church_install_log
    FOR SELECT
    TO authenticated
    USING (
        church_id IN (
            SELECT id FROM public.churches WHERE pastor_user_id = auth.uid()
        )
    );

-- ============================================================================
-- RPCs
-- ============================================================================

-- Register a new church for the current authenticated user (called from the
-- pastor onboarding flow).
CREATE OR REPLACE FUNCTION public.register_church(
    p_slug TEXT,
    p_name TEXT,
    p_denomination TEXT,
    p_city TEXT,
    p_state TEXT
)
RETURNS public.churches
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
    new_church public.churches;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'authenticated user required'
            USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.churches (slug, name, denomination, city, state, pastor_user_id)
    VALUES (p_slug, p_name, p_denomination, p_city, p_state, auth.uid())
    RETURNING * INTO new_church;

    RETURN new_church;
END;
$func$;

-- Link the current user to a church via slug (called when iOS app launches with
-- a `church_slug` deep-link parameter from a co-branded landing page).
CREATE OR REPLACE FUNCTION public.link_user_to_church(
    p_slug TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
    target_church_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'authenticated user required'
            USING ERRCODE = '42501';
    END IF;

    SELECT id INTO target_church_id
      FROM public.churches
     WHERE slug = p_slug AND is_active = TRUE;

    IF target_church_id IS NULL THEN
        RAISE EXCEPTION 'church not found' USING ERRCODE = 'NOFND';
    END IF;

    UPDATE public.user_profiles
       SET church_id = target_church_id
     WHERE id = auth.uid();

    -- Log the install for the pastor's dashboard. Idempotent via UNIQUE.
    INSERT INTO public.church_install_log (church_id, user_id)
    VALUES (target_church_id, auth.uid())
    ON CONFLICT DO NOTHING;

    RETURN target_church_id;
END;
$func$;

-- Aggregate church stats for the pastor dashboard. SECURITY DEFINER so the
-- pastor sees counts without needing direct read on user_profiles.
CREATE OR REPLACE FUNCTION public.church_stats(p_church_id UUID)
RETURNS TABLE (
    total_installs INTEGER,
    installs_last_7d INTEGER,
    installs_last_30d INTEGER,
    active_users_last_7d INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
    -- Only the church's pastor can call this
    IF NOT EXISTS (
        SELECT 1 FROM public.churches
         WHERE id = p_church_id AND pastor_user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM public.church_install_log
          WHERE church_id = p_church_id),
        (SELECT COUNT(*)::INTEGER FROM public.church_install_log
          WHERE church_id = p_church_id AND installed_at > NOW() - INTERVAL '7 days'),
        (SELECT COUNT(*)::INTEGER FROM public.church_install_log
          WHERE church_id = p_church_id AND installed_at > NOW() - INTERVAL '30 days'),
        (SELECT COUNT(DISTINCT u.id)::INTEGER
           FROM public.user_profiles u
          WHERE u.church_id = p_church_id
            AND u.last_active_at > NOW() - INTERVAL '7 days');
END;
$func$;

DO $grants$
BEGIN
    GRANT EXECUTE ON FUNCTION public.register_church(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.link_user_to_church(TEXT) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.church_stats(UUID) TO authenticated;
END $grants$;

COMMENT ON TABLE public.churches IS
    'Decision G3 — pastor partnerships as primary distribution. Each row = one partner church with co-branded landing page slug.';
