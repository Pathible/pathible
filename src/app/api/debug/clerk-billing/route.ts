import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Debug endpoint to fetch Clerk Billing configuration
 * GET /api/debug/clerk-billing
 *
 * Returns the actual plans and features configured in Clerk Dashboard.
 * Use this to verify your feature-access.ts matches Clerk's configuration.
 *
 * IMPORTANT: Remove this endpoint before production!
 */
export async function GET() {
  try {
    const client = await clerkClient();

    // Fetch plans from Clerk's billing API
    const plansResponse = await client.billing?.getPlanList?.();

    // Try to get subscription info for debugging
    let subscriptionInfo = null;
    try {
      // This may not be available depending on Clerk version
      // @ts-expect-error - billing API is in beta
      subscriptionInfo = await client.billing?.getSubscriptionList?.();
    } catch {
      // Subscription list may not be available
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      plans: plansResponse?.data ?? plansResponse ?? null,
      subscriptions: subscriptionInfo?.data ?? subscriptionInfo ?? null,
      message: "Check the plans array for features configured in Clerk Dashboard",
    });
  } catch (error) {
    console.error("[clerk-billing-debug] Error fetching billing data:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Make sure Clerk Billing is enabled and you have the correct API keys",
      },
      { status: 500 },
    );
  }
}
