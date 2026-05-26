-- ============================================================================
-- ChooseGOD — moat backend migrations 056–060 (combined, in order)
-- Run in: Supabase Dashboard -> SQL Editor (project rtozduhxrfsksygsmwuj).
-- Additive + idempotent (CREATE ... IF NOT EXISTS / CREATE OR REPLACE).
-- NOTE: this is SCHEMA ONLY. The 'companion' edge function is Deno code and
--       must be deployed separately (CLI or dashboard Functions editor).
-- Generated 2026-05-26T17:33:15Z
-- ============================================================================


-- ============================================================================
-- 056_founding_member_claims.sql
-- ============================================================================
-- 056_founding_member_claims.sql
-- Server-side cap of 1,000 lifetime "Founding Member" purchases.
-- Strategy decision #5: $99 lifetime SKU, capped to fund creator-seeding budget.
-- Cap is enforced at the database level via trigger so the iOS client cannot bypass it.

-- ============================================================================
-- Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.founding_member_claims (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revenuecat_transaction_id TEXT UNIQUE,
    price_paid_cents INTEGER NOT NULL DEFAULT 12900,  -- $129 per Decision G8
    CONSTRAINT founding_member_price_positive CHECK (price_paid_cents > 0)
);

CREATE INDEX IF NOT EXISTS idx_founding_member_claims_claimed_at
    ON public.founding_member_claims (claimed_at);

COMMENT ON TABLE public.founding_member_claims IS
    'Records of users who purchased the $99 Founding Member lifetime tier (cap 1,000). Cap enforced by trigger.';

-- ============================================================================
-- Cap enforcement trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_founding_member_cap()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
DECLARE
    current_count INTEGER;
    -- Decision G8: cap reduced from 1,000 → 500 with higher per-unit price ($129).
    cap_limit CONSTANT INTEGER := 500;
BEGIN
    SELECT COUNT(*) INTO current_count FROM public.founding_member_claims;
    IF current_count >= cap_limit THEN
        RAISE EXCEPTION 'Founding Member cap of % reached', cap_limit
            USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$func$;

DO $trigger_setup$
BEGIN
    DROP TRIGGER IF EXISTS founding_member_cap_trigger ON public.founding_member_claims;

    CREATE TRIGGER founding_member_cap_trigger
        BEFORE INSERT ON public.founding_member_claims
        FOR EACH ROW
        EXECUTE FUNCTION public.enforce_founding_member_cap();
END $trigger_setup$;

-- ============================================================================
-- Row-level security
-- ============================================================================

ALTER TABLE public.founding_member_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS founding_member_select_own ON public.founding_member_claims;
CREATE POLICY founding_member_select_own
    ON public.founding_member_claims
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS founding_member_insert_own ON public.founding_member_claims;
CREATE POLICY founding_member_insert_own
    ON public.founding_member_claims
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Public counter RPC (for paywall UI "X of 1000 claimed")
-- SECURITY DEFINER so the count is readable without exposing individual rows.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.founding_member_claim_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $func$
    SELECT COUNT(*)::INTEGER FROM public.founding_member_claims;
$func$;

CREATE OR REPLACE FUNCTION public.founding_member_available()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $func$
    SELECT (SELECT COUNT(*) FROM public.founding_member_claims) < 500;
$func$;

-- ============================================================================
-- Claim-recording RPC (called by iOS after a successful RevenueCat purchase).
-- The cap trigger will reject inserts past 1,000.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_founding_member_claim(
    p_transaction_id TEXT,
    p_price_cents INTEGER DEFAULT 12900
)
RETURNS public.founding_member_claims
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
    new_claim public.founding_member_claims;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'authenticated user required'
            USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.founding_member_claims (user_id, revenuecat_transaction_id, price_paid_cents)
    VALUES (auth.uid(), p_transaction_id, p_price_cents)
    RETURNING * INTO new_claim;

    RETURN new_claim;
END;
$func$;

DO $grants$
BEGIN
    GRANT EXECUTE ON FUNCTION public.founding_member_claim_count() TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.founding_member_available()    TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.record_founding_member_claim(TEXT, INTEGER) TO authenticated;
END $grants$;


-- ============================================================================
-- 057_days_with_god.sql
-- ============================================================================
-- 057_days_with_god.sql
-- Strategy Decision #8: cumulative "Days With God" counter that never resets.
-- Replaces consecutive streak as the primary engagement number on the Home
-- screen. Consecutive streak (`current_streak`) stays as a secondary "this
-- week" signal.
--
-- Also adds Grace Days per-month tracking (2/month free, unlimited Pro):
-- `grace_days_used_this_month` + `grace_days_month_anchor` to detect rollover.
--
-- All additive + idempotent so it can re-run cleanly.

DO $migration$
BEGIN
  -- Ensure user_streaks exists (defensive — should already exist from earlier work).
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_streaks'
  ) THEN
    CREATE TABLE public.user_streaks (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_activity_date DATE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users manage own streaks" ON public.user_streaks;
    CREATE POLICY "Users manage own streaks"
      ON public.user_streaks
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Days With God (cumulative, never decrements)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_streaks'
      AND column_name = 'days_with_god'
  ) THEN
    ALTER TABLE public.user_streaks
      ADD COLUMN days_with_god INTEGER NOT NULL DEFAULT 0
      CHECK (days_with_god >= 0);
  END IF;

  -- Grace Days monthly tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_streaks'
      AND column_name = 'grace_days_used_this_month'
  ) THEN
    ALTER TABLE public.user_streaks
      ADD COLUMN grace_days_used_this_month INTEGER NOT NULL DEFAULT 0
      CHECK (grace_days_used_this_month >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_streaks'
      AND column_name = 'grace_days_month_anchor'
  ) THEN
    ALTER TABLE public.user_streaks
      ADD COLUMN grace_days_month_anchor DATE;
  END IF;
END $migration$;

COMMENT ON COLUMN public.user_streaks.days_with_god IS
  'Decision #8: cumulative count of distinct days with any activity. Never resets. Primary engagement number on Home screen.';

COMMENT ON COLUMN public.user_streaks.grace_days_used_this_month IS
  'Decision #8: count of Grace Days used since grace_days_month_anchor. Free users auto-granted 2/month; Pro users unbounded.';

COMMENT ON COLUMN public.user_streaks.grace_days_month_anchor IS
  'First-of-month date used to detect monthly rollover for grace_days_used_this_month.';


-- ============================================================================
-- 058_subscription_pause_rpc.sql
-- ============================================================================
-- 058_subscription_pause_rpc.sql
-- Strategy Decision #17 — Free Pause as the hero retention mechanic.
-- The base table from migration 054 keeps INSERT to service-role only because
-- the long-term plan is for an edge function to also drive the RevenueCat
-- pause API. For the iOS-native MVP we just need to record the user's
-- intent + survey response — Apple billing pause is left to the user via
-- their App Store subscription settings. This RPC lets the iOS client
-- record the pause itself (security definer scopes the insert to the
-- authenticated user's own row).

CREATE OR REPLACE FUNCTION public.request_subscription_pause(
    p_reason_at_pause TEXT
)
RETURNS public.subscription_pauses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
    new_pause public.subscription_pauses;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'authenticated user required'
            USING ERRCODE = '42501';
    END IF;

    -- Close out any pre-existing active pause so the user always has a single
    -- live pause window. Idempotent — re-pausing extends from now+30d.
    UPDATE public.subscription_pauses
       SET ended_at = NOW()
     WHERE user_id = auth.uid()
       AND ended_at IS NULL;

    INSERT INTO public.subscription_pauses (user_id, reason_at_pause)
    VALUES (auth.uid(), p_reason_at_pause)
    RETURNING * INTO new_pause;

    RETURN new_pause;
END;
$func$;

DO $grants$
BEGIN
    GRANT EXECUTE ON FUNCTION public.request_subscription_pause(TEXT) TO authenticated;
END $grants$;


-- ============================================================================
-- 059_user_intentions.sql
-- ============================================================================
-- 059_user_intentions.sql
-- Decision G2 — front-load intention capture in onboarding so the
-- companion AI knows the user from Day 0, not Day 7+. Solves the
-- cold-start problem for the personalization moat.
--
-- Schema notes:
--   * Single active intention per user — older ones can be archived but
--     are not surfaced to the AI by default.
--   * 30-day expiry — intentions go stale; the companion shouldn't keep
--     referencing a 6-month-old prayer ask.
--   * RLS: users only see their own.

CREATE TABLE IF NOT EXISTS public.user_intentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 1000),
    set_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    archived_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'onboarding'
        CHECK (source IN ('onboarding', 'settings', 'check_in'))
);

-- Only one active intention per user — replace by setting old to inactive.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_intentions_one_active
    ON public.user_intentions (user_id) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_intentions_user_set
    ON public.user_intentions (user_id, set_at DESC);

ALTER TABLE public.user_intentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own intentions" ON public.user_intentions;
CREATE POLICY "Users manage own intentions"
    ON public.user_intentions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RPC — set_user_intention: archive any prior active row, insert new active row.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_user_intention(
    p_content TEXT,
    p_source TEXT DEFAULT 'settings'
)
RETURNS public.user_intentions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
    new_intention public.user_intentions;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'authenticated user required'
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.user_intentions
       SET is_active = FALSE,
           archived_at = NOW()
     WHERE user_id = auth.uid()
       AND is_active = TRUE;

    INSERT INTO public.user_intentions (user_id, content, source)
    VALUES (auth.uid(), p_content, p_source)
    RETURNING * INTO new_intention;

    RETURN new_intention;
END;
$func$;

DO $grants$
BEGIN
    GRANT EXECUTE ON FUNCTION public.set_user_intention(TEXT, TEXT) TO authenticated;
END $grants$;

COMMENT ON TABLE public.user_intentions IS
    'Decision G2 — what the user is praying through right now. Injected into the companion AI system prompt so personalization starts on Day 0, not Day 7.';


-- ============================================================================
-- 060_churches_and_partnerships.sql
-- ============================================================================
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

