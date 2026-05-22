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
