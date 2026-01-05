-- Migration: Move vector extension from public to extensions schema
-- This resolves the Supabase linter warning about extensions in public schema

-- Create the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Drop the extension from public schema and recreate in extensions schema
DROP EXTENSION IF EXISTS vector;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Update the search path to include extensions schema so vector types are accessible
ALTER DATABASE postgres SET search_path TO public, extensions;

-- For the current session
SET search_path TO public, extensions;
