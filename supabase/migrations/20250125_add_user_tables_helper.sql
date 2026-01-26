-- Helper function to get all tables with a user_id column
-- Used by delete-account edge function for GDPR-compliant account deletion
-- This ensures we don't miss any user data when new tables are added

CREATE OR REPLACE FUNCTION get_tables_with_user_id()
RETURNS TABLE(table_name text, column_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.table_name::text,
    c.column_name::text
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.column_name = 'user_id'
    AND c.table_name NOT LIKE '%_backup%'
    AND c.table_name NOT IN ('schema_migrations', 'supabase_functions')
  ORDER BY 
    -- Order by dependencies: profiles last
    CASE WHEN c.table_name LIKE '%profile%' THEN 1 ELSE 0 END,
    c.table_name;
END;
$$;

-- Grant execute to authenticated users (needed for edge function)
GRANT EXECUTE ON FUNCTION get_tables_with_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tables_with_user_id() TO service_role;

COMMENT ON FUNCTION get_tables_with_user_id() IS 
  'Returns all public tables with user_id column for account deletion compliance';
