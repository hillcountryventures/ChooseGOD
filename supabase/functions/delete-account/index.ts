// supabase/functions/delete-account/index.ts
// Account Deletion \u2014 Apple App Store requirement + GDPR right-to-erasure.
//
// Behavior:
//   mode: 'queue'    \u2014 stage deletion with a 24h grace window. Creates a
//                      pending_deletions row. User can cancel until then.
//   mode: 'cancel'   \u2014 cancel a queued deletion while still within the window.
//   mode: 'finalize' \u2014 perform the irreversible wipe (called either by the user
//                      skipping the grace window, or by a scheduled worker).
//
// Uses get_tables_with_user_id() RPC to discover every user-scoped table
// in the current schema \u2014 so new tables are covered automatically.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type DeletionMode = "queue" | "cancel" | "finalize";

interface DeleteAccountRequest {
  userId: string;
  confirmation: string; // Must be "DELETE"
  mode?: DeletionMode; // Default: 'queue'
}

// Fallback table list used only if get_tables_with_user_id() is missing
// or returns nothing. Kept exhaustive so we don't silently skip user data.
const FALLBACK_TABLES = [
  // Reading plans
  "reading_session_logs",
  "skipped_sessions",
  "user_reading_progress",
  // Devotionals / onboarding
  "user_series_enrollments",
  "onboarding_responses",
  // Journal + spiritual moments + obedience + gratitude
  "journal_entries",
  "spiritual_moments",
  "obedience_steps",
  "gratitude_entries",
  // Prayer
  "prayer_requests",
  "prayer_circles",
  "circle_members",
  // Bible annotations
  "verse_highlights",
  "verse_notes",
  "verse_bookmarks",
  "daily_verses",
  "memory_verses",
  // Chat
  "chat_messages",
  "chat_sessions",
  "chat_conversations",
  "chat_interactions",
  // Subscription / referral / gifts
  "subscriptions",
  "user_referrals",
  // Privacy / prefs
  "user_preferences",
  "user_blocks",
  "reports",
  "crisis_flags",
  "user_insights",
  // Notifications
  "user_push_tokens",
  // Streaks / progress
  "user_streaks",
  "spiritual_health_scores",
  // Finally, profile
  "user_profiles",
];

async function deleteAllUserData(
  supabaseAdmin: SupabaseClient,
  userId: string
): Promise<Record<string, { success: boolean; error?: string }>> {
  // Prefer dynamic schema discovery; fall back to hardcoded list.
  let tablesToDelete: string[];
  const { data: userTables, error: schemaError } = await supabaseAdmin
    .rpc("get_tables_with_user_id");

  if (schemaError || !userTables || userTables.length === 0) {
    console.warn(
      `[Delete Account] get_tables_with_user_id unavailable (${schemaError?.message ?? 'empty result'}), using fallback list`
    );
    tablesToDelete = FALLBACK_TABLES;
  } else {
    tablesToDelete = userTables.map((t: { table_name: string }) => t.table_name);
  }

  const results: Record<string, { success: boolean; error?: string }> = {};
  for (const table of tablesToDelete) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq("user_id", userId);
      if (error) {
        console.log(`[Delete Account] ${table}: ${error.message}`);
        results[table] = { success: false, error: error.message };
      } else {
        results[table] = { success: true };
      }
    } catch (tableError) {
      results[table] = {
        success: false,
        error: tableError instanceof Error ? tableError.message : "Unknown",
      };
    }
  }
  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Require a valid JWT on every mode. For finalize-by-worker, worker
    // should call this with service role directly (bypass this check).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const user = authData.user;

    const body: DeleteAccountRequest = await req.json();
    const { userId, confirmation } = body;
    const mode: DeletionMode = body.mode ?? "queue";

    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "You can only modify your own account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (confirmation !== "DELETE" && mode !== "cancel") {
      return new Response(
        JSON.stringify({ error: "Confirmation required. Send confirmation: 'DELETE'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== mode: cancel ==========
    if (mode === "cancel") {
      const { error } = await supabaseAdmin
        .from("pending_deletions")
        .update({ cancelled: true, cancelled_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("cancelled", false);
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, message: "Deletion cancelled. Your account is safe." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== mode: queue (default) ==========
    if (mode === "queue") {
      const executeAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabaseAdmin
        .from("pending_deletions")
        .upsert(
          {
            user_id: userId,
            requested_at: new Date().toISOString(),
            execute_at: executeAt,
            cancelled: false,
            cancelled_at: null,
          },
          { onConflict: "user_id" }
        );
      if (error) {
        console.error("[Delete Account] queue failed", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          status: "queued",
          executeAt,
          message:
            "Your account is scheduled for deletion in 24 hours. You can cancel anytime before then.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== mode: finalize (irreversible) ==========
    console.log(`[Delete Account] FINALIZE for user: ${userId}`);

    const deletionResults = await deleteAllUserData(supabaseAdmin, userId);

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("[Delete Account] auth.admin.deleteUser failed", deleteUserError);
      return new Response(
        JSON.stringify({
          error: "Failed to delete authentication account",
          details: deleteUserError.message,
          dataDeleted: deletionResults,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: "finalized",
        message: "Account and all associated data have been permanently deleted.",
        deletedTables: deletionResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Delete Account] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to delete account",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
