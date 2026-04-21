-- Migration: schedule the weekly-digest Edge Function via pg_cron.
--
-- Runs every Sunday at 20:00 UTC (~ Sunday 3pm US Eastern, Sunday 12pm US
-- Pacific). Most US Christian target users open email Sunday evening,
-- matching the designed Sunday Digest retention mechanic.
--
-- Requires: pg_cron extension + supabase_vault configured with the service
-- role JWT. See: https://supabase.com/docs/guides/functions/schedule-functions

-- Ensure pg_cron + pg_net extensions exist (no-ops if already installed)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Remove any prior schedule with the same job name (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-digest-sunday') THEN
    PERFORM cron.unschedule('weekly-digest-sunday');
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- cron.job table not available in this environment; skip silently.
  NULL;
END $$;

-- Schedule Sunday 20:00 UTC. Actual send-time will vary +/- a minute.
-- The Edge Function invocation uses the project's service-role JWT stored
-- in a GUC named app.settings.service_role_key (set in Supabase dashboard).
DO $$
DECLARE
  project_ref TEXT := current_setting('app.settings.project_ref', true);
  service_key TEXT := current_setting('app.settings.service_role_key', true);
BEGIN
  IF project_ref IS NULL OR service_key IS NULL THEN
    RAISE NOTICE 'Skipping cron schedule: app.settings.project_ref or service_role_key not configured. Schedule manually via dashboard.';
    RETURN;
  END IF;

  PERFORM cron.schedule(
    'weekly-digest-sunday',
    '0 20 * * 0',
    format(
      $fn$
      SELECT net.http_post(
        url := 'https://%s.supabase.co/functions/v1/weekly-digest',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer %s'
        ),
        body := '{}'::jsonb
      );
      $fn$,
      project_ref,
      service_key
    )
  );
EXCEPTION WHEN undefined_function THEN
  RAISE NOTICE 'cron.schedule unavailable; schedule the weekly-digest function manually.';
END $$;
