// supabase/functions/unsubscribe/index.ts
// One-click email unsubscribe handler. Validates a one-shot token,
// flips the user's opt-in preference, and returns a friendly HTML page.
//
// URL format: GET /functions/v1/unsubscribe?token={uuid}&scope=weekly_digest

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function htmlPage(title: string, message: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 24px;color:#1a1a1a;text-align:center}h1{font-size:26px}p{color:#555;line-height:1.5}a{color:#c9a962}</style>
</head><body><h1>${title}</h1><p>${message}</p><p><a href="https://choosegod.app">Back to ChooseGOD</a></p></body></html>`;
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const scope = url.searchParams.get("scope") ?? "weekly_digest";

    if (!token) {
      return new Response(
        htmlPage("Missing token", "The unsubscribe link looks incomplete."),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the token
    const { data: row, error: tokenErr } = await supabase
      .from("email_unsubscribe_tokens")
      .select("user_id, used_at, expires_at, scope")
      .eq("token", token)
      .maybeSingle();

    if (tokenErr || !row) {
      return new Response(
        htmlPage("Link invalid", "This unsubscribe link isn't valid."),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (row.used_at) {
      return new Response(
        htmlPage("Already unsubscribed", "You've already been unsubscribed. You won't receive this email anymore."),
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return new Response(
        htmlPage("Link expired", "This unsubscribe link has expired. Open the app to manage preferences."),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (row.scope !== scope && row.scope !== "all") {
      return new Response(
        htmlPage("Scope mismatch", "This link is for a different type of email."),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Flip the preference based on scope
    const prefMap: Record<string, string> = {
      weekly_digest: "weekly_digest_enabled",
      seasonal_winback: "seasonal_winback_enabled",
      product_updates: "product_updates_enabled",
    };
    const column = prefMap[scope];

    if (column) {
      await supabase
        .from("user_preferences")
        .upsert(
          { user_id: row.user_id, [column]: false, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
    }

    // Mark token as used
    await supabase
      .from("email_unsubscribe_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    return new Response(
      htmlPage(
        "You're unsubscribed",
        "We've stopped sending this type of email. You can re-enable it anytime in Settings. Grace to you."
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("[unsubscribe] error", error);
    return new Response(
      htmlPage("Something went wrong", "We couldn't process that request. Please try again from the app."),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
});
