#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function searchUsers(searchTerm) {
  try {
    console.log(`\n🔍 Searching for users matching: "${searchTerm}"\n`);

    // Get all users
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log(`Total users in database: ${data.users.length}\n`);

    // Search by email (case-insensitive partial match)
    const matches = data.users.filter(u =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matches.length === 0) {
      console.log('❌ No users found matching that search term\n');
      console.log('🔍 Showing users with similar patterns:\n');

      // Try to find similar patterns
      const parts = searchTerm.toLowerCase().split('@');
      const similarUsers = data.users.filter(u => {
        const email = u.email?.toLowerCase() || '';
        return parts.some(part => email.includes(part));
      }).slice(0, 10);

      if (similarUsers.length > 0) {
        similarUsers.forEach(u => {
          console.log(`  📧 ${u.email}`);
          console.log(`     ID: ${u.id}`);
          console.log(`     Created: ${u.created_at}`);
          console.log(`     Last sign in: ${u.last_sign_in_at || 'Never'}`);
          console.log('');
        });
      } else {
        console.log('No similar users found either.\n');
        console.log('Recent users (last 10):');
        data.users
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
          .forEach(u => {
            console.log(`  📧 ${u.email}`);
            console.log(`     ID: ${u.id}`);
            console.log(`     Created: ${u.created_at}`);
            console.log('');
          });
      }
      return;
    }

    console.log(`✅ Found ${matches.length} matching user(s):\n`);

    for (const user of matches) {
      console.log('═══════════════════════════════════════════════════');
      console.log(`📧 Email: ${user.email}`);
      console.log(`🆔 User ID (RevenueCat Customer ID): ${user.id}`);
      console.log(`📅 Created: ${user.created_at}`);
      console.log(`🔐 Email Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
      console.log(`🕐 Last Sign In: ${user.last_sign_in_at || 'Never'}`);
      console.log(`📱 Phone: ${user.phone || 'Not set'}`);

      // Show auth provider
      if (user.app_metadata?.provider) {
        console.log(`🔑 Auth Provider: ${user.app_metadata.provider}`);
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        console.log('\n📋 Profile:');
        console.log(`   Display Name: ${profile.display_name || 'Not set'}`);
        console.log(`   Translation: ${profile.preferred_translation}`);
        console.log(`   Maturity: ${profile.maturity_level}`);
        console.log(`   Onboarding: ${profile.onboarding_completed ? '✅' : '❌'}`);
        console.log(`   Notifications: ${profile.notifications_enabled ? '✅' : '❌'}`);
      }

      // Show recent activity
      const { data: recentActivity } = await supabase
        .from('query_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentActivity) {
        console.log(`\n🕐 Last Activity: ${recentActivity.created_at}`);
      }

      console.log('\n📋 Copy this for RevenueCat:');
      console.log(`   ${user.id}`);
      console.log('═══════════════════════════════════════════════════\n');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Get search term from command line
const searchTerm = process.argv[2];

if (!searchTerm) {
  console.error('Usage: node search-users.js <email-or-partial-match>');
  console.error('Example: node search-users.js marco');
  console.error('Example: node search-users.js @gmail.com');
  process.exit(1);
}

searchUsers(searchTerm);
