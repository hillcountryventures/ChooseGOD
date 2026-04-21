-- Migration: atomic RPC for gift code redemption.
--
-- The previous two-step flow (mark code redeemed THEN insert subscription)
-- had a race condition: if the subscription insert failed, the code was
-- already marked redeemed and the user was left with no access. This RPC
-- wraps both operations in a single transaction — both succeed or neither does.

CREATE OR REPLACE FUNCTION public.redeem_gift_code_atomic(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_gift RECORD;
  v_expiration TIMESTAMPTZ;
  v_duration_months INT;
BEGIN
  -- Lock the row to prevent double redemption under concurrent calls
  SELECT *
    INTO v_gift
    FROM public.gift_codes
   WHERE code = p_code
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Gift code not found. Please check the code and try again.'
    );
  END IF;

  IF v_gift.expires_at IS NOT NULL AND v_gift.expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This gift code has expired.'
    );
  END IF;

  IF v_gift.redeemed_by IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This gift code has already been redeemed.'
    );
  END IF;

  v_duration_months := COALESCE(v_gift.duration_months, 1);
  v_expiration := NOW() + (v_duration_months || ' months')::INTERVAL;

  -- Step 1: mark code redeemed
  UPDATE public.gift_codes
     SET redeemed_by = p_user_id,
         redeemed_at = NOW()
   WHERE code = p_code;

  -- Step 2: upsert subscription
  INSERT INTO public.subscriptions (
    user_id,
    revenuecat_app_user_id,
    original_app_user_id,
    status,
    is_active,
    entitlement_id,
    product_id,
    purchase_date,
    expiration_date,
    store,
    is_sandbox,
    is_trial_period,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    'gift_' || p_code,
    'gift_' || p_code,
    'active',
    TRUE,
    'ChooseGOD Pro',
    'gift_' || v_duration_months || 'm',
    NOW(),
    v_expiration,
    'gift',
    FALSE,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    expiration_date = GREATEST(subscriptions.expiration_date, EXCLUDED.expiration_date),
    product_id = EXCLUDED.product_id,
    store = EXCLUDED.store,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'duration_months', v_duration_months,
    'expiration_date', v_expiration
  );
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$func$;

-- Lock down access. Wrapped in a DO block so the parser sees one statement.
DO $grants$
BEGIN
  REVOKE ALL ON FUNCTION public.redeem_gift_code_atomic(TEXT, UUID) FROM PUBLIC;
  REVOKE ALL ON FUNCTION public.redeem_gift_code_atomic(TEXT, UUID) FROM authenticated;
  GRANT EXECUTE ON FUNCTION public.redeem_gift_code_atomic(TEXT, UUID) TO service_role;
END
$grants$;

COMMENT ON FUNCTION public.redeem_gift_code_atomic(TEXT, UUID) IS
  'Atomically validates + redeems a gift code and grants premium subscription. Replaces the previous two-step non-atomic flow.';
