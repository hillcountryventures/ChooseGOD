-- Add audio_url column to devotional_days for pre-generated Voicebox audio
ALTER TABLE devotional_days ADD COLUMN IF NOT EXISTS audio_url TEXT;

COMMENT ON COLUMN devotional_days.audio_url IS 'Public Supabase Storage URL for pre-generated MP3 audio (Bobby voice via Voicebox)';
