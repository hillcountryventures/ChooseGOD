-- Migration: internal-only 5-signal PMF dashboard per Decision #20.
--
-- Five signals; any 3 of 5 = defensible PMF signal, all 5 = scale.
--   1. D30 retention
--   2. % App Store reviews citing 'grace' / 'doesn't shame' (wedge diagnostic)
--   3. Trial \u2192 paid conversion
--   4. NPS among Pro users
--   5. Organic K-factor (invites \u00d7 conversion)
--
-- These views aggregate production data so the founder can open the
-- dashboard (Supabase Studio SQL runner or a future admin screen) and
-- see the 5 numbers instantly without bespoke queries every time.

-- =====================================================
-- Signal 1: D30 retention
-- =====================================================
-- Users who had first activity at least 30 days ago AND have had
-- any activity in the last 7 days. Returns the percentage.
CREATE OR REPLACE VIEW public.pmf_d30_retention AS
WITH cohort AS (
  SELECT user_id, MIN(created_at) AS first_activity
    FROM public.spiritual_moments
   GROUP BY user_id
   HAVING MIN(created_at) <= NOW() - INTERVAL '30 days'
)
SELECT
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM public.spiritual_moments sm
       WHERE sm.user_id = c.user_id
         AND sm.created_at > NOW() - INTERVAL '7 days'
    )
  )::float / NULLIF(COUNT(*), 0) AS retention_d30,
  COUNT(*) AS cohort_size
FROM cohort c;

-- =====================================================
-- Signal 3: Trial \u2192 paid conversion
-- =====================================================
-- Users who started a trial 14+ days ago \u2014 did their subscription
-- persist past the trial window? Uses subscriptions.is_trial_period
-- + expiration_date. Approximation; refine once RevenueCat webhook data
-- is richer.
CREATE OR REPLACE VIEW public.pmf_trial_to_paid AS
SELECT
  COUNT(*) FILTER (
    WHERE is_active = TRUE AND is_trial_period = FALSE
  )::float / NULLIF(COUNT(*), 0) AS conversion_rate,
  COUNT(*) AS cohort_size
FROM public.subscriptions
WHERE purchase_date <= NOW() - INTERVAL '14 days';

-- =====================================================
-- Signal 4: NPS among Pro users (requires cancellation_surveys + future nps table)
-- =====================================================
-- Placeholder \u2014 NPS collection needs a separate nps_scores table with
-- the 0-10 question surfaced periodically inside the app. For now this
-- view returns NULL so the dashboard treats it as 'not-yet-measured.'
CREATE OR REPLACE VIEW public.pmf_nps AS
SELECT
  NULL::numeric AS nps,
  NULL::int AS cohort_size,
  'Awaiting nps_scores table \u2014 ship NPS prompt in Phase 2' AS note;

-- =====================================================
-- Signal 5: Organic K-factor
-- =====================================================
-- For each user who has ever opened the app in the last 30 days:
-- how many NEW users' first-activity falls within 30 days of that
-- user's first-activity? Proxy for "did this user bring someone in?"
-- Refined definition awaits a real referrals/share_click_events table.
CREATE OR REPLACE VIEW public.pmf_k_factor AS
SELECT
  NULL::numeric AS k_factor,
  NULL::int AS cohort_size,
  'Awaiting share_click_events instrumentation' AS note;

-- =====================================================
-- Signal 2: Wedge-language review rate
-- =====================================================
-- App Store review text is ingested separately (manual CSV or a
-- scheduled job pulling from AppFollow / Appbot). Expects an
-- `app_store_reviews` table with a `body` column. Ships the view so
-- when the reviews ingestion lands the query is one line.
CREATE OR REPLACE VIEW public.pmf_wedge_language_rate AS
WITH matches AS (
  SELECT
    COUNT(*) FILTER (
      WHERE body ILIKE '%grace%'
         OR body ILIKE '%doesn''t shame%'
         OR body ILIKE '%not shamed%'
    ) AS wedge_matches,
    COUNT(*) AS total_reviews
  FROM (
    SELECT body FROM public.app_store_reviews
    WHERE created_at > NOW() - INTERVAL '90 days'
  ) AS recent
)
SELECT
  CASE WHEN total_reviews > 0 THEN wedge_matches::float / total_reviews ELSE NULL END
    AS wedge_language_rate,
  total_reviews AS cohort_size
FROM matches;

-- =====================================================
-- Master PMF summary view
-- =====================================================
CREATE OR REPLACE VIEW public.pmf_summary AS
SELECT
  (SELECT retention_d30 FROM public.pmf_d30_retention)      AS signal_1_d30_retention,
  (SELECT wedge_language_rate FROM public.pmf_wedge_language_rate) AS signal_2_wedge_language,
  (SELECT conversion_rate FROM public.pmf_trial_to_paid)    AS signal_3_trial_to_paid,
  (SELECT nps FROM public.pmf_nps)                          AS signal_4_nps,
  (SELECT k_factor FROM public.pmf_k_factor)                AS signal_5_k_factor,
  -- Targets per Decision #20
  0.35::float AS target_signal_1,
  0.20::float AS target_signal_2,
  0.25::float AS target_signal_3,
  50::numeric AS target_signal_4,
  0.30::numeric AS target_signal_5;

-- Service-role only \u2014 do not expose to anon / authenticated via API.
REVOKE ALL ON public.pmf_d30_retention FROM PUBLIC;
REVOKE ALL ON public.pmf_trial_to_paid FROM PUBLIC;
REVOKE ALL ON public.pmf_nps FROM PUBLIC;
REVOKE ALL ON public.pmf_k_factor FROM PUBLIC;
REVOKE ALL ON public.pmf_wedge_language_rate FROM PUBLIC;
REVOKE ALL ON public.pmf_summary FROM PUBLIC;

GRANT SELECT ON public.pmf_d30_retention TO service_role;
GRANT SELECT ON public.pmf_trial_to_paid TO service_role;
GRANT SELECT ON public.pmf_nps TO service_role;
GRANT SELECT ON public.pmf_k_factor TO service_role;
GRANT SELECT ON public.pmf_wedge_language_rate TO service_role;
GRANT SELECT ON public.pmf_summary TO service_role;

-- Placeholder table so the wedge-language view doesn't error before
-- reviews ingestion is set up. Safe to drop/replace later.
CREATE TABLE IF NOT EXISTS public.app_store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL DEFAULT 'ios',
  rating INT CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  author TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_store_reviews ENABLE ROW LEVEL SECURITY;

-- No user access; ops/marketing reads via service role only.
DROP POLICY IF EXISTS "No user access to reviews" ON public.app_store_reviews;
CREATE POLICY "No user access to reviews"
  ON public.app_store_reviews
  FOR ALL TO authenticated
  USING (false) WITH CHECK (false);

COMMENT ON VIEW public.pmf_summary IS
  'Decision #20: 5-signal PMF dashboard. Any 3 of 5 = PMF signal. All 5 = scale.';
