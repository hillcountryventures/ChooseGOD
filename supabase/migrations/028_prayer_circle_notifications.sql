-- Prayer Circle Notifications Enhancement
-- Adds prayer_responses table to track who is praying for whom
-- and enables push notifications when someone prays for a request

-- =====================================================
-- 1. CREATE PRAYER RESPONSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS prayer_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate responses
  UNIQUE(prayer_request_id, user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_prayer_responses_request ON prayer_responses(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_responses_user ON prayer_responses(user_id);

-- =====================================================
-- 2. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE prayer_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own prayer responses
CREATE POLICY "Users can create prayer responses"
  ON prayer_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own prayer responses
CREATE POLICY "Users can delete their own prayer responses"
  ON prayer_responses FOR DELETE
  USING (auth.uid() = user_id);

-- Users can view prayer responses for requests in circles they belong to
CREATE POLICY "Users can view prayer responses in their circles"
  ON prayer_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prayer_requests pr
      JOIN circle_members cm ON cm.circle_id = pr.circle_id
      WHERE pr.id = prayer_responses.prayer_request_id
        AND cm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 3. HELPER FUNCTIONS
-- =====================================================

-- Get the count of people praying for a request
CREATE OR REPLACE FUNCTION get_praying_count(request_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM prayer_responses
  WHERE prayer_request_id = request_id;
$$ LANGUAGE sql STABLE;

-- Check if current user is praying for a request
CREATE OR REPLACE FUNCTION user_is_praying(request_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM prayer_responses
    WHERE prayer_request_id = request_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE;

-- =====================================================
-- 4. VIEW FOR ENRICHED PRAYER REQUESTS
-- =====================================================

CREATE OR REPLACE VIEW prayer_requests_enriched AS
SELECT 
  pr.*,
  get_praying_count(pr.id) as praying_count,
  user_is_praying(pr.id) as user_is_praying,
  cm.display_name as author_name
FROM prayer_requests pr
LEFT JOIN circle_members cm 
  ON cm.circle_id = pr.circle_id 
  AND cm.user_id = pr.user_id;

-- =====================================================
-- 5. NOTIFICATION TRIGGER FUNCTION
-- =====================================================

-- This function is called when a prayer response is inserted
-- It should send a push notification to the prayer request owner
-- Note: Actual push sending requires an Edge Function or webhook

CREATE OR REPLACE FUNCTION notify_prayer_response()
RETURNS TRIGGER AS $$
DECLARE
  request_owner_id UUID;
  request_title TEXT;
  responder_name TEXT;
  owner_push_token TEXT;
BEGIN
  -- Get the prayer request details
  SELECT user_id, title INTO request_owner_id, request_title
  FROM prayer_requests
  WHERE id = NEW.prayer_request_id;
  
  -- Don't notify yourself
  IF request_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get responder name (from circle_members if available)
  SELECT COALESCE(cm.display_name, 'A circle member') INTO responder_name
  FROM circle_members cm
  JOIN prayer_requests pr ON pr.circle_id = cm.circle_id
  WHERE pr.id = NEW.prayer_request_id
    AND cm.user_id = NEW.user_id
  LIMIT 1;
  
  -- Get owner's push token
  SELECT notification_token INTO owner_push_token
  FROM user_profiles
  WHERE id = request_owner_id;
  
  -- If owner has a push token, insert into a notifications queue
  -- (An Edge Function or cron job would process this queue)
  IF owner_push_token IS NOT NULL THEN
    INSERT INTO notification_queue (
      user_id,
      push_token,
      title,
      body,
      data
    ) VALUES (
      request_owner_id,
      owner_push_token,
      '🙏 Someone is praying for you',
      responder_name || ' is lifting up "' || LEFT(request_title, 50) || '"',
      jsonb_build_object(
        'type', 'prayer_circle',
        'circleId', (SELECT circle_id FROM prayer_requests WHERE id = NEW.prayer_request_id),
        'requestId', NEW.prayer_request_id::text,
        'screen', 'CircleDetail'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE NOTIFICATION QUEUE (for async processing)
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_pending 
  ON notification_queue(created_at) 
  WHERE sent_at IS NULL;

-- RLS: Only system can access notification queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. ATTACH TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS on_prayer_response_created ON prayer_responses;
CREATE TRIGGER on_prayer_response_created
  AFTER INSERT ON prayer_responses
  FOR EACH ROW
  EXECUTE FUNCTION notify_prayer_response();

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON prayer_requests_enriched TO authenticated;
