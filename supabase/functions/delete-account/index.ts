// supabase/functions/delete-account/index.ts
// Account Deletion - Apple App Store Requirement
//
// This function handles complete account deletion including:
// - All user data from various tables
// - Auth user deletion via admin API
// - RevenueCat customer data (optional webhook)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteAccountRequest {
  userId: string;
  confirmation: string; // Must be "DELETE" to proceed
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the user's JWT from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT and get the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { userId, confirmation }: DeleteAccountRequest = await req.json();

    // Verify the user is deleting their own account
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "You can only delete your own account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Require explicit confirmation
    if (confirmation !== "DELETE") {
      return new Response(
        JSON.stringify({ error: "Confirmation required. Send confirmation: 'DELETE'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Delete Account] Starting deletion for user: ${userId}`);

    // Delete user data from all tables (order matters for foreign keys)
    const tablesToDelete = [
      // Reading plan related
      "reading_session_logs",
      "skipped_sessions",
      "user_reading_progress",

      // Devotional related
      "user_series_enrollments",
      "onboarding_responses",

      // Journal and prayers
      "journal_entries",
      "prayer_requests",

      // Verses and chat
      "verse_highlights",
      "verse_notes",
      "verse_bookmarks",
      "chat_messages",
      "chat_sessions",

      // User profiles (last, as other tables may reference it)
      "user_profiles",
    ];

    const deletionResults: Record<string, { success: boolean; error?: string }> = {};

    for (const table of tablesToDelete) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq("user_id", userId);

        if (error) {
          // Some tables might not exist or user might not have data - that's OK
          console.log(`[Delete Account] Table ${table}: ${error.message}`);
          deletionResults[table] = { success: false, error: error.message };
        } else {
          console.log(`[Delete Account] Table ${table}: deleted`);
          deletionResults[table] = { success: true };
        }
      } catch (tableError) {
        console.error(`[Delete Account] Error deleting from ${table}:`, tableError);
        deletionResults[table] = {
          success: false,
          error: tableError instanceof Error ? tableError.message : "Unknown error"
        };
      }
    }

    // Delete the auth user (this is the critical step)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("[Delete Account] Error deleting auth user:", deleteUserError);
      return new Response(
        JSON.stringify({
          error: "Failed to delete authentication account",
          details: deleteUserError.message,
          dataDeleted: deletionResults,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Delete Account] Successfully deleted user: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account and all associated data have been permanently deleted",
        deletedTables: deletionResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Delete Account] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to delete account",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/* To invoke locally:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-account' \
    --header 'Authorization: Bearer YOUR_USER_JWT' \
    --header 'Content-Type: application/json' \
    --data '{"userId": "user-uuid", "confirmation": "DELETE"}'

*/
