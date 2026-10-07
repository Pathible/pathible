"use node";

import { createClerkClient } from "@clerk/backend";
import { v } from "convex/values";
import Stripe from "stripe";
import { Webhook } from "svix";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { type ActionCtx, action, internalAction } from "./_generated/server";
import { isExecutorPriceId, resolveTierFromPriceId } from "./shared/stripeConfig";

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe billing is not configured");
  return new Stripe(key);
}
function billingOrigin(origin: string): string {
  const url = new URL(origin);
  const configured = process.env.APP_URL;
  if (
    configured
      ? url.origin !== new URL(configured).origin
      : !["localhost", "127.0.0.1"].includes(url.hostname)
  ) {
    throw new Error("Billing return origin is not allowed; configure APP_URL");
  }
  return url.origin;
}
function objectId(value: string | { id: string } | null): string | undefined {
  return typeof value === "string" ? value : value?.id;
}
function statusOf(
  subscription: Stripe.Subscription,
): "active" | "inactive" | "cancelled" | "past_due" {
  switch (subscription.status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "inactive";
  }
}

export const createCheckout = action({
  args: {
    priceId: v.string(),
    mode: v.union(v.literal("subscription"), v.literal("payment")),
    origin: v.string(),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args): Promise<{ url: string }> => {
    const origin = billingOrigin(args.origin);
    const tier = resolveTierFromPriceId(args.priceId);
    if (args.mode === "payment" ? !isExecutorPriceId(args.priceId) : !tier || tier === "founders") {
      throw new Error("This price and payment mode are not available for purchase");
    }
    await ctx.runAction(api.stripeActions.reconcileLegacy, {});
    const account = await ctx.runQuery(api.stripe.getBillingAccount, {});
    if (args.mode === "subscription" && account.billingProvider === "clerk") {
      throw new Error("Manage your existing subscription through Clerk");
    }
    if (args.mode === "payment" && account.executorPurchased)
      throw new Error("Executor is already purchased");
    const stripe = stripeClient();
    let customerId = account.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create(
        {
          metadata: { householdId: account.householdId, clerkUserId: account.clerkUserId },
        },
        { idempotencyKey: `customer:${account.householdId}` },
      );
      customerId = customer.id;
      await ctx.runMutation(internal.stripe.linkStripeCustomer, {
        householdId: account.householdId,
        stripeCustomerId: customerId,
      });
    }
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted || customer.metadata.householdId !== account.householdId)
      throw new Error("Billing customer ownership requires verification");
    if (args.mode === "subscription") {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 100,
      });
      const existing = subscriptions.data.find(
        (sub) =>
          !["canceled", "incomplete_expired"].includes(sub.status) &&
          resolveTierFromPriceId(sub.items.data[0]?.price.id ?? ""),
      );
      if (existing) {
        const item = existing.items.data[0];
        const portal = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${origin}/select-plan?change=true`,
          flow_data: {
            type: "subscription_update_confirm",
            subscription_update_confirm: {
              subscription: existing.id,
              items: [{ id: item.id, price: args.priceId, quantity: item.quantity ?? 1 }],
            },
          },
        });
        return { url: portal.url };
      }
    }
    // Portal-only changes never create Checkout sessions or leave pending attempts.
    const { attemptId, createdAt } = await ctx.runMutation(internal.stripe.reserveCheckout, {
      householdId: account.householdId,
      mode: args.mode,
      priceId: args.priceId,
    });
    if (args.mode === "subscription" && account.stripeSubscriptionId) {
      const snapshotAt = Date.now();
      const previous = await stripe.subscriptions.retrieve(account.stripeSubscriptionId);
      const priceId = previous.items.data[0]?.price.id;
      if (priceId && resolveTierFromPriceId(priceId))
        await ctx.runMutation(internal.stripe.applySubscription, {
          eventId: `checkout-sync:${attemptId}`,
          snapshotAt,
          stripeCustomerId: customerId,
          stripeSubscriptionId: previous.id,
          priceId,
          status: statusOf(previous),
        });
    }
    const metadata = {
      householdId: account.householdId,
      clerkUserId: account.clerkUserId,
      billingAttemptId: attemptId,
      priceId: args.priceId,
    };
    const params: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_update: { address: "auto", name: "auto" },
      line_items: [{ price: args.priceId, quantity: 1 }],
      mode: args.mode,
      success_url: `${origin}/${args.mode === "payment" ? "estate" : "dashboard"}?checkout=success`,
      cancel_url: `${origin}/${args.mode === "payment" ? "for-executors" : "select-plan"}`,
      allow_promotion_codes: true,
      expires_at: Math.floor(createdAt / 1000) + 3600,
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
      metadata,
      ...(args.mode === "subscription"
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }),
    };
    // Paid checkout only: no free trial period is offered.
    const session = await stripe.checkout.sessions.create(params, {
      idempotencyKey: `checkout:${attemptId}`,
    });
    if (!session.url) throw new Error("Checkout did not return a URL");
    return { url: session.url };
  },
});

export const createPortal = action({
  args: { origin: v.string() },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args): Promise<{ url: string }> => {
    const origin = billingOrigin(args.origin);
    const account = await ctx.runQuery(api.stripe.getBillingAccount, {});
    if (account.billingProvider === "clerk")
      throw new Error("Manage your subscription through Clerk");
    if (!account.stripeCustomerId) throw new Error("No Stripe billing account exists");
    const stripe = stripeClient();
    const customer = await stripe.customers.retrieve(account.stripeCustomerId);
    if (customer.deleted || customer.metadata.householdId !== account.householdId)
      throw new Error("Billing customer ownership requires verification");
    const session = await stripe.billingPortal.sessions.create({
      customer: account.stripeCustomerId,
      return_url: `${origin}/select-plan?change=true`,
    });
    return { url: session.url };
  },
});

// The signed delivery selects an event; entitlement always comes from current Stripe state.
export const processEvent = internalAction({
  args: { eventId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const stripe = stripeClient();
    const event = await stripe.events.retrieve(args.eventId);
    async function syncSubscription(subscriptionId: string): Promise<void> {
      const snapshotAt = Date.now();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customerId = objectId(subscription.customer);
      const priceId = subscription.items.data[0]?.price.id;
      if (!customerId) return;
      await ctx.runMutation(internal.stripe.applySubscription, {
        eventId: event.id,
        snapshotAt,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        priceId: priceId ?? "",
        status: statusOf(subscription),
        billingAttemptId: subscription.metadata.billingAttemptId as
          | Id<"billingAttempts">
          | undefined,
      });
    }
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
          expand: ["line_items", "payment_intent.latest_charge"],
        });
        const subscriptionId = objectId(session.subscription);
        if (session.mode === "subscription" && subscriptionId) {
          await syncSubscription(subscriptionId);
          break;
        }
        if (session.mode !== "payment" || session.payment_status !== "paid") break;
        const intent = session.payment_intent;
        if (!intent || typeof intent === "string") throw new Error("Payment intent not expanded");
        const charge = intent.latest_charge;
        if (!charge || typeof charge === "string") throw new Error("Charge not expanded");
        const customerId = objectId(session.customer);
        const priceId = session.line_items?.data[0]?.price?.id;
        const householdId = session.metadata?.householdId;
        const attemptId = session.metadata?.billingAttemptId;
        if (!customerId || !priceId || !householdId || !attemptId || !isExecutorPriceId(priceId))
          break;
        await ctx.runMutation(internal.stripe.applyExecutorPayment, {
          eventId: event.id,
          householdId: householdId as Id<"households">,
          billingAttemptId: attemptId as Id<"billingAttempts">,
          stripeCustomerId: customerId,
          priceId,
          paymentIntentId: intent.id,
          chargeId: charge.id,
          paid: intent.status === "succeeded",
          fullyRefunded: charge.refunded,
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object.id);
        break;
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = await stripe.invoices.retrieve(event.data.object.id);
        const subscriptionId = objectId(invoice.parent?.subscription_details?.subscription ?? null);
        if (subscriptionId) await syncSubscription(subscriptionId);
        break;
      }
      case "charge.refunded": {
        const charge = await stripe.charges.retrieve(event.data.object.id);
        const customerId = objectId(charge.customer);
        const intentId = objectId(charge.payment_intent);
        if (customerId && intentId && charge.refunded) {
          await ctx.runMutation(internal.stripe.applyExecutorRefund, {
            eventId: event.id,
            stripeCustomerId: customerId,
            paymentIntentId: intentId,
            chargeId: charge.id,
            fullyRefunded: true,
          });
        }
        break;
      }
      // Failed delayed payments never fulfill access.
      default:
        break;
    }
    return null;
  },
});

export const reconcileLegacy = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const account = await ctx.runQuery(internal.stripe.getLegacyAccount, {});
    if (!account) return null;
    const key = process.env.CLERK_SECRET_KEY;
    if (!key) throw new Error("Legacy billing verification is not configured");
    const client = createClerkClient({ secretKey: key });
    const subscription = await client.billing.getUserBillingSubscription(account.clerkUserId);
    const paidItems = subscription.subscriptionItems.filter(
      (i) => i.plan && ["foundations", "heritage", "legacy", "founders"].includes(i.plan.slug),
    );
    if (paidItems.length === 0) {
      await ctx.runMutation(internal.stripe.completeCutover, { householdId: account.householdId });
      return null;
    }
    const item = paidItems.find(
      (i) =>
        (i.status === "active" ||
          (i.status === "canceled" && !!i.periodEnd && i.periodEnd > Date.now())) &&
        !!i.plan &&
        ["foundations", "heritage", "legacy", "founders"].includes(i.plan.slug),
    );
    const tier = (item ?? paidItems[0])?.plan?.slug as
      | "foundations"
      | "heritage"
      | "legacy"
      | "founders"
      | undefined;
    await ctx.runMutation(internal.auth.syncSubscriptionTier, {
      clerkUserId: account.clerkUserId,
      tier,
      status: item ? "active" : "inactive",
    });
    return null;
  },
});

export const finishClerkCutover = internalAction({
  args: { householdId: v.id("households"), approvedBy: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.stripe.getCutoverAccount, {
      householdId: args.householdId,
    });
    const key = process.env.CLERK_SECRET_KEY;
    if (!key) throw new Error("Clerk billing verification is not configured");
    const subscription = await createClerkClient({
      secretKey: key,
    }).billing.getUserBillingSubscription(account.clerkUserId);
    // Fail closed until the old paid lifecycle has fully ended; no automated cancellation.
    const remaining = subscription.subscriptionItems.some(
      (item) =>
        item.plan &&
        ["foundations", "heritage", "legacy", "founders"].includes(item.plan.slug) &&
        (item.status === "active" ||
          item.status === "upcoming" ||
          item.status === "past_due" ||
          (item.periodEnd && item.periodEnd > Date.now())),
    );
    if (remaining)
      throw new Error(
        "Clerk still has paid coverage or an outstanding lifecycle; do not start Stripe billing",
      );
    await ctx.runMutation(internal.stripe.completeCutover, args);
    return null;
  },
});

async function syncClerkBilling(ctx: ActionCtx, clerkUserId: string): Promise<void> {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error("Clerk billing verification is not configured");
  const subscription = await createClerkClient({
    secretKey: key,
  }).billing.getUserBillingSubscription(clerkUserId);
  const paidItems = subscription.subscriptionItems.filter(
    (item) =>
      item.plan && ["foundations", "heritage", "legacy", "founders"].includes(item.plan.slug),
  );
  const current = paidItems.find(
    (item) =>
      item.status === "active" ||
      (item.status === "canceled" && !!item.periodEnd && item.periodEnd > Date.now()),
  );
  const tier = (current ?? paidItems[0])?.plan?.slug as
    | "foundations"
    | "heritage"
    | "legacy"
    | "founders"
    | undefined;
  await ctx.runMutation(internal.auth.syncSubscriptionTier, {
    clerkUserId,
    tier,
    status: current
      ? "active"
      : paidItems.some((item) => item.status === "past_due")
        ? "past_due"
        : "inactive",
  });
}

export const processClerkWebhook = internalAction({
  args: {
    body: v.string(),
    svixId: v.string(),
    svixTimestamp: v.string(),
    svixSignature: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) throw new Error("Clerk webhook is not configured");
    let payload: unknown;
    try {
      new Webhook(secret).verify(args.body, {
        "svix-id": args.svixId,
        "svix-timestamp": args.svixTimestamp,
        "svix-signature": args.svixSignature,
      });
      payload = JSON.parse(args.body);
    } catch {
      return 400;
    }
    if (
      !payload ||
      typeof payload !== "object" ||
      !("type" in payload) ||
      typeof payload.type !== "string" ||
      !("data" in payload) ||
      !payload.data ||
      typeof payload.data !== "object"
    )
      return 400;
    if (payload.type !== "user.updated" && !payload.type.includes("subscription")) return 200;
    const data = payload.data;
    const payer =
      "payer" in data && data.payer && typeof data.payer === "object" ? data.payer : undefined;
    const userId =
      "user_id" in data && typeof data.user_id === "string"
        ? data.user_id
        : payer && "user_id" in payer && typeof payer.user_id === "string"
          ? payer.user_id
          : payload.type === "user.updated" && "id" in data && typeof data.id === "string"
            ? data.id
            : undefined;
    if (!userId) return 200; // Organization billing is not household billing.
    await syncClerkBilling(ctx, userId);
    return 200;
  },
});
