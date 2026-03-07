import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { resolveTierFromPriceId, STRIPE_EVENTS } from "./shared/stripeConfig";

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

// ============================================================================
// STRIPE WEBHOOK
// ============================================================================

/**
 * Stripe Webhook Handler
 *
 * Receives webhooks from Stripe and syncs subscription/payment data to Convex.
 * Runs alongside the Clerk webhook during the migration period.
 *
 * Setup in Stripe Dashboard:
 * - URL: https://[your-convex-deployment].convex.site/stripe-webhook
 * - Events: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted, invoice.paid, invoice.payment_failed,
 *           charge.refunded
 */
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error("[Stripe Webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
      return new Response("Webhook not configured", { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      console.error("[Stripe Webhook] Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    const body = await request.text();

    // Verify webhook signature
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("[Stripe Webhook] Signature verification failed");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.type as string;

    console.log(`[Stripe Webhook] Processing event: ${eventType} (${event.id})`);

    try {
      switch (eventType) {
        case STRIPE_EVENTS.CHECKOUT_COMPLETED: {
          const session = event.data.object;
          const metadata = session.metadata || {};
          const householdId = metadata.householdId as Id<"households"> | undefined;
          const clerkUserId = metadata.clerkUserId as string | undefined;
          const stripeCustomerId = session.customer as string | undefined;

          if (!householdId || !clerkUserId || !stripeCustomerId) {
            console.error("[Stripe Webhook] Missing metadata in checkout session:", {
              householdId,
              clerkUserId,
              stripeCustomerId,
            });
            break;
          }

          // Get the price ID from line items
          const lineItems = session.line_items?.data || [];
          const priceId = lineItems[0]?.price?.id || (metadata.priceId as string | undefined) || "";

          const mode = session.mode === "payment" ? "payment" : "subscription";

          await ctx.runMutation(internal.stripe.handleCheckoutCompleted, {
            stripeCustomerId,
            householdId,
            clerkUserId,
            priceId,
            mode: mode as "subscription" | "payment",
            stripeSubscriptionId: session.subscription as string | undefined,
          });
          break;
        }

        case STRIPE_EVENTS.SUBSCRIPTION_UPDATED: {
          const subscription = event.data.object;
          const stripeCustomerId = subscription.customer as string;
          const priceId = subscription.items?.data?.[0]?.price?.id as string | undefined;

          let tier: "foundations" | "heritage" | "legacy" | "founders" | undefined;
          if (priceId) {
            tier = resolveTierFromPriceId(priceId) ?? undefined;
          }

          let status: "active" | "inactive" | "cancelled" | "past_due" | undefined;
          const stripeStatus = subscription.status as string;
          if (stripeStatus === "active" || stripeStatus === "trialing") {
            status = "active";
          } else if (stripeStatus === "past_due") {
            status = "past_due";
          } else if (stripeStatus === "canceled" || stripeStatus === "unpaid") {
            status = "cancelled";
          } else if (stripeStatus === "incomplete" || stripeStatus === "paused") {
            status = "inactive";
          }

          if (tier || status) {
            await ctx.runMutation(internal.stripe.syncSubscriptionFromStripe, {
              stripeCustomerId,
              stripeSubscriptionId: subscription.id as string,
              tier,
              status,
            });
          }
          break;
        }

        case STRIPE_EVENTS.SUBSCRIPTION_DELETED: {
          const subscription = event.data.object;
          const stripeCustomerId = subscription.customer as string;

          await ctx.runMutation(internal.stripe.syncSubscriptionFromStripe, {
            stripeCustomerId,
            status: "cancelled",
          });
          break;
        }

        case STRIPE_EVENTS.INVOICE_PAID: {
          const invoice = event.data.object;
          const stripeCustomerId = invoice.customer as string;

          // Only process subscription invoices (not one-time)
          if (invoice.subscription) {
            await ctx.runMutation(internal.stripe.syncSubscriptionFromStripe, {
              stripeCustomerId,
              status: "active",
            });
          }
          break;
        }

        case STRIPE_EVENTS.INVOICE_PAYMENT_FAILED: {
          const invoice = event.data.object;
          const stripeCustomerId = invoice.customer as string;

          if (invoice.subscription) {
            await ctx.runMutation(internal.stripe.syncSubscriptionFromStripe, {
              stripeCustomerId,
              status: "past_due",
            });
          }
          break;
        }

        case STRIPE_EVENTS.CHARGE_REFUNDED: {
          const charge = event.data.object;
          const stripeCustomerId = charge.customer as string;

          // Check if this was an executor purchase refund
          const invoiceId = charge.invoice as string | null;
          if (!invoiceId) {
            // No invoice = one-time payment = executor purchase
            await ctx.runMutation(internal.stripe.revokeExecutorAccess, {
              stripeCustomerId,
            });
          }
          // Subscription refunds are handled by subscription.deleted event
          break;
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      console.error(`[Stripe Webhook] Error processing ${eventType}:`, error);
      return new Response("Webhook handler error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  }),
});

/**
 * Verify Stripe webhook signature using HMAC-SHA256.
 *
 * Stripe signature header format: t=<timestamp>,v1=<signature>[,v1=<signature>...]
 * Signed payload: <timestamp>.<body>
 */
async function verifyStripeSignature(
  body: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  try {
    // Parse the signature header
    const parts = signatureHeader.split(",");
    let timestamp = "";
    const signatures: string[] = [];

    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "t") {
        timestamp = value;
      } else if (key === "v1") {
        signatures.push(value);
      }
    }

    if (!timestamp || signatures.length === 0) {
      console.error("[Stripe Webhook] Invalid signature header format");
      return false;
    }

    // Check timestamp tolerance (5 minutes)
    const ts = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - ts) > 300) {
      console.error("[Stripe Webhook] Timestamp too old or in future");
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${body}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Compare against provided signatures
    return signatures.some((sig) => sig === expectedSignature);
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification error:", error);
    return false;
  }
}

export default http;
