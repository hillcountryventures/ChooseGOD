/**
 * Gift Subscription Redemption Function
 *
 * Thin wrapper over the redeem_gift_code_atomic RPC which handles
 * validation + code consumption + subscription grant as one transaction.
 *
 * The previous implementation had a race condition: it marked the code
 * redeemed THEN inserted the subscription in two separate queries. If the
 * second step failed, the user lost the code without getting access. The
 * RPC makes it atomic.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuthedUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RedeemRequest {
  code: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Identity from the verified JWT, never the body — otherwise a caller could
    // redeem a code into another account (p_user_id was body-supplied + service-role).
    const auth = await requireAuthedUser(req, corsHeaders);
    if (auth instanceof Response) return auth;
    const { userId, admin: supabase } = auth;

    const payload: RedeemRequest = await req.json().catch(() => ({} as RedeemRequest));
    const code = (payload.code ?? "").trim().toUpperCase();

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase.rpc("redeem_gift_code_atomic", {
      p_code: code,
      p_user_id: userId,
    });

    if (error) {
      console.error("[Gift] RPC error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to process redemption. Please try again.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data?.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: data?.error ?? "Failed to redeem gift code.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const months = data.duration_months ?? 1;
    return new Response(
      JSON.stringify({
        success: true,
        message: `Gift redeemed! You now have ${months} month${months === 1 ? "" : "s"} of ChooseGOD Pro.`,
        durationMonths: months,
        expirationDate: data.expiration_date,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Gift] error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
