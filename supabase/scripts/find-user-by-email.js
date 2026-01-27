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

async function findUserByEmail(email) {
  try {
    console.log(`\nSearching for user with email: ${email}\n`);

    // Query auth.users table using admin API
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    const user = data.users.find(u => u.email === email);

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found!');
    console.log('\n--- User Authentication Info ---');
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Email Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`);
    console.log(`Created At: ${user.created_at}`);
    console.log(`Last Sign In: ${user.last_sign_in_at || 'Never'}`);
    console.log(`Phone: ${user.phone || 'Not set'}`);

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileError && profile) {
      console.log('\n--- User Profile Info ---');
      console.log(`Display Name: ${profile.display_name || 'Not set'}`);
      console.log(`Preferred Translation: ${profile.preferred_translation}`);
      console.log(`Maturity Level: ${profile.maturity_level}`);
      console.log(`Onboarding Completed: ${profile.onboarding_completed ? '✅' : '❌'}`);
      console.log(`Notifications Enabled: ${profile.notifications_enabled ? '✅' : '❌'}`);
      console.log(`Timezone: ${profile.timezone}`);
      console.log(`Profile Created: ${profile.created_at}`);
    }

    // Fetch enrollments
    const { data: enrollments, error: enrollError } = await supabase
      .from('user_series_enrollments')
      .select('series_id, current_day, is_active')
      .eq('user_id', user.id);

    if (!enrollError && enrollments && enrollments.length > 0) {
      console.log('\n--- Series Enrollments ---');
      console.log(`Active enrollments: ${enrollments.length}`);
      enrollments.forEach(e => {
        console.log(`  - Series ID: ${e.series_id}, Day: ${e.current_day}, Active: ${e.is_active}`);
      });
    }

    // Fetch reading progress
    const { data: readingProgress, error: readingError } = await supabase
      .from('user_reading_progress')
      .select('plan_id, current_day, streak_count, is_active')
      .eq('user_id', user.id);

    if (!readingError && readingProgress && readingProgress.length > 0) {
      console.log('\n--- Reading Plans Progress ---');
      console.log(`Active reading plans: ${readingProgress.length}`);
      readingProgress.forEach(p => {
        console.log(`  - Plan ID: ${p.plan_id}, Day: ${p.current_day}, Streak: ${p.streak_count}, Active: ${p.is_active}`);
      });
    }

    console.log('\n--- Copy this User ID ---');
    console.log(user.id);
    console.log('');

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Get email from command line argument
const email = process.argv[2] || 'marcorodriqueztx1@gmail.com';
findUserByEmail(email);
