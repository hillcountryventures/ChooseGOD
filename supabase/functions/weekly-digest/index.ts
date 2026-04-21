/**
 * Weekly Digest Email Function
 * 
 * Sends a weekly summary email to opted-in users with:
 * - Bible reading progress
 * - Prayer updates
 * - Journal highlights
 * - Upcoming devotionals
 * 
 * Triggered by cron job every Sunday at 8am user's local time.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserDigestData {
  userId: string;
  email: string;
  displayName: string;
  bibleChaptersRead: number;
  prayersAnswered: number;
  journalEntries: number;
  currentStreak: number;
  topVerse?: {
    reference: string;
    text: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get users who opted in to weekly digest
    const { data: optedInUsers, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('weekly_digest_enabled', true);

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    if (!optedInUsers || optedInUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users opted in for digest', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let digestsSent = 0;
    const errors: string[] = [];

    for (const user of optedInUsers) {
      try {
        // Gather user's weekly stats
        const digestData = await gatherUserDigestData(supabase, user.user_id, oneWeekAgo);

        if (digestData) {
          // Create a one-shot unsubscribe token for this email.
          // Click-to-unsubscribe sets weekly_digest_enabled=false with no login.
          const { data: tokenRow } = await supabase
            .from('email_unsubscribe_tokens')
            .insert({
              user_id: user.user_id,
              scope: 'weekly_digest',
            })
            .select('token')
            .single();

          await sendDigestEmail(digestData, tokenRow?.token);
          digestsSent++;
        }
      } catch (err) {
        errors.push(`User ${user.user_id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Weekly digest completed',
        sent: digestsSent,
        total: optedInUsers.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Weekly digest error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function gatherUserDigestData(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  since: Date
): Promise<UserDigestData | null> {
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, display_name')
    .eq('id', userId)
    .single();

  if (!profile?.email) {
    return null;
  }

  // Get Bible reading stats
  const { count: chaptersRead } = await supabase
    .from('bible_reading_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('read_at', since.toISOString());

  // Get answered prayers
  const { count: prayersAnswered } = await supabase
    .from('prayers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'answered')
    .gte('updated_at', since.toISOString());

  // Get journal entries
  const { count: journalEntries } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());

  // Get current streak
  const { data: streakData } = await supabase
    .from('user_stats')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  // Get most highlighted/bookmarked verse this week
  const { data: topVerseData } = await supabase
    .from('verse_highlights')
    .select('book, chapter, verse')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let topVerse;
  if (topVerseData) {
    // Fetch the verse text
    const { data: verseText } = await supabase
      .from('verses')
      .select('text')
      .eq('book', topVerseData.book)
      .eq('chapter', topVerseData.chapter)
      .eq('verse', topVerseData.verse)
      .limit(1)
      .single();

    if (verseText) {
      topVerse = {
        reference: `${topVerseData.book} ${topVerseData.chapter}:${topVerseData.verse}`,
        text: verseText.text,
      };
    }
  }

  return {
    userId,
    email: profile.email,
    displayName: profile.display_name || 'Friend',
    bibleChaptersRead: chaptersRead || 0,
    prayersAnswered: prayersAnswered || 0,
    journalEntries: journalEntries || 0,
    currentStreak: streakData?.current_streak || 0,
    topVerse,
  };
}

async function sendDigestEmail(
  data: UserDigestData,
  unsubscribeToken?: string,
): Promise<void> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    // Fail loudly; a silent no-op is worse than an error that alerts ops.
    throw new Error('RESEND_API_KEY not configured \u2014 Sunday Digest cannot send');
  }

  const FROM_ADDRESS = Deno.env.get('DIGEST_FROM_ADDRESS') || 'ChooseGOD <digest@choosegod.app>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: data.email,
      subject: `Your Sunday with ChooseGOD`,
      html: generateDigestHtml(data, unsubscribeToken),
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '(unreadable body)');
    throw new Error(`Resend send failed (${response.status}): ${text}`);
  }
}

function generateDigestHtml(data: UserDigestData, unsubscribeToken?: string): string {
  const APP_URL = Deno.env.get('APP_URL') || 'https://choosegod.app';
  const unsubscribeHref = unsubscribeToken
    ? `${APP_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&scope=weekly_digest`
    : `${APP_URL}/settings`;

  return `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h1 style="font-size: 28px; color: #1a1a1a; margin-bottom: 8px;">Your Sunday with ChooseGOD</h1>
      <p style="color: #555; font-size: 16px; margin-top: 0;">Everyone can use a little more grace.</p>

      <p style="font-size: 16px;">Hi ${data.displayName}, here's what your walk looked like this week:</p>

      <div style="background: #faf7f2; border-left: 4px solid #c9a962; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="margin-top: 0; font-size: 18px;">This Week</h2>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
          <li><strong>${data.bibleChaptersRead}</strong> chapters read</li>
          <li><strong>${data.prayersAnswered}</strong> prayers answered</li>
          <li><strong>${data.journalEntries}</strong> journal entries</li>
          <li><strong>${data.currentStreak}</strong> Days With God</li>
        </ul>
      </div>

      ${data.topVerse ? `
        <div style="background: #f2f6fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 16px;">Your highlighted verse</h3>
          <blockquote style="font-style: italic; margin: 0 0 8px 0; font-size: 17px;">
            \u201C${data.topVerse.text}\u201D
          </blockquote>
          <p style="margin: 0; color: #666; font-size: 14px;">\u2014 ${data.topVerse.reference}</p>
        </div>
      ` : ''}

      <div style="margin: 32px 0; text-align: center;">
        <a href="choosegod://home"
           style="display: inline-block; padding: 12px 28px; background: #c9a962; color: white;
                  text-decoration: none; border-radius: 6px; font-weight: 600;">
          Open ChooseGOD
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e2e2; margin: 32px 0 16px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        You're receiving this because you opted in to weekly digests.<br/>
        <a href="${unsubscribeHref}" style="color: #888;">Unsubscribe</a> \u00b7
        <a href="choosegod://settings" style="color: #888;">Manage preferences</a>
      </p>
    </div>
  `;
}
