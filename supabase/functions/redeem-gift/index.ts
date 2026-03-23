/**
 * Gift Subscription Redemption Function
 *
 * Redeems a gift subscription code and grants the recipient premium access
 *
 * Security:
 * - Validates gift code exists, is not expired, and has not been redeemed
 * - Uses service_role to update subscriptions table
 * - Requires authenticated user
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RedeemRequest {
  code: string;
  userId: string;
}

interface RedeemResponse {
  success: boolean;
  message?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload: RedeemRequest = await req.json();
    const { code, userId } = payload;

    // Validate input
    if (!code || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing code or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Gift] Attempting to redeem code ${code} for user ${userId}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch the gift code
    const { data: giftCode, error: codeError } = await supabase
      .from("gift_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (codeError || !giftCode) {
      console.error("[Gift] Code not found:", codeError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Gift code not found. Please check the code and try again.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate code is not expired
    if (giftCode.expires_at && new Date(giftCode.expires_at) < new Date()) {
      console.warn(`[Gift] Code ${code} has expired`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "This gift code has expired. Please ask the gifter for a new code.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Validate code has not been redeemed
    if (giftCode.redeemed_by !== null) {
      console.warn(`[Gift] Code ${code} has already been redeemed`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "This gift code has already been redeemed. Each code can only be used once.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Mark code as redeemed
    const { error: updateCodeError } = await supabase
      .from("gift_codes")
      .update({
        redeemed_by: userId,
        redeemed_at: new Date().toISOString(),
      })
      .eq("code", code);

    if (updateCodeError) {
      console.error("[Gift] Failed to mark code as redeemed:", updateCodeError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to process redemption. Please try again.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Create subscription for recipient
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + (giftCode.duration_months || 1));

    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          revenuecat_app_user_id: `gift_${code}`,
          original_app_user_id: `gift_${code}`,
          status: "active",
          is_active: true,
          entitlement_id: "ChooseGOD Pro",
          product_id: `gift_${giftCode.duration_months}m`,
          purchase_date: new Date().toISOString(),
          expiration_date: expirationDate.toISOString(),
          store: "gift",
          is_sandbox: false,
          is_trial_period: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (subscriptionError) {
      console.error("[Gift] Failed to create subscription:", subscriptionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Gift redeemed but failed to activate. Please contact support.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Gift] Successfully redeemed code ${code} for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Gift redeemed! You now have ${giftCode.duration_months} month(s) of ChooseGOD Premium access.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Gift] Error processing redemption:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
