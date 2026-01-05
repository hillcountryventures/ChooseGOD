// Run the spiritual tables migration via Supabase Management API
// Usage: node supabase/scripts/run-spiritual-migration.js

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rtozduhxrfsksygsmwuj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0b3pkdWh4cmZza3N5Z3Ntd3VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyNTc5NCwiZXhwIjoyMDgzMjAxNzk0fQ.mQ8Q9EU9HIVUnuzWKoAwHVil-FJkZ0TYdQf-gVcIdxs';

async function runMigration() {
  console.log('Running spiritual tables migration...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '../migrations/003_create_spiritual_tables.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split into individual statements (simple split on semicolons)
  // We'll execute them one by one to better handle errors
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute.\n`);

  // Use the REST API to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    // The exec_sql RPC might not exist, so let's try direct approach
    console.log('Direct SQL execution not available via REST API.');
    console.log('');
    console.log('Please run the migration manually:');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard/project/rtozduhxrfsksygsmwuj/sql');
    console.log('2. Copy the contents of: supabase/migrations/003_create_spiritual_tables.sql');
    console.log('3. Paste and run in the SQL Editor');
    console.log('');
    console.log('Or use the Supabase CLI with a fresh database:');
    console.log('  supabase db reset');
    console.log('');
    return;
  }

  const result = await response.json();
  console.log('Migration completed successfully!');
  console.log(result);
}

// Alternative: Test connection and list tables
async function testConnection() {
  console.log('Testing Supabase connection...\n');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/bible_verses?select=id&limit=1`, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (response.ok) {
    console.log('✅ Connected to Supabase successfully!\n');
    return true;
  } else {
    console.log('❌ Failed to connect to Supabase');
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Error:', text);
    return false;
  }
}

async function checkTables() {
  const tables = [
    'spiritual_moments',
    'prayer_requests',
    'memory_verses',
    'obedience_steps',
    'prayer_circles',
    'circle_members',
    'rhythm_enrollments',
    'growth_insights',
    'user_profiles'
  ];

  console.log('Checking if spiritual tables exist...\n');

  for (const table of tables) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (response.ok) {
      console.log(`✅ ${table} - exists`);
    } else if (response.status === 404 || response.status === 400) {
      console.log(`❌ ${table} - not found (needs migration)`);
    } else {
      console.log(`⚠️  ${table} - error checking (${response.status})`);
    }
  }
}

async function main() {
  const connected = await testConnection();
  if (!connected) return;

  await checkTables();

  console.log('\n-----------------------------------');
  console.log('To create missing tables, run the SQL migration manually:');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/project/rtozduhxrfsksygsmwuj/sql');
  console.log('2. Copy the contents of: supabase/migrations/003_create_spiritual_tables.sql');
  console.log('3. Paste and run in the SQL Editor');
  console.log('-----------------------------------\n');
}

main().catch(console.error);
