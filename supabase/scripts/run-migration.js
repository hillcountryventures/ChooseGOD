// Run the spiritual tables migration
// Usage: node supabase/scripts/run-migration.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://rtozduhxrfsksygsmwuj.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0b3pkdWh4cmZza3N5Z3Ntd3VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyNTc5NCwiZXhwIjoyMDgzMjAxNzk0fQ.mQ8Q9EU9HIVUnuzWKoAwHVil-FJkZ0TYdQf-gVcIdxs'
);

async function createTables() {
  console.log('Creating spiritual_moments table...');

  // Test connection first
  const { data: testData, error: testError } = await supabase
    .from('bible_verses')
    .select('id')
    .limit(1);

  if (testError) {
    console.error('Connection test failed:', testError.message);
    return;
  }

  console.log('Connected successfully!');
  console.log('');
  console.log('NOTE: You need to run the SQL migration manually in the Supabase Dashboard.');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/project/rtozduhxrfsksygsmwuj/sql');
  console.log('2. Copy the contents of: supabase/migrations/003_create_spiritual_tables.sql');
  console.log('3. Paste and run in the SQL Editor');
  console.log('');
  console.log('The migration will create these tables:');
  console.log('  - spiritual_moments');
  console.log('  - prayer_requests');
  console.log('  - memory_verses');
  console.log('  - obedience_steps');
  console.log('  - prayer_circles');
  console.log('  - circle_members');
  console.log('  - rhythm_enrollments');
  console.log('  - growth_insights');
  console.log('  - user_profiles');
}

createTables();
