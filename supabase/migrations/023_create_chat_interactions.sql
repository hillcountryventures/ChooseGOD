-- Migration: Create chat_interactions table for usage analytics
-- This enables tracking chat usage per user to inform pricing decisions

-- Create the chat_interactions table
CREATE TABLE IF NOT EXISTS public.chat_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Chat context
  mode TEXT NOT NULL DEFAULT 'auto',
  wit_level TEXT DEFAULT 'medium',

  -- Subscription status at time of interaction
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  seeds_remaining INTEGER, -- NULL for premium users

  -- Optional metadata
  thread_id UUID,
  has_bible_context BOOLEAN DEFAULT FALSE,
  response_length INTEGER -- character count of response
);

-- Create indexes for efficient analytics queries
CREATE INDEX idx_chat_interactions_user_id ON public.chat_interactions(user_id);
CREATE INDEX idx_chat_interactions_created_at ON public.chat_interactions(created_at);
CREATE INDEX idx_chat_interactions_is_premium ON public.chat_interactions(is_premium);
CREATE INDEX idx_chat_interactions_user_date ON public.chat_interactions(user_id, created_at);

-- Enable RLS
ALTER TABLE public.chat_interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own interactions
CREATE POLICY "Users can view own chat interactions"
  ON public.chat_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service role can insert (edge function uses service role)
CREATE POLICY "Service role can insert chat interactions"
  ON public.chat_interactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.chat_interactions TO authenticated;
GRANT INSERT ON public.chat_interactions TO service_role;
GRANT ALL ON public.chat_interactions TO postgres;

-- Add helpful comment
COMMENT ON TABLE public.chat_interactions IS 'Tracks all chat interactions for usage analytics and pricing decisions';
