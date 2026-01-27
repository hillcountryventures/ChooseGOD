-- ============================================================================
-- Migration: 021_add_ab_testing_and_security
-- Description: A/B testing, comprehensive RLS policies, and data export
--
-- Purpose: Personalization, security compliance (GDPR/CCPA), and analytics
-- ============================================================================

-- ============================================================================
-- Part 1: A/B Testing for Home Layout
-- ============================================================================

-- Add home_layout_variant column for testing carousel vs stacked layout
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS home_layout_variant SMALLINT DEFAULT 1
  CHECK (home_layout_variant IN (1, 2));

COMMENT ON COLUMN user_profiles.home_layout_variant IS
'Home screen layout A/B test: 1 = carousel (DailyFocusCarousel), 2 = stacked';

-- ============================================================================
-- Part 2: Comprehensive Row Level Security (RLS) Policies
-- ============================================================================

-- Ensure RLS is enabled on all user-specific tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE obedience_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skipped_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users access own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users access own progress" ON user_reading_progress;
DROP POLICY IF EXISTS "Users access own logs" ON query_logs;
DROP POLICY IF EXISTS "Users access own prayers" ON prayer_requests;
DROP POLICY IF EXISTS "Users access own memory verses" ON memory_verses;
DROP POLICY IF EXISTS "Users access own obedience steps" ON obedience_steps;
DROP POLICY IF EXISTS "Users access own moments" ON spiritual_moments;
DROP POLICY IF EXISTS "Users access own session logs" ON reading_session_logs;
DROP POLICY IF EXISTS "Users access own skipped sessions" ON skipped_sessions;

-- Create comprehensive RLS policies

-- User Profiles: Users can only access/update their own profile
CREATE POLICY "Users access own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Reading Progress: Users can only access their own progress
CREATE POLICY "Users access own progress" ON user_reading_progress
  FOR ALL USING (auth.uid() = user_id);

-- Query Logs: Users can only access their own query history
CREATE POLICY "Users access own logs" ON query_logs
  FOR ALL USING (auth.uid() = user_id);

-- Prayer Requests: Users can only access their own prayers
CREATE POLICY "Users access own prayers" ON prayer_requests
  FOR ALL USING (auth.uid() = user_id);

-- Memory Verses: Users can only access their own memory verses
CREATE POLICY "Users access own memory verses" ON memory_verses
  FOR ALL USING (auth.uid() = user_id);

-- Obedience Steps: Users can only access their own obedience tracking
CREATE POLICY "Users access own obedience steps" ON obedience_steps
  FOR ALL USING (auth.uid() = user_id);

-- Spiritual Moments: Users can only access their own moments
CREATE POLICY "Users access own moments" ON spiritual_moments
  FOR ALL USING (auth.uid() = user_id);

-- Reading Session Logs: Users can only access their own reading sessions
CREATE POLICY "Users access own session logs" ON reading_session_logs
  FOR ALL USING (auth.uid() = user_id);

-- Skipped Sessions: Users can only access their own skipped readings
CREATE POLICY "Users access own skipped sessions" ON skipped_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- Part 3: Data Export Function (GDPR/CCPA Compliance)
-- ============================================================================

-- RPC function to export all user data
CREATE OR REPLACE FUNCTION export_user_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_export_data JSONB;
BEGIN
  -- Get authenticated user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Build comprehensive export JSON
  v_export_data := jsonb_build_object(
    'exported_at', NOW(),
    'user_id', v_user_id,

    -- Profile data
    'profile', (
      SELECT row_to_json(user_profiles)
      FROM user_profiles
      WHERE id = v_user_id
    ),

    -- Reading progress
    'reading_progress', (
      SELECT jsonb_agg(row_to_json(user_reading_progress))
      FROM user_reading_progress
      WHERE user_id = v_user_id
    ),

    -- Query history
    'query_history', (
      SELECT jsonb_agg(row_to_json(query_logs))
      FROM query_logs
      WHERE user_id = v_user_id
      ORDER BY created_at DESC
      LIMIT 1000  -- Last 1000 queries
    ),

    -- Prayer requests
    'prayers', (
      SELECT jsonb_agg(row_to_json(prayer_requests))
      FROM prayer_requests
      WHERE user_id = v_user_id
    ),

    -- Memory verses
    'memory_verses', (
      SELECT jsonb_agg(row_to_json(memory_verses))
      FROM memory_verses
      WHERE user_id = v_user_id
    ),

    -- Obedience steps
    'obedience_steps', (
      SELECT jsonb_agg(row_to_json(obedience_steps))
      FROM obedience_steps
      WHERE user_id = v_user_id
    ),

    -- Spiritual moments
    'spiritual_moments', (
      SELECT jsonb_agg(row_to_json(spiritual_moments))
      FROM spiritual_moments
      WHERE user_id = v_user_id
    ),

    -- Reading session logs
    'reading_sessions', (
      SELECT jsonb_agg(row_to_json(reading_session_logs))
      FROM reading_session_logs
      WHERE user_id = v_user_id
    )
  );

  RETURN v_export_data;
END;
$$;

COMMENT ON FUNCTION export_user_data IS
'Exports all user data as JSON for GDPR/CCPA compliance. User must be authenticated.';

-- ============================================================================
-- Part 4: Data Deletion Function (Right to be Forgotten)
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get authenticated user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user data (cascades via foreign keys)
  -- Order matters: delete children first, then parent profile

  DELETE FROM reading_session_logs WHERE user_id = v_user_id;
  DELETE FROM skipped_sessions WHERE user_id = v_user_id;
  DELETE FROM user_reading_progress WHERE user_id = v_user_id;
  DELETE FROM query_logs WHERE user_id = v_user_id;
  DELETE FROM prayer_requests WHERE user_id = v_user_id;
  DELETE FROM memory_verses WHERE user_id = v_user_id;
  DELETE FROM obedience_steps WHERE user_id = v_user_id;
  DELETE FROM spiritual_moments WHERE user_id = v_user_id;

  -- Delete profile (will cascade auth.users deletion if configured)
  DELETE FROM user_profiles WHERE id = v_user_id;

  -- Log deletion for audit trail (optional)
  INSERT INTO audit_log (event_type, user_id, details)
  VALUES ('user_data_deleted', v_user_id, jsonb_build_object('deleted_at', NOW()))
  ON CONFLICT DO NOTHING; -- Ignore if audit_log doesn't exist

END;
$$;

COMMENT ON FUNCTION delete_user_data IS
'Deletes all user data for GDPR/CCPA "right to be forgotten". User must be authenticated.';

-- ============================================================================
-- Part 5: Audit Logging (Optional)
-- ============================================================================

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

COMMENT ON TABLE audit_log IS
'Audit trail for sensitive operations (data exports, deletions, etc.)';

-- ============================================================================
-- Part 6: Grant necessary permissions
-- ============================================================================

-- Grant execute permissions on RPC functions to authenticated users
GRANT EXECUTE ON FUNCTION export_user_data() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_data() TO authenticated;

-- ============================================================================
-- End of migration
-- ============================================================================
