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
