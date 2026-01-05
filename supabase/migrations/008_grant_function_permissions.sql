-- Grant execute permissions on functions to authenticated and anon roles
-- PostgREST requires explicit grants for functions to appear in the schema cache

GRANT EXECUTE ON FUNCTION get_user_devotional_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_devotional_progress(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_recommended_series(TEXT, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_series(TEXT, TEXT, INT) TO anon;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
