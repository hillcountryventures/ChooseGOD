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
          // Send email via your email provider (e.g., Resend, SendGrid)
          await sendDigestEmail(digestData);
          digestsSent++;
        }
      } catch (err) {
        errors.push(`User ${user.user_id}: ${err.message}`);
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

async function sendDigestEmail(data: UserDigestData): Promise<void> {
  // TODO: Integrate with email provider (Resend, SendGrid, etc.)
  // For now, just log the digest
  console.log(`📧 Would send digest to ${data.email}:`, {
    name: data.displayName,
    chaptersRead: data.bibleChaptersRead,
    prayersAnswered: data.prayersAnswered,
    journalEntries: data.journalEntries,
    streak: data.currentStreak,
    topVerse: data.topVerse?.reference,
  });

  // Example Resend integration:
  /*
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ChooseGOD <digest@choosegod.app>',
      to: data.email,
      subject: `Your Week with ChooseGOD 📖`,
      html: generateDigestHtml(data),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${await response.text()}`);
  }
  */
}

function generateDigestHtml(data: UserDigestData): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1a365d;">Your Week with ChooseGOD</h1>
      <p>Hi ${data.displayName}! Here's your spiritual journey this week:</p>
      
      <div style="background: #f7fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h2 style="margin-top: 0;">📊 This Week's Progress</h2>
        <ul style="list-style: none; padding: 0;">
          <li>📖 <strong>${data.bibleChaptersRead}</strong> chapters read</li>
          <li>🙏 <strong>${data.prayersAnswered}</strong> prayers answered</li>
          <li>✍️ <strong>${data.journalEntries}</strong> journal entries</li>
          <li>🔥 <strong>${data.currentStreak}</strong> day streak</li>
        </ul>
      </div>
      
      ${data.topVerse ? `
        <div style="background: #ebf8ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">✨ Your Highlighted Verse</h3>
          <blockquote style="font-style: italic; margin: 0;">
            "${data.topVerse.text}"
          </blockquote>
          <p style="margin-bottom: 0; color: #4a5568;">— ${data.topVerse.reference}</p>
        </div>
      ` : ''}
      
      <p style="color: #718096; font-size: 14px;">
        Keep growing in faith! Open ChooseGOD to continue your journey.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      
      <p style="color: #a0aec0; font-size: 12px;">
        You're receiving this because you opted in to weekly digests.
        <a href="choosegod://settings">Manage preferences</a>
      </p>
    </div>
  `;
}
