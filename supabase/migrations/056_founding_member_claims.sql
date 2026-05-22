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
