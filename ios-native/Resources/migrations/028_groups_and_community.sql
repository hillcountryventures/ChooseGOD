-- Migration 028: Groups, Sermon Follow-ups, and Community Features
-- ChooseGOD Bible Study App
-- Created: 2025-07-11

-- ============================================================================
-- FUNCTION: generate_invite_code()
-- Generates a unique 6-character uppercase alphanumeric invite code
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I/O/0/1 to avoid confusion
  code text := '';
  i int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    -- Ensure uniqueness
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.bible_study_groups WHERE invite_code = code);
  END LOOP;
  RETURN code;
END;
$$;

-- ============================================================================
-- TABLE: bible_study_groups
-- ============================================================================

CREATE TABLE public.bible_study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  invite_code text UNIQUE NOT NULL DEFAULT public.generate_invite_code(),
  church_name text,
  denomination text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  tier text NOT NULL DEFAULT 'free',
  max_members int NOT NULL DEFAULT 25,
  logo_url text,

  CONSTRAINT valid_tier CHECK (tier IN ('free', 'growth', 'church'))
);

CREATE INDEX idx_bible_study_groups_invite_code ON public.bible_study_groups(invite_code);
CREATE INDEX idx_bible_study_groups_created_by ON public.bible_study_groups(created_by);

-- ============================================================================
-- TABLE: group_members
-- ============================================================================

CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  display_name text,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (group_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('member', 'leader', 'pastor'))
);

CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);

-- ============================================================================
-- TABLE: group_discussions
-- ============================================================================

CREATE TABLE public.group_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  display_name text,
  message text NOT NULL,
  passage_reference text,
  parent_id uuid REFERENCES public.group_discussions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_discussions_group_id ON public.group_discussions(group_id);
CREATE INDEX idx_group_discussions_user_id ON public.group_discussions(user_id);
CREATE INDEX idx_group_discussions_parent_id ON public.group_discussions(parent_id);

-- ============================================================================
-- TABLE: group_prayer_requests
-- ============================================================================

CREATE TABLE public.group_prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  display_name text,
  request text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  prayed_by_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_prayer_status CHECK (status IN ('active', 'answered', 'archived'))
);

CREATE INDEX idx_group_prayer_requests_group_id ON public.group_prayer_requests(group_id);
CREATE INDEX idx_group_prayer_requests_user_id ON public.group_prayer_requests(user_id);

-- ============================================================================
-- TABLE: group_reading_plans
-- ============================================================================

CREATE TABLE public.group_reading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  plan_type text,
  passage_reference text,
  start_date date NOT NULL,
  days int NOT NULL,
  plan_data jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_plan_type CHECK (plan_type IN ('curated', 'sermon_followup'))
);

CREATE INDEX idx_group_reading_plans_group_id ON public.group_reading_plans(group_id);

-- ============================================================================
-- TABLE: sermon_followup_plans
-- ============================================================================

CREATE TABLE public.sermon_followup_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  passage_reference text NOT NULL,
  sermon_date date,
  day1_content jsonb,
  day2_content jsonb,
  day3_content jsonb,
  day4_content jsonb,
  day5_content jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sermon_followup_plans_group_id ON public.sermon_followup_plans(group_id);

-- ============================================================================
-- TABLE: community_events
-- ============================================================================

CREATE TABLE public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  event_type text,
  start_date date NOT NULL,
  end_date date,
  plan_data jsonb,
  participant_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_participants
-- ============================================================================

CREATE TABLE public.community_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  group_id uuid REFERENCES public.bible_study_groups(id),
  current_day int NOT NULL DEFAULT 1,
  streak int NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_community_participants_event_id ON public.community_participants(event_id);
CREATE INDEX idx_community_participants_user_id ON public.community_participants(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.bible_study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermon_followup_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_participants ENABLE ROW LEVEL SECURITY;

-- ---- bible_study_groups ----

-- Anyone authenticated can read groups they belong to
CREATE POLICY "Members can view their groups"
  ON public.bible_study_groups FOR SELECT
  USING (
    id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

-- Anyone authenticated can read a group by invite code (for join flow)
CREATE POLICY "Anyone can lookup group by invite code"
  ON public.bible_study_groups FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups"
  ON public.bible_study_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only the creator can update their group
CREATE POLICY "Creator can update group"
  ON public.bible_study_groups FOR UPDATE
  USING (auth.uid() = created_by);

-- Only the creator can delete their group
CREATE POLICY "Creator can delete group"
  ON public.bible_study_groups FOR DELETE
  USING (auth.uid() = created_by);

-- ---- group_members ----

-- Members can see other members in their groups
CREATE POLICY "Members can view group members"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

-- Authenticated users can join groups (insert themselves)
CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own membership (display_name)
CREATE POLICY "Users can update own membership"
  ON public.group_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can leave groups; leaders/pastors can remove members
CREATE POLICY "Users can leave or leaders can remove"
  ON public.group_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('leader', 'pastor')
    )
  );

-- ---- group_discussions ----

CREATE POLICY "Members can view discussions"
  ON public.group_discussions FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can post discussions"
  ON public.group_discussions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authors can update their discussions"
  ON public.group_discussions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete their discussions"
  ON public.group_discussions FOR DELETE
  USING (auth.uid() = user_id);

-- ---- group_prayer_requests ----

CREATE POLICY "Members can view prayer requests"
  ON public.group_prayer_requests FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can create prayer requests"
  ON public.group_prayer_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authors can update their prayer requests"
  ON public.group_prayer_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete their prayer requests"
  ON public.group_prayer_requests FOR DELETE
  USING (auth.uid() = user_id);

-- ---- group_reading_plans ----

CREATE POLICY "Members can view reading plans"
  ON public.group_reading_plans FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Leaders can create reading plans"
  ON public.group_reading_plans FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_reading_plans.group_id
        AND user_id = auth.uid()
        AND role IN ('leader', 'pastor')
    )
  );

CREATE POLICY "Leaders can update reading plans"
  ON public.group_reading_plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_reading_plans.group_id
        AND user_id = auth.uid()
        AND role IN ('leader', 'pastor')
    )
  );

-- ---- sermon_followup_plans ----

CREATE POLICY "Members can view sermon followups"
  ON public.sermon_followup_plans FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Leaders can create sermon followups"
  ON public.sermon_followup_plans FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = sermon_followup_plans.group_id
        AND user_id = auth.uid()
        AND role IN ('leader', 'pastor')
    )
  );

-- ---- community_events ----

CREATE POLICY "Anyone can view active community events"
  ON public.community_events FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---- community_participants ----

CREATE POLICY "Users can view their participation"
  ON public.community_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join community events"
  ON public.community_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their progress"
  ON public.community_participants FOR UPDATE
  USING (auth.uid() = user_id);
