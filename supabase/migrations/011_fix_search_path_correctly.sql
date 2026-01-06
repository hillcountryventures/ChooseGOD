-- Migration: Fix search_path correctly using ALTER FUNCTION
-- Use search_path = public instead of empty string

-- Fix get_recommended_series
ALTER FUNCTION public.get_recommended_series(TEXT, TEXT, INT)
  SET search_path = public;

-- Fix get_user_devotional_progress
ALTER FUNCTION public.get_user_devotional_progress(UUID)
  SET search_path = public;

-- Fix ensure_single_primary_enrollment trigger function
ALTER FUNCTION public.ensure_single_primary_enrollment()
  SET search_path = public;
