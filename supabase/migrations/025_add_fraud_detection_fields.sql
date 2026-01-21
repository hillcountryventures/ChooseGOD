-- Migration: Add fraud detection fields to chat_interactions
-- Enables tracking subscription verification status and anomalies

-- Add new columns for fraud detection
ALTER TABLE public.chat_interactions
ADD COLUMN IF NOT EXISTS client_claimed_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS server_verified_premium BOOLEAN,
ADD COLUMN IF NOT EXISTS verification_source TEXT, -- 'database', 'revenuecat_api', 'client_claimed'
ADD COLUMN IF NOT EXISTS verification_passed BOOLEAN,
ADD COLUMN IF NOT EXISTS device_id TEXT, -- For cross-device anomaly detection
ADD COLUMN IF NOT EXISTS app_version TEXT;

-- Index for fraud detection queries
CREATE INDEX IF NOT EXISTS idx_chat_interactions_verification
ON public.chat_interactions(client_claimed_premium, server_verified_premium)
WHERE client_claimed_premium = TRUE AND server_verified_premium = FALSE;

-- Create subscription anomalies table for detailed fraud logging
CREATE TABLE IF NOT EXISTS public.subscription_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL, -- 'premium_mismatch', 'excessive_usage', 'device_switch'
  details JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for anomaly queries
CREATE INDEX idx_subscription_anomalies_user_id ON public.subscription_anomalies(user_id);
CREATE INDEX idx_subscription_anomalies_type ON public.subscription_anomalies(anomaly_type);
CREATE INDEX idx_subscription_anomalies_unresolved ON public.subscription_anomalies(resolved) WHERE resolved = FALSE;

-- Enable RLS
ALTER TABLE public.subscription_anomalies ENABLE ROW LEVEL SECURITY;

-- Only service role can access anomalies
CREATE POLICY "Service role can manage anomalies"
  ON public.subscription_anomalies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.subscription_anomalies TO service_role;
GRANT ALL ON public.subscription_anomalies TO postgres;

-- Comment
COMMENT ON TABLE public.subscription_anomalies IS 'Tracks subscription verification anomalies for fraud detection';

-- Create a view for easy fraud monitoring
CREATE OR REPLACE VIEW public.fraud_monitoring_summary AS
SELECT
  DATE_TRUNC('day', ci.created_at) as day,
  COUNT(*) as total_interactions,
  COUNT(*) FILTER (WHERE ci.client_claimed_premium = TRUE) as claimed_premium,
  COUNT(*) FILTER (WHERE ci.server_verified_premium = TRUE) as verified_premium,
  COUNT(*) FILTER (WHERE ci.client_claimed_premium = TRUE AND ci.server_verified_premium = FALSE) as mismatches,
  COUNT(DISTINCT ci.user_id) FILTER (WHERE ci.client_claimed_premium = TRUE AND ci.server_verified_premium = FALSE) as users_with_mismatches
FROM public.chat_interactions ci
WHERE ci.created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', ci.created_at)
ORDER BY day DESC;

-- Grant access to view
GRANT SELECT ON public.fraud_monitoring_summary TO service_role;
GRANT SELECT ON public.fraud_monitoring_summary TO postgres;
