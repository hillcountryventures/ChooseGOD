-- Migration: Create spiritual features tables
-- Description: Adds tables for spiritual moments, prayers, memory verses, obedience steps, and prayer circles

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Core spiritual activity log (everything feeds here)
CREATE TABLE IF NOT EXISTS spiritual_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  moment_type TEXT NOT NULL CHECK (moment_type IN ('journal', 'prayer', 'devotional', 'gratitude', 'confession', 'memory_practice', 'obedience_step', 'lectio', 'examen')),
  content TEXT NOT NULL,
  ai_reflection TEXT,
  linked_verses JSONB DEFAULT '[]'::JSONB,
  sentiment_score FLOAT,
  themes TEXT[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Prayer requests with lifecycle
CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  circle_id UUID,
  request TEXT NOT NULL,
  scripture_anchor JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'answered', 'ongoing')),
  answered_at TIMESTAMPTZ,
  answered_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory verses with spaced repetition
CREATE TABLE IF NOT EXISTS memory_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INT NOT NULL,
  verse_start INT NOT NULL,
  verse_end INT,
  text TEXT NOT NULL,
  translation TEXT DEFAULT 'kjv',
  mnemonic TEXT,
  story_version TEXT,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Obedience commitments
CREATE TABLE IF NOT EXISTS obedience_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  source_moment_id UUID REFERENCES spiritual_moments(id),
  commitment TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  follow_up_sent BOOLEAN DEFAULT FALSE,
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prayer circles (groups)
CREATE TABLE IF NOT EXISTS prayer_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users ON DELETE CASCADE,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circle members
CREATE TABLE IF NOT EXISTS circle_members (
  circle_id UUID REFERENCES prayer_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (circle_id, user_id)
);

-- Add foreign key to prayer_requests for circle_id (after circle table exists)
ALTER TABLE prayer_requests
  ADD CONSTRAINT fk_prayer_circle
  FOREIGN KEY (circle_id)
  REFERENCES prayer_circles(id)
  ON DELETE SET NULL;

-- Seasonal rhythm tracking
CREATE TABLE IF NOT EXISTS rhythm_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  rhythm_type TEXT NOT NULL CHECK (rhythm_type IN ('advent', 'lent', 'sabbath', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  current_day INT DEFAULT 1,
  completed_days INT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Growth insights (AI-generated periodically)
CREATE TABLE IF NOT EXISTS growth_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('weekly', 'monthly', 'quarterly', 'yearly', 'theme')),
  title TEXT,
  narrative TEXT,
  key_moments UUID[],
  themes_growth JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles extension (for spiritual preferences)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  preferred_translation TEXT DEFAULT 'kjv',
  maturity_level TEXT DEFAULT 'growing' CHECK (maturity_level IN ('new_believer', 'growing', 'mature', 'leader')),
  daily_devotional BOOLEAN DEFAULT TRUE,
  evening_examen BOOLEAN DEFAULT FALSE,
  current_rhythm TEXT,
  notification_token TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_spiritual_moments_user ON spiritual_moments(user_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_moments_type ON spiritual_moments(moment_type);
CREATE INDEX IF NOT EXISTS idx_spiritual_moments_created ON spiritual_moments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_circle ON prayer_requests(circle_id);
CREATE INDEX IF NOT EXISTS idx_memory_verses_user ON memory_verses(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_verses_review ON memory_verses(next_review);
CREATE INDEX IF NOT EXISTS idx_obedience_steps_user ON obedience_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_obedience_steps_completed ON obedience_steps(completed);
CREATE INDEX IF NOT EXISTS idx_growth_insights_user ON growth_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_insights_period ON growth_insights(period_start, period_end);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE spiritual_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE obedience_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rhythm_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Spiritual moments: users can only see their own
CREATE POLICY "Users can view own spiritual moments" ON spiritual_moments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spiritual moments" ON spiritual_moments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own spiritual moments" ON spiritual_moments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own spiritual moments" ON spiritual_moments
  FOR DELETE USING (auth.uid() = user_id);

-- Prayer requests: users see own + circle prayers
CREATE POLICY "Users can view own prayer requests" ON prayer_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert prayer requests" ON prayer_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prayer requests" ON prayer_requests
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prayer requests" ON prayer_requests
  FOR DELETE USING (auth.uid() = user_id);

-- Memory verses: users only see their own
CREATE POLICY "Users can view own memory verses" ON memory_verses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memory verses" ON memory_verses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory verses" ON memory_verses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memory verses" ON memory_verses
  FOR DELETE USING (auth.uid() = user_id);

-- Obedience steps: users only see their own
CREATE POLICY "Users can view own obedience steps" ON obedience_steps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own obedience steps" ON obedience_steps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own obedience steps" ON obedience_steps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own obedience steps" ON obedience_steps
  FOR DELETE USING (auth.uid() = user_id);

-- Prayer circles: members can view
CREATE POLICY "Circle members can view circles" ON prayer_circles
  FOR SELECT USING (
    created_by = auth.uid() OR
    id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create circles" ON prayer_circles
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Circle creators can update" ON prayer_circles
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Circle creators can delete" ON prayer_circles
  FOR DELETE USING (auth.uid() = created_by);

-- Circle members: members can view membership
CREATE POLICY "Circle members can view members" ON circle_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can join circles" ON circle_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave circles" ON circle_members
  FOR DELETE USING (auth.uid() = user_id);

-- Rhythm enrollments: users only see their own
CREATE POLICY "Users can view own rhythms" ON rhythm_enrollments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rhythms" ON rhythm_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rhythms" ON rhythm_enrollments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rhythms" ON rhythm_enrollments
  FOR DELETE USING (auth.uid() = user_id);

-- Growth insights: users only see their own
CREATE POLICY "Users can view own insights" ON growth_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON growth_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User profiles: users only see their own
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role bypass for edge functions
CREATE POLICY "Service role full access to spiritual_moments" ON spiritual_moments
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to prayer_requests" ON prayer_requests
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to memory_verses" ON memory_verses
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to obedience_steps" ON obedience_steps
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to prayer_circles" ON prayer_circles
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to circle_members" ON circle_members
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to rhythm_enrollments" ON rhythm_enrollments
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to growth_insights" ON growth_insights
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to user_profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');
