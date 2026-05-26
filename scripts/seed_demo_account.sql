-- Seed a "golden" demo account so every surface shows POPULATED for a buyer:
-- full Journey Timeline, a faithfulness log (answered prayer + testimony), 14 Days With God,
-- a tradition + active intention, and journal/prayers the AI can reference live (the moat).
--
-- HOW TO RUN:
--   1. Create the demo account IN THE APP first (sign up), so it exists in auth.users.
--   2. Set v_email below to that account's email.
--   3. Supabase Dashboard → SQL Editor → paste this whole file → Run.
--      (The SQL editor runs as service-role, so RLS won't block the inserts.)
--   Re-runnable: it clears this user's prior seed rows first.

DO $$
DECLARE
  v_uid   uuid;
  v_email text := 'demo@choosegod.app';   -- <-- CHANGE to your demo account's email
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = v_email;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No auth user with email % — create the account in the app first.', v_email;
  END IF;

  -- Idempotent reset
  DELETE FROM spiritual_moments WHERE user_id = v_uid;
  DELETE FROM prayer_requests   WHERE user_id = v_uid;
  DELETE FROM user_intentions   WHERE user_id = v_uid;

  -- Tradition (personalizes the AI). Valid values:
  -- catholic | protestant_conservative | protestant_progressive | orthodox | non_denominational | exploring
  INSERT INTO user_preferences (user_id, tradition)
  VALUES (v_uid, 'protestant_conservative')
  ON CONFLICT (user_id) DO UPDATE
    SET tradition = EXCLUDED.tradition, updated_at = NOW();

  -- Days With God = 14 (the wedge metric on Home)
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, days_with_god)
  VALUES (v_uid, 14, 14, CURRENT_DATE, 14)
  ON CONFLICT (user_id) DO UPDATE
    SET current_streak = 14, longest_streak = 14, days_with_god = 14, last_activity_date = CURRENT_DATE;

  -- Active intention captured "at onboarding" (so the AI is personalized day 1)
  INSERT INTO user_intentions (user_id, content, source, set_at, expires_at, is_active)
  VALUES (v_uid,
          'Grow in patience with my family and lean on God when work gets heavy.',
          'onboarding', NOW() - INTERVAL '18 days', NOW() + INTERVAL '12 days', TRUE);

  -- Journal / gratitude / confession entries (these feed the moat + the Timeline)
  INSERT INTO spiritual_moments (user_id, moment_type, content, created_at) VALUES
    (v_uid, 'journal',    'Started reading through Philippians. Struck by "rejoice always" even when I feel stretched thin at work.', NOW() - INTERVAL '17 days'),
    (v_uid, 'gratitude',  'Grateful for a hard conversation with my brother that ended in grace instead of a fight.',               NOW() - INTERVAL '12 days'),
    (v_uid, 'confession', 'Lost my temper with the kids again tonight. Asking God for patience and a softer tone tomorrow.',        NOW() - INTERVAL '6 days'),
    (v_uid, 'journal',    'Two weeks in. I notice I reach for prayer before panic now. Small, but real.',                          NOW() - INTERVAL '1 days');

  -- Prayers: 3 unanswered + 1 ANSWERED with a testimony (the faithfulness log)
  INSERT INTO prayer_requests (user_id, request, status, created_at) VALUES
    (v_uid, 'Patience with my kids in the evenings.',               'active',  NOW() - INTERVAL '15 days'),
    (v_uid, 'Wisdom on whether to take the new role at work.',      'active',  NOW() - INTERVAL '9 days'),
    (v_uid, 'Healing for my mom''s recovery after surgery.',        'ongoing', NOW() - INTERVAL '20 days');

  INSERT INTO prayer_requests (user_id, request, status, answered_at, answered_reflection, created_at) VALUES
    (v_uid, 'Peace about our finances this month.', 'answered', NOW() - INTERVAL '3 days',
     'An unexpected freelance check covered exactly what we were short. I prayed about this for three weeks and God provided right at the deadline.',
     NOW() - INTERVAL '24 days');

  RAISE NOTICE 'Seeded golden demo account for % (uid %).', v_email, v_uid;
END $$;
