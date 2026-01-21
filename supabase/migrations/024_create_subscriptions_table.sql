-- Migration: Create subscriptions table for server-side subscription tracking
-- This enables webhook-driven subscription sync from RevenueCat

-- Create the subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- RevenueCat identifiers
  revenuecat_app_user_id TEXT NOT NULL,
  original_app_user_id TEXT,

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'inactive', -- active, expired, cancelled, billing_retry, paused
  is_active BOOLEAN NOT NULL DEFAULT FALSE,

  -- Entitlement info
  entitlement_id TEXT, -- e.g., 'ChooseGOD Pro'
  product_id TEXT, -- e.g., 'choosegodmonthly' or 'choosegodannual'

  -- Dates
  purchase_date TIMESTAMPTZ,
  expiration_date TIMESTAMPTZ,
  original_purchase_date TIMESTAMPTZ,

  -- Billing info
  store TEXT, -- app_store, play_store
  is_sandbox BOOLEAN DEFAULT FALSE,

  -- Trial info
  is_trial_period BOOLEAN DEFAULT FALSE,

  -- Cancellation info
  unsubscribe_detected_at TIMESTAMPTZ,
  billing_issues_detected_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one subscription per user (latest wins)
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_is_active ON public.subscriptions(is_active);
CREATE INDEX idx_subscriptions_revenuecat_id ON public.subscriptions(revenuecat_app_user_id);
CREATE INDEX idx_subscriptions_expiration ON public.subscriptions(expiration_date);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.subscriptions TO postgres;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.subscriptions IS 'Server-side subscription tracking synced via RevenueCat webhooks';
COMMENT ON COLUMN public.subscriptions.status IS 'Subscription status: active, expired, cancelled, billing_retry, paused';
COMMENT ON COLUMN public.subscriptions.is_active IS 'Whether user currently has premium access (derived from status and dates)';

-- Create a helper function to check if user is premium (for server-side verification)
CREATE OR REPLACE FUNCTION is_user_premium(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  SELECT * INTO subscription_record
  FROM public.subscriptions
  WHERE user_id = check_user_id
  LIMIT 1;

  -- No subscription found
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if actively subscribed
  IF subscription_record.is_active = TRUE THEN
    RETURN TRUE;
  END IF;

  -- Check if within expiration date (grace period)
  IF subscription_record.expiration_date IS NOT NULL
     AND subscription_record.expiration_date > NOW() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION is_user_premium(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_premium(UUID) TO service_role;

-- =====================================================
-- Webhook logs table for auditing
-- =====================================================

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for querying logs
CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_user_id ON public.webhook_logs(user_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook logs
CREATE POLICY "Service role can manage webhook logs"
  ON public.webhook_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.webhook_logs TO service_role;
GRANT ALL ON public.webhook_logs TO postgres;

-- Comment
COMMENT ON TABLE public.webhook_logs IS 'Audit log for RevenueCat webhook events';
