import type { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { internal } from "@/convex/_generated/api";

/**
 * Clerk Webhook Handler
 *
 * This webhook syncs subscription data from Clerk to Convex.
 * It's OPTIONAL for local development - the has() method works without it.
 *
 * ## Local Development
 *
 * For local testing, you have two options:
 *
 * 1. **Skip webhook (Recommended for quick testing)**
 *    - Clerk's `has({ plan: '...' })` works immediately without webhooks
 *    - Subscription gating works out of the box
 *    - Convex data won't be synced (household.subscriptionTier won't update)
 *
 * 2. **Use ngrok for full webhook testing**
 *    ```bash
 *    # Install ngrok: https://ngrok.com/download
 *    ngrok http 3000
 *
 *    # Copy the https URL (e.g., https://abc123.ngrok.io)
 *    # Add webhook in Clerk Dashboard:
 *    # URL: https://abc123.ngrok.io/api/webhooks/clerk
 *    # Events: user.subscription.created, user.subscription.updated
 *    ```
 *
 * ## Production Setup
 *
 * 1. Add webhook in Clerk Dashboard:
 *    - URL: https://yourdomain.com/api/webhooks/clerk
 *    - Events: user.subscription.created, user.subscription.updated
 *
 * 2. Set environment variable:
 *    - CLERK_WEBHOOK_SECRET=whsec_xxxxx (from Clerk Dashboard)
 *
 * ## What This Webhook Does
 *
 * When a user subscribes or changes their plan:
 * 1. Clerk sends a webhook event
 * 2. We verify the signature (security)
 * 3. We sync the subscription data to Convex
 * 4. household.subscriptionTier and subscriptionStatus are updated
 *
 * This sync is for convenience - the source of truth is always Clerk's has() method.
 */

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is required");
}
const convex = new ConvexHttpClient(convexUrl);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // Always require webhook secret - no bypass for any environment
  if (!WEBHOOK_SECRET) {
    console.error("[Clerk Webhook] CLERK_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("[Clerk Webhook] Missing svix headers");
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[Clerk Webhook] Verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Process the event
  await processWebhookEvent(evt);

  return new Response("OK", { status: 200 });
}

/**
 * Process a verified webhook event
 */
async function processWebhookEvent(evt: WebhookEvent) {
  const eventType = evt.type;
  console.log(`[Clerk Webhook] Processing event: ${eventType}`);

  // Handle subscription events
  // Note: Clerk Billing is in beta - event types may change
  if (
    eventType === "user.updated" ||
    eventType.startsWith("subscription.") ||
    eventType.includes("subscription")
  ) {
    try {
      // Extract subscription data from the event
      // The exact structure depends on Clerk's event format
      const data = evt.data as unknown as Record<string, unknown>;

      // For user.updated events, check if subscription data is present
      const userId = data.id as string | undefined;
      const publicMetadata = data.public_metadata as Record<string, unknown> | undefined;

      if (userId && publicMetadata) {
        // Sync to Convex using internal mutation (not callable externally)
        await convex.mutation(internal.subscriptions.syncFromClerk, {
          clerkUserId: userId,
          planId: (publicMetadata.plan as string) || "unknown",
          status: (publicMetadata.subscription_status as string) || "active",
        });

        console.log(`[Clerk Webhook] Synced subscription for user: ${userId}`);
      }
    } catch (error) {
      console.error("[Clerk Webhook] Error syncing subscription:", error);
      // Don't throw - we want to return 200 to prevent retries for non-critical sync
    }
  }

  // Log unhandled event types for debugging
  if (!eventType.includes("subscription") && eventType !== "user.updated") {
    console.log(`[Clerk Webhook] Unhandled event type: ${eventType}`);
  }
}
