import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Valid subscription tiers from Clerk Billing
const VALID_TIERS = ["foundations", "heritage", "legacy", "founders"] as const;
type SubscriptionTier = (typeof VALID_TIERS)[number];

// Valid subscription statuses
const VALID_STATUSES = ["active", "inactive", "cancelled", "past_due"] as const;
type SubscriptionStatus = (typeof VALID_STATUSES)[number];

/**
 * Clerk Webhook Handler (Convex HTTP Action)
 *
 * This endpoint receives webhooks directly from Clerk and verifies the signature.
 * Syncs subscription tier changes from Clerk Billing to the Convex household.
 *
 * SECURITY: This is an httpAction, not a mutation, so it can only be called
 * via HTTP requests to the Convex deployment URL. The webhook signature
 * verification ensures only authentic Clerk webhooks are processed.
 *
 * Setup in Clerk Dashboard:
 * - URL: https://[your-convex-deployment].convex.site/clerk-webhook
 * - Events: user.updated, subscription.*
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Clerk Webhook] CLERK_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get svix headers for verification
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("[Clerk Webhook] Missing svix headers");
      return new Response("Missing svix headers", { status: 400 });
    }

    // Get the raw body
    const body = await request.text();

    // Verify the webhook signature using svix
    // We use a simple HMAC verification approach
    const isValid = await verifyWebhookSignature(
      body,
      svixId,
      svixTimestamp,
      svixSignature,
      webhookSecret,
    );

    if (!isValid) {
      console.error("[Clerk Webhook] Signature verification failed");
      return new Response("Webhook verification failed", { status: 400 });
    }

    // Parse the verified payload
    const payload = JSON.parse(body);
    const eventType = payload.type as string;

    // Handle subscription events - sync tier and status to Convex household
    if (
      eventType === "user.updated" ||
      eventType.startsWith("subscription.") ||
      eventType.includes("subscription")
    ) {
      const data = payload.data as Record<string, unknown>;
      const userId = data.id as string | undefined;

      // Extract subscription/plan info from the webhook payload
      // Clerk Billing sends plan info in different formats depending on the event
      let tier: SubscriptionTier | null = null;
      let status: SubscriptionStatus | null = null;

      // Check for plan in various locations in the payload
      // subscription.created/updated events have plan info in data.plan or data.subscription.plan
      const planName =
        (data.plan as string | undefined) ||
        ((data.subscription as Record<string, unknown> | undefined)?.plan as string | undefined) ||
        // user.updated might have it in public_metadata or private_metadata
        ((data.public_metadata as Record<string, unknown> | undefined)?.subscription_tier as
          | string
          | undefined);

      if (planName && VALID_TIERS.includes(planName as SubscriptionTier)) {
        tier = planName as SubscriptionTier;
      }

      // Extract subscription status from the webhook payload
      // Handle different event types for status determination
      if (eventType === "subscription.cancelled" || eventType === "subscription.deleted") {
        status = "cancelled";
      } else if (eventType === "subscription.created" || eventType === "subscription.updated") {
        // Check for status in subscription data
        const subscriptionStatus =
          (data.status as string | undefined) ||
          ((data.subscription as Record<string, unknown> | undefined)?.status as
            | string
            | undefined);

        if (subscriptionStatus === "active") {
          status = "active";
        } else if (subscriptionStatus === "past_due" || subscriptionStatus === "unpaid") {
          status = "past_due";
        } else if (subscriptionStatus === "canceled" || subscriptionStatus === "cancelled") {
          status = "cancelled";
        } else if (subscriptionStatus === "inactive" || subscriptionStatus === "paused") {
          status = "inactive";
        }
      } else if (eventType === "user.updated") {
        // user.updated might have status in public_metadata
        const metadataStatus = (data.public_metadata as Record<string, unknown> | undefined)
          ?.subscription_status as string | undefined;

        if (metadataStatus && VALID_STATUSES.includes(metadataStatus as SubscriptionStatus)) {
          status = metadataStatus as SubscriptionStatus;
        }
      }

      // If we have a userId and either tier or status, sync to Convex
      if (userId && (tier || status)) {
        try {
          await ctx.runMutation(internal.auth.syncSubscriptionTier, {
            clerkUserId: userId,
            tier: tier ?? undefined,
            status: status ?? undefined,
          });
        } catch {
          // Don't fail the webhook - continue processing
        }
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

/**
 * Verify Svix webhook signature
 *
 * Svix uses a specific signature format: v1,<timestamp_signature>
 * The signature is HMAC-SHA256 of: <svix-id>.<svix-timestamp>.<body>
 */
async function verifyWebhookSignature(
  body: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): Promise<boolean> {
  try {
    // Check timestamp is recent (within 5 minutes)
    const timestamp = parseInt(svixTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      console.error("[Clerk Webhook] Timestamp too old or in future");
      return false;
    }

    // Extract the secret key (remove "whsec_" prefix if present)
    const secretKey = secret.startsWith("whsec_") ? secret.slice(6) : secret;
    const secretBytes = base64ToUint8Array(secretKey);

    // Create the signed payload
    const signedPayload = `${svixId}.${svixTimestamp}.${body}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signedPayload);

    // Import the key for HMAC
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes.buffer as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    // Generate the expected signature
    const signatureBytes = await crypto.subtle.sign("HMAC", key, data);
    const expectedSignature = uint8ArrayToBase64(new Uint8Array(signatureBytes));

    // Parse the provided signatures (format: "v1,<sig1> v1,<sig2>")
    const signatures = svixSignature.split(" ");
    for (const sig of signatures) {
      const [version, providedSig] = sig.split(",");
      if (version === "v1" && providedSig === expectedSignature) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("[Clerk Webhook] Signature verification error:", error);
    return false;
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  // Convert base64url to standard base64 (Svix uses base64url encoding)
  const standardBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
  const binaryString = atob(standardBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default http;
