-- Migration: cloud-sync storage for Pro users' chat conversations.
--
-- Free users keep using AsyncStorage only. Pro users get their chat
-- history replicated to this table so a phone switch / reinstall doesn't
-- lose their walk with the companion.
--
-- Schema matches the client SavedConversation shape. messages is stored
-- as JSONB for full fidelity (tool calls, streaming state, timestamps).

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  preview TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  message_count INT NOT NULL DEFAULT 0,
  starred BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_updated
  ON public.chat_conversations (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_starred
  ON public.chat_conversations (user_id) WHERE starred = TRUE;

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users CRUD own chat_conversations" ON public.chat_conversations;
CREATE POLICY "Users CRUD own chat_conversations"
  ON public.chat_conversations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_chat_conversations_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DO $trigger_setup$
BEGIN
  DROP TRIGGER IF EXISTS chat_conversations_updated_at ON public.chat_conversations;
  CREATE TRIGGER chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_chat_conversations_updated_at();
END
$trigger_setup$;

COMMENT ON TABLE public.chat_conversations IS
  'Pro-only: cloud-synced chat history. Free users store in AsyncStorage only.';
