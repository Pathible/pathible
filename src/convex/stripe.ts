import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { trackAnalytics } from "./shared/analyticsHelpers";
import { resolveTierFromPriceId } from "./shared/stripeConfig";
import { type SubscriptionTier, TIER_LEVELS } from "./shared/subscriptionTiers";

const subscriptionTierValidator = v.union(
  v.literal("foundations"),
  v.literal("heritage"),
  v.literal("legacy"),
  v.literal("founders"),
);

const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("cancelled"),
  v.literal("past_due"),
);

/**
 * Link a Stripe Customer ID to a household.
 * Called on first checkout when the Stripe customer is created.
 */
export const linkStripeCustomer = internalMutation({
  args: {
    householdId: v.id("households"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      console.error("[Stripe] Household not found:", args.householdId);
      return null;
    }

    await ctx.db.patch(args.householdId, {
      stripeCustomerId: args.stripeCustomerId,
      ...(args.stripeSubscriptionId && {
        stripeSubscriptionId: args.stripeSubscriptionId,
      }),
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Sync subscription tier and status from Stripe webhook events.
 * Mirrors the existing syncSubscriptionTier but looks up by stripeCustomerId.
 */
export const syncSubscriptionFromStripe = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    tier: v.optional(subscriptionTierValidator),
    status: v.optional(subscriptionStatusValidator),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    householdId: v.optional(v.id("households")),
  }),
  handler: async (ctx, args) => {
    if (!args.tier && !args.status) {
      return {
        success: false,
        message: "No tier or status provided",
        householdId: undefined,
      };
    }

    // Look up household by Stripe Customer ID
    const household = await ctx.db
      .query("households")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();

    if (!household) {
      return {
        success: false,
        message: `Household not found for Stripe customer: ${args.stripeCustomerId}`,
        householdId: undefined,
      };
    }

    const patch: {
      subscriptionTier?: SubscriptionTier;
      subscriptionStatus?: "active" | "inactive" | "cancelled" | "past_due";
      stripeSubscriptionId?: string;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.tier) {
      patch.subscriptionTier = args.tier;
    }
    if (args.status) {
      patch.subscriptionStatus = args.status;
    }
    if (args.stripeSubscriptionId) {
      patch.stripeSubscriptionId = args.stripeSubscriptionId;
    }

    const previousTier = household.subscriptionTier;
    const previousStatus = household.subscriptionStatus;

    await ctx.db.patch(household._id, patch);

    // Analytics
    const primaryContact = await ctx.db.get(household.primaryContactId);
    const clerkUserId = primaryContact?.userId;

    if (clerkUserId) {
      if (args.tier && args.tier !== previousTier) {
        await trackAnalytics(ctx, clerkUserId, "subscription_tier_changed", {
          household_id: household._id,
          previous_tier: previousTier,
          new_tier: args.tier,
          is_upgrade: TIER_LEVELS[args.tier] > TIER_LEVELS[previousTier],
          source: "stripe",
        });
      }

      if (args.status && args.status !== previousStatus) {
        await trackAnalytics(ctx, clerkUserId, "subscription_status_changed", {
          household_id: household._id,
          previous_status: previousStatus,
          new_status: args.status,
          source: "stripe",
        });
      }
    }

    return {
      success: true,
      message: "Subscription updated from Stripe",
      householdId: household._id,
    };
  },
});

/**
 * Mark executor as purchased for a household.
 * Called when a one-time Stripe payment completes for the Executor product.
 */
export const markExecutorPurchased = internalMutation({
  args: {
    householdId: v.id("households"),
    purchasedBy: v.id("profiles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      console.error("[Stripe] Household not found for executor purchase:", args.householdId);
      return null;
    }

    await ctx.db.patch(args.householdId, {
      executorPurchased: true,
      executorPurchasedAt: Date.now(),
      executorPurchasedBy: args.purchasedBy,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Revoke executor access (e.g., on refund).
 */
export const revokeExecutorAccess = internalMutation({
  args: {
    stripeCustomerId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const household = await ctx.db
      .query("households")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();

    if (!household) {
      console.error("[Stripe] Household not found for executor revocation:", args.stripeCustomerId);
      return null;
    }

    await ctx.db.patch(household._id, {
      executorPurchased: false,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Handle initial checkout completion.
 * Links Stripe customer, sets tier/status, and handles executor purchases.
 */
export const handleCheckoutCompleted = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    householdId: v.id("households"),
    clerkUserId: v.string(),
    priceId: v.string(),
    mode: v.union(v.literal("subscription"), v.literal("payment")),
    stripeSubscriptionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      console.error("[Stripe] Household not found:", args.householdId);
      return null;
    }

    // Link Stripe customer to household
    const patch: Record<string, unknown> = {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    };

    if (args.mode === "subscription") {
      // Planning subscription
      const tier = resolveTierFromPriceId(args.priceId);
      if (tier) {
        patch.subscriptionTier = tier;
        patch.subscriptionStatus = "active";
      }
      if (args.stripeSubscriptionId) {
        patch.stripeSubscriptionId = args.stripeSubscriptionId;
      }
    } else {
      // One-time executor purchase
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", args.clerkUserId))
        .first();

      if (profile) {
        patch.executorPurchased = true;
        patch.executorPurchasedAt = Date.now();
        patch.executorPurchasedBy = profile._id;
      }
    }

    await ctx.db.patch(args.householdId, patch);

    // Analytics
    await trackAnalytics(ctx, args.clerkUserId, "checkout_completed", {
      household_id: args.householdId,
      mode: args.mode,
      price_id: args.priceId,
      source: "stripe",
    });

    return null;
  },
});
