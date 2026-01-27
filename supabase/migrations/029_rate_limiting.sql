-- Rate Limiting for Edge Functions
-- Tracks API requests per user/endpoint for rate limiting

-- =====================================================
-- 1. CREATE RATE LIMITS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Composite index for fast lookups by user+endpoint+time
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint_time 
  ON rate_limits(user_id, endpoint, created_at DESC);

-- Index for cleanup jobs
CREATE INDEX IF NOT EXISTS idx_rate_limits_created 
  ON rate_limits(created_at);

-- =====================================================
-- 2. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits (Edge Functions use service key)
-- No user-facing access needed

-- =====================================================
-- 3. AUTOMATIC CLEANUP
-- =====================================================

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete records older than 2 hours
  DELETE FROM rate_limits
  WHERE created_at < NOW() - INTERVAL '2 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run every hour via pg_cron if available)
-- Note: pg_cron needs to be enabled in Supabase dashboard
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_old_rate_limits()');

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Check if user is rate limited for an endpoint
CREATE OR REPLACE FUNCTION check_rate_limit(
  check_user_id UUID,
  check_endpoint TEXT,
  window_seconds INTEGER DEFAULT 3600,
  max_requests INTEGER DEFAULT 100
)
RETURNS TABLE (
  allowed BOOLEAN,
  request_count INTEGER,
  remaining INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  window_start TIMESTAMP WITH TIME ZONE;
  current_count INTEGER;
BEGIN
  window_start := NOW() - (window_seconds || ' seconds')::INTERVAL;
  
  -- Count requests in window
  SELECT COUNT(*)::INTEGER INTO current_count
  FROM rate_limits
  WHERE user_id = check_user_id
    AND endpoint = check_endpoint
    AND created_at >= window_start;
  
  RETURN QUERY SELECT
    current_count < max_requests AS allowed,
    current_count AS request_count,
    GREATEST(0, max_requests - current_count)::INTEGER AS remaining,
    window_start + (window_seconds || ' seconds')::INTERVAL AS reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record a request (call this after allowing a request)
CREATE OR REPLACE FUNCTION record_rate_limit(
  record_user_id UUID,
  record_endpoint TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO rate_limits (user_id, endpoint, created_at)
  VALUES (record_user_id, record_endpoint, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users to call helper functions
GRANT EXECUTE ON FUNCTION check_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_rate_limit(UUID, TEXT) TO authenticated;

-- Service role has full access for Edge Functions
GRANT ALL ON rate_limits TO service_role;
