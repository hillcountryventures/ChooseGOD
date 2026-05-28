/**
 * RevenueCat Webhook Handler
 *
 * Handles subscription lifecycle events from RevenueCat:
 * - INITIAL_PURCHASE: New subscription started
 * - RENEWAL: Subscription renewed
 * - CANCELLATION: User cancelled (may still have access until expiration)
 * - EXPIRATION: Subscription expired
 * - BILLING_ISSUE: Payment failed (retry period)
 * - PRODUCT_CHANGE: User changed subscription tier
 * - UNCANCELLATION: User re-enabled auto-renew
 *
 * Security:
 * - Validates webhook signature using REVENUECAT_WEBHOOK_SECRET
 * - Only accepts POST requests
 * - Logs all events for auditing
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-revenuecat-webhook-secret",
};

// RevenueCat event types
type RevenueCatEventType =
  | "INITIAL_PURCHASE"
  | "RENEWAL"
  | "CANCELLATION"
  | "UNCANCELLATION"
  | "EXPIRATION"
  | "BILLING_ISSUE"
  | "PRODUCT_CHANGE"
  | "TRANSFER"
  | "SUBSCRIPTION_PAUSED"
  | "SUBSCRIPTION_RESUMED"
  | "NON_RENEWING_PURCHASE"
  | "TEST";

interface RevenueCatEvent {
  type: RevenueCatEventType;
  id: string;
  app_user_id: string;
  original_app_user_id?: string;
  product_id?: string;
  entitlement_ids?: string[];
  period_type?: string;
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  original_purchase_date_ms?: number;
  store?: string;
  environment?: string;
  is_family_share?: boolean;
  presented_offering_id?: string;
  takehome_percentage?: number;
  price?: number;
  currency?: string;
  subscriber_attributes?: Record<string, { value: string; updated_at_ms: number }>;
  transaction_id?: string;
  original_transaction_id?: string;
  aliases?: string[];
  cancel_reason?: string;
}

interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

// Map event types to subscription status
function getStatusFromEvent(eventType: RevenueCatEventType): {
  status: string;
  isActive: boolean;
} {
  switch (eventType) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "SUBSCRIPTION_RESUMED":
      return { status: "active", isActive: true };
    case "CANCELLATION":
      // Cancelled but may still have access until expiration
      return { status: "cancelled", isActive: true };
    case "EXPIRATION":
      return { status: "expired", isActive: false };
    case "BILLING_ISSUE":
      return { status: "billing_retry", isActive: true }; // Grace period
    case "SUBSCRIPTION_PAUSED":
      return { status: "paused", isActive: false };
    case "PRODUCT_CHANGE":
      return { status: "active", isActive: true };
    default:
      return { status: "unknown", isActive: false };
  }
}

// Verify webhook signature. REJECTS if secret or signature is missing — do not allow bypass.
async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!secret) {
    console.error("[Webhook] No secret configured — rejecting");
    return false;
  }
  if (!signature) {
    console.error("[Webhook] No signature provided — rejecting");
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expectedSignature === signature;
  } catch (error) {
    console.error("[Webhook] Signature verification error:", error);
    return false;
  }
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
    const rawBody = await req.text();
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

    // REQUIRE webhook secret — reject all requests if not configured.
    // Otherwise anyone could POST fake purchase events and grant premium.
    if (!webhookSecret) {
      console.error("[Webhook] REVENUECAT_WEBHOOK_SECRET not configured — rejecting request");
      return new Response(
        JSON.stringify({ error: "Webhook not configured. Set REVENUECAT_WEBHOOK_SECRET in Edge Function env vars." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify Authorization header (recommended by RevenueCat) or fall back to signature check
    const authHeader = req.headers.get("authorization");
    const expectedAuth = `Bearer ${webhookSecret}`;

    if (authHeader !== expectedAuth) {
      // Also try signature header as fallback
      const signature = req.headers.get("x-revenuecat-webhook-signature");
      const isValidSignature = await verifyWebhookSignature(rawBody, signature, webhookSecret);

      if (!isValidSignature) {
        console.error("[Webhook] Invalid authorization - header:", authHeader?.substring(0, 20) + "...");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    console.log("[Webhook] Authorization verified successfully");

    const payload: RevenueCatWebhookPayload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`[Webhook] Received ${event.type} for user ${event.app_user_id}`);

    // Skip test events in production logging but still acknowledge
    if (event.type === "TEST") {
      console.log("[Webhook] Test event received successfully");
      return new Response(
        JSON.stringify({ success: true, message: "Test event acknowledged" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Idempotency: RevenueCat retries deliveries. Claim this event id first; a
    // duplicate-key conflict means we already processed it — ack and skip so a
    // replay can't re-run the subscription upsert / grants.
    if (event.id) {
      const { error: dedupeError } = await supabase
        .from("processed_webhook_events")
        .insert({ event_id: event.id, event_type: event.type });
      if (dedupeError?.code === "23505") {
        console.log(`[Webhook] Duplicate event ${event.id} — already processed, skipping`);
        return new Response(
          JSON.stringify({ success: true, duplicate: true, event_id: event.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (dedupeError) {
        console.warn("[Webhook] dedup insert error (continuing):", dedupeError.message);
      }
    }

    // Get status from event
    const { status, isActive } = getStatusFromEvent(event.type);

    // Build subscription update data
    const subscriptionData: Record<string, unknown> = {
      revenuecat_app_user_id: event.app_user_id,
      original_app_user_id: event.original_app_user_id || event.app_user_id,
      status,
      is_active: isActive,
      entitlement_id: event.entitlement_ids?.[0] || null,
      product_id: event.product_id || null,
      purchase_date: event.purchased_at_ms
        ? new Date(event.purchased_at_ms).toISOString()
        : null,
      expiration_date: event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : null,
      original_purchase_date: event.original_purchase_date_ms
        ? new Date(event.original_purchase_date_ms).toISOString()
        : null,
      store: event.store || null,
      is_sandbox: event.environment === "SANDBOX",
      is_trial_period: event.period_type === "TRIAL",
      updated_at: new Date().toISOString(),
    };

    // Handle specific event fields
    if (event.type === "CANCELLATION") {
      subscriptionData.unsubscribe_detected_at = new Date().toISOString();
    }
    if (event.type === "BILLING_ISSUE") {
      subscriptionData.billing_issues_detected_at = new Date().toISOString();
    }

    // Try to find user by RevenueCat app_user_id (which should be Supabase user_id)
    // RevenueCat app_user_id is set during Purchases.logIn(userId) in the app
    let userId = event.app_user_id;

    // Check if the app_user_id is a valid UUID (Supabase user ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUuid = uuidRegex.test(userId);

    if (!isValidUuid) {
      // If not a UUID, try to find user from aliases or subscriber attributes
      console.warn(`[Webhook] app_user_id ${userId} is not a valid UUID`);

      // Check subscriber attributes for supabase_user_id
      const supabaseUserIdAttr = event.subscriber_attributes?.["$supabaseUserId"];
      if (supabaseUserIdAttr && uuidRegex.test(supabaseUserIdAttr.value)) {
        userId = supabaseUserIdAttr.value;
        console.log(`[Webhook] Found Supabase user ID in attributes: ${userId}`);
      } else if (event.aliases && event.aliases.length > 0) {
        // Try to find a UUID in aliases
        const uuidAlias = event.aliases.find((alias) => uuidRegex.test(alias));
        if (uuidAlias) {
          userId = uuidAlias;
          console.log(`[Webhook] Found Supabase user ID in aliases: ${userId}`);
        }
      }

      // If still not a UUID, skip the event
      if (!uuidRegex.test(userId)) {
        console.error(`[Webhook] Could not find valid Supabase user ID for ${event.app_user_id}`);
        return new Response(
          JSON.stringify({ success: false, error: "Could not map to Supabase user" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Upsert subscription record
    const { data, error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          ...subscriptionData,
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error("[Webhook] Database error:", error);
      // Return 200 to prevent RevenueCat from retrying
      // Log error for manual investigation
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Webhook] Successfully processed ${event.type} for user ${userId}`);

    // Log webhook event for auditing
    try {
      await supabase.from("webhook_logs").insert({
        event_type: event.type,
        user_id: userId,
        payload: payload,
        processed_at: new Date().toISOString(),
      });
    } catch (logError) {
      // Non-fatal: just log the error
      console.error("[Webhook] Failed to log event:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_type: event.type,
        user_id: userId,
        status,
        is_active: isActive,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    // Return 200 to prevent endless retries
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
