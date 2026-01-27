-- User Referrals - "Give 7 days, Get 7 days" Program
-- Tracks referral codes, signups, and earned rewards

-- =====================================================
-- 1. CREATE REFERRALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  days_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_referral UNIQUE (user_id)
);

-- Index for code lookups
CREATE INDEX IF NOT EXISTS idx_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON user_referrals(user_id);

-- =====================================================
-- 2. REFERRAL REDEMPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, trial_started, completed, expired
  referrer_days_awarded INTEGER DEFAULT 0,
  referred_days_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_referred_user UNIQUE (referred_id)
);

CREATE INDEX IF NOT EXISTS idx_redemptions_referrer ON referral_redemptions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_referred ON referral_redemptions(referred_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON referral_redemptions(status);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral stats
CREATE POLICY "Users can view own referrals" ON user_referrals
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own referral record
CREATE POLICY "Users can create own referral" ON user_referrals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view redemptions where they are referrer or referred
CREATE POLICY "Users can view own redemptions" ON referral_redemptions
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Service role has full access
CREATE POLICY "Service role full access to referrals" ON user_referrals
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to redemptions" ON referral_redemptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function to redeem a referral code (called during signup)
CREATE OR REPLACE FUNCTION redeem_referral_code(
  p_referred_user_id UUID,
  p_referral_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_referrer_id UUID;
  v_result JSON;
BEGIN
  -- Find the referrer by code
  SELECT user_id INTO v_referrer_id
  FROM user_referrals
  WHERE referral_code = UPPER(p_referral_code);
  
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Can't refer yourself
  IF v_referrer_id = p_referred_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot use your own code');
  END IF;
  
  -- Check if user already used a referral
  IF EXISTS (SELECT 1 FROM referral_redemptions WHERE referred_id = p_referred_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already used a referral code');
  END IF;
  
  -- Create redemption record
  INSERT INTO referral_redemptions (referrer_id, referred_id, referral_code, status)
  VALUES (v_referrer_id, p_referred_user_id, UPPER(p_referral_code), 'pending');
  
  -- Increment total referrals
  UPDATE user_referrals
  SET total_referrals = total_referrals + 1,
      updated_at = NOW()
  WHERE user_id = v_referrer_id;
  
  RETURN json_build_object('success', true, 'referrer_id', v_referrer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a referral (called when referred user starts Pro trial)
CREATE OR REPLACE FUNCTION complete_referral(
  p_referred_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_redemption referral_redemptions%ROWTYPE;
  v_days_to_award INTEGER := 7;
BEGIN
  -- Find pending redemption
  SELECT * INTO v_redemption
  FROM referral_redemptions
  WHERE referred_id = p_referred_user_id
    AND status = 'pending';
  
  IF v_redemption.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No pending referral found');
  END IF;
  
  -- Update redemption as completed
  UPDATE referral_redemptions
  SET status = 'completed',
      referrer_days_awarded = v_days_to_award,
      referred_days_awarded = v_days_to_award,
      completed_at = NOW()
  WHERE id = v_redemption.id;
  
  -- Update referrer stats
  UPDATE user_referrals
  SET successful_referrals = successful_referrals + 1,
      days_earned = days_earned + v_days_to_award,
      updated_at = NOW()
  WHERE user_id = v_redemption.referrer_id;
  
  RETURN json_build_object(
    'success', true,
    'referrer_id', v_redemption.referrer_id,
    'days_awarded', v_days_to_award
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referrals_updated_at
  BEFORE UPDATE ON user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrals_updated_at();
