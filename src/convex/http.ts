import { httpRouter } from "convex/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

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

    try {
      const status = await ctx.runAction(internal.stripeActions.processClerkWebhook, {
        body,
        svixId,
        svixTimestamp,
        svixSignature,
      });
      return new Response(status === 200 ? "OK" : "Invalid webhook", { status });
    } catch (error) {
      console.error("[Clerk Webhook] Reconciliation failed", error);
      return new Response("Retry event", { status: 500 });
    }
  }),
});

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
    const key = process.env.STRIPE_SECRET_KEY;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get("stripe-signature");
    if (!key || !secret) return new Response("Webhook not configured", { status: 500 });
    if (!signature) return new Response("Missing signature", { status: 400 });
    const stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        await request.text(),
        signature,
        secret,
        300,
        Stripe.createSubtleCryptoProvider(),
      );
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }
    try {
      await ctx.runAction(internal.stripeActions.processEvent, { eventId: event.id });
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("[Stripe Webhook] Reconciliation failed", event.id, error);
      return new Response("Retry event", { status: 500 });
    }
  }),
});

export default http;
