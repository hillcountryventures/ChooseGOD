/**
 * Shared Subscription Verification Utilities
 *
 * Server-side subscription verification for edge functions.
 * Uses Supabase subscriptions table (synced via RevenueCat webhooks)
 * with fallback to RevenueCat REST API if needed.
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface SubscriptionStatus {
  isPremium: boolean;
  source: "database" | "revenuecat_api" | "client_claimed";
  expirationDate: string | null;
  status: string | null;
  verified: boolean;
}

/**
 * Verify user's premium status server-side
 *
 * Priority:
 * 1. Check Supabase subscriptions table (fastest, webhook-synced)
 * 2. Optionally call RevenueCat API for real-time verification
 * 3. Fall back to client-claimed status (least trusted)
 *
 * @param supabase - Supabase client with service role
 * @param userId - Supabase user ID
 * @param clientClaimedPremium - What the client claims (for comparison)
 * @returns Subscription status with verification info
 */
export async function verifySubscriptionStatus(
  supabase: SupabaseClient,
  userId: string,
  clientClaimedPremium: boolean = false
): Promise<SubscriptionStatus> {
  try {
    // Method 1: Check Supabase subscriptions table (webhook-synced)
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && subscription) {
      // Check if subscription is active
      const isActive = subscription.is_active === true;
      const withinExpiration =
        subscription.expiration_date &&
        new Date(subscription.expiration_date) > new Date();

      const isPremium = isActive || withinExpiration;

      // Log discrepancy if client claimed premium but server says no
      if (clientClaimedPremium && !isPremium) {
        console.warn(
          `[Subscription] Discrepancy detected: Client claims premium but DB says ${subscription.status}`
        );
      }

      return {
        isPremium,
        source: "database",
        expirationDate: subscription.expiration_date,
        status: subscription.status,
        verified: true,
      };
    }

    // Method 2: Use the is_user_premium database function
    const { data: isPremiumResult, error: funcError } = await supabase.rpc(
      "is_user_premium",
      { check_user_id: userId }
    );

    if (!funcError && isPremiumResult !== null) {
      return {
        isPremium: isPremiumResult,
        source: "database",
        expirationDate: null,
        status: isPremiumResult ? "active" : "inactive",
        verified: true,
      };
    }

    // Method 3: No subscription record found
    // This is normal for users who never subscribed
    if (clientClaimedPremium) {
      console.warn(
        `[Subscription] Client claims premium but no subscription record found for ${userId}`
      );
    }

    return {
      isPremium: false,
      source: "database",
      expirationDate: null,
      status: "no_record",
      verified: true,
    };
  } catch (error) {
    console.error("[Subscription] Verification error:", error);

    // On error, be conservative but don't break the app
    // Trust client for now but flag as unverified
    return {
      isPremium: clientClaimedPremium,
      source: "client_claimed",
      expirationDate: null,
      status: "verification_error",
      verified: false,
    };
  }
}

/**
 * Optional: Call RevenueCat REST API directly for real-time verification
 * Use sparingly - adds latency and API costs
 *
 * @param appUserId - RevenueCat app user ID (typically Supabase user ID)
 * @returns Premium status from RevenueCat
 */
export async function verifyWithRevenueCatAPI(
  appUserId: string
): Promise<SubscriptionStatus | null> {
  const apiKey = Deno.env.get("REVENUECAT_API_KEY");
  if (!apiKey) {
    console.warn("[Subscription] REVENUECAT_API_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`[Subscription] RevenueCat API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const entitlements = data.subscriber?.entitlements || {};
    const chooseGodPro = entitlements["ChooseGOD Pro"];

    if (chooseGodPro) {
      const expiresDate = chooseGodPro.expires_date;
      const isActive =
        !expiresDate || new Date(expiresDate) > new Date();

      return {
        isPremium: isActive,
        source: "revenuecat_api",
        expirationDate: expiresDate || null,
        status: isActive ? "active" : "expired",
        verified: true,
      };
    }

    return {
      isPremium: false,
      source: "revenuecat_api",
      expirationDate: null,
      status: "no_entitlement",
      verified: true,
    };
  } catch (error) {
    console.error("[Subscription] RevenueCat API call failed:", error);
    return null;
  }
}

/**
 * Log suspicious subscription activity for fraud detection
 */
export async function logSubscriptionAnomaly(
  supabase: SupabaseClient,
  userId: string,
  anomalyType: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from("subscription_anomalies").insert({
      user_id: userId,
      anomaly_type: anomalyType,
      details,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Non-fatal - just log
    console.error("[Subscription] Failed to log anomaly:", error);
  }
}
