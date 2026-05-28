// supabase/functions/_shared/auth.ts
//
// Shared authentication helper for edge functions that operate on user-scoped
// data with the service-role client.
//
// THE RULE: never trust a `userId`/`user_id` from the request body. A function
// that reads the caller's identity from the body AND queries with the
// service-role key turns the service role into an IDOR (any caller can read or
// write any other user's rows). Derive the identity from the verified JWT in the
// Authorization header instead, and key every user-scoped query on THAT id.
//
// Callers (Supabase JS `functions.invoke` and supabase-swift `functions.invoke`)
// attach the session's access token automatically, so this is transparent to a
// correctly-authenticated client.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthedUser {
  userId: string;
  /** Service-role client — safe to use for user-scoped queries now that the id is JWT-verified. */
  admin: SupabaseClient;
}

/**
 * Verify the caller's Supabase JWT and return their user id + a service-role client.
 * On a missing/invalid token returns a 401 `Response` (the caller should `return` it).
 *
 * Usage:
 *   const auth = await requireAuthedUser(req, corsHeaders);
 *   if (auth instanceof Response) return auth;
 *   const { userId, admin } = auth;   // use `userId` for every .eq("user_id", ...)
 */
export async function requireAuthedUser(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<AuthedUser | Response> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return { userId: data.user.id, admin };
}
