-- Migration: Create gift_codes table for gift subscription redemption
-- Gifters purchase and generate shareable codes; recipients redeem via deep link
-- Each code is single-use and expires after 1 year if not redeemed

CREATE TABLE IF NOT EXISTS public.gift_codes (
  code TEXT PRIMARY KEY,
  gifter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  duration_months INT NOT NULL DEFAULT 1 CHECK (duration_months > 0 AND duration_months <= 24),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,                    -- code itself expires after 1 year
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ
);

-- Indexes for efficient lookups and cleanup
CREATE INDEX idx_gift_codes_code ON public.gift_codes(code);
CREATE INDEX idx_gift_codes_gifter ON public.gift_codes(gifter_user_id);
CREATE INDEX idx_gift_codes_redeemed_by ON public.gift_codes(redeemed_by);
CREATE INDEX idx_gift_codes_expires_at ON public.gift_codes(expires_at);

-- Row level security
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

-- Gifter can view their own codes (all states)
CREATE POLICY "Gifter can view own codes"
  ON public.gift_codes FOR SELECT TO authenticated
  USING (auth.uid() = gifter_user_id);

-- Authenticated users can insert (create) their own gift codes
CREATE POLICY "Authenticated can insert own gift codes"
  ON public.gift_codes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = gifter_user_id);

-- Service role has full access (for redemption edge function)
CREATE POLICY "Service role manages all gift codes"
  ON public.gift_codes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT ON public.gift_codes TO authenticated;
GRANT ALL ON public.gift_codes TO service_role;

-- DOWN:
-- DROP TABLE IF EXISTS public.gift_codes;
