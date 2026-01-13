-- Migration: Create companion_audit_logs table for Scripture fidelity monitoring
-- Purpose: Track and audit AI companion responses for deviations from Scripture
-- Created: 2026-01-13

-- Create the audit logs table
CREATE TABLE IF NOT EXISTS public.companion_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    thread_id UUID NOT NULL,
    mode TEXT NOT NULL,
    validation_warnings TEXT[] NOT NULL DEFAULT '{}',
    response_preview TEXT NOT NULL,
    retrieved_verses_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Index for querying by user and date
    CONSTRAINT valid_mode CHECK (mode IN (
        'auto', 'devotional', 'prayer', 'lectio', 'examen',
        'memory', 'confession', 'gratitude', 'celebration', 'journal'
    ))
);

-- Create indexes for efficient querying
CREATE INDEX idx_companion_audit_logs_user_id ON public.companion_audit_logs(user_id);
CREATE INDEX idx_companion_audit_logs_created_at ON public.companion_audit_logs(created_at DESC);
CREATE INDEX idx_companion_audit_logs_mode ON public.companion_audit_logs(mode);
CREATE INDEX idx_companion_audit_logs_warnings ON public.companion_audit_logs USING GIN(validation_warnings);

-- Add RLS policies
ALTER TABLE public.companion_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can read audit logs (for admin review)
CREATE POLICY "Service role can read all audit logs"
    ON public.companion_audit_logs
    FOR SELECT
    USING (auth.role() = 'service_role');

-- Only service role can insert audit logs (from Edge Function)
CREATE POLICY "Service role can insert audit logs"
    ON public.companion_audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT ON public.companion_audit_logs TO service_role;

-- Create a view for easy monitoring (counts by mode and warning type)
CREATE OR REPLACE VIEW public.companion_audit_summary AS
SELECT
    mode,
    unnest(validation_warnings) AS warning_type,
    COUNT(*) AS occurrence_count,
    DATE(created_at) AS date
FROM public.companion_audit_logs
GROUP BY mode, warning_type, DATE(created_at)
ORDER BY date DESC, occurrence_count DESC;

GRANT SELECT ON public.companion_audit_summary TO service_role;

-- Add a helper function to get recent warnings
CREATE OR REPLACE FUNCTION public.get_recent_companion_warnings(
    days_back INTEGER DEFAULT 7,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    mode TEXT,
    warnings TEXT[],
    response_preview TEXT,
    verses_count INTEGER,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cal.id,
        cal.mode,
        cal.validation_warnings,
        cal.response_preview,
        cal.retrieved_verses_count,
        cal.created_at
    FROM public.companion_audit_logs cal
    WHERE cal.created_at >= now() - (days_back || ' days')::INTERVAL
    ORDER BY cal.created_at DESC
    LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_companion_warnings TO service_role;

-- Add comment for documentation
COMMENT ON TABLE public.companion_audit_logs IS 'Audit log for AI companion responses that fail Scripture fidelity validation checks. Used for monitoring and improving prompt engineering.';
COMMENT ON COLUMN public.companion_audit_logs.validation_warnings IS 'Array of validation warnings (e.g., "Response does not begin with bold Scripture citation", "Response cites verses not in retrieved context")';
COMMENT ON COLUMN public.companion_audit_logs.response_preview IS 'First 500 characters of the response for context';
COMMENT ON COLUMN public.companion_audit_logs.retrieved_verses_count IS 'Number of verses that were retrieved from RAG for this query';
