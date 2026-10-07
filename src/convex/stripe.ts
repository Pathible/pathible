import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { requireAuth, requireHouseholdAdmin } from "./auth";
import { subscriptionStatusValidator } from "./shared/commonValidators";
import { isExecutorPriceId, resolveTierFromPriceId } from "./shared/stripeConfig";

const billingAccountValidator = v.object({
  householdId: v.id("households"),
  clerkUserId: v.string(),
  stripeCustomerId: v.optional(v.string()),
  stripeSubscriptionId: v.optional(v.string()),
  billingProvider: v.optional(v.union(v.literal("clerk"), v.literal("stripe"))),
  subscriptionStatus: subscriptionStatusValidator,
  executorPurchased: v.boolean(),
});

// Billing identity is household-scoped. Viewers and executors cannot manage it.
export const getBillingAccount = query({
  args: {},
  returns: billingAccountValidator,
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();
    const membership = memberships.find((m) => m.status === "active");
    if (!membership || (membership.role !== "owner" && membership.role !== "steward"))
      throw new Error("Only household owners and stewards may manage billing");
    const household = await ctx.db.get(membership.householdId);
    if (!household) throw new Error("Household not found");
    return {
      householdId: household._id,
      clerkUserId: profile.userId,
      stripeCustomerId: household.stripeCustomerId,
      stripeSubscriptionId: household.stripeSubscriptionId,
      billingProvider: household.billingProvider,
      subscriptionStatus: household.subscriptionStatus,
      executorPurchased: household.executorPurchased === true,
    };
  },
});

export const reserveCheckout = internalMutation({
  args: {
    householdId: v.id("households"),
    mode: v.union(v.literal("subscription"), v.literal("payment")),
    priceId: v.string(),
  },
  returns: v.object({ attemptId: v.id("billingAttempts"), createdAt: v.number() }),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAdmin(ctx, args.householdId);
    const previous = await ctx.db
      .query("billingAttempts")
      .withIndex("by_household_and_mode", (q) =>
        q.eq("householdId", args.householdId).eq("mode", args.mode),
      )
      .order("desc")
      .first();
    if (previous && !previous.completed && previous.createdAt > Date.now() - 60 * 60 * 1000) {
      if (previous.priceId !== args.priceId)
        throw new Error(
          "Another checkout is in progress. Complete it or retry after the checkout expires.",
        );
      return { attemptId: previous._id, createdAt: previous.createdAt };
    }
    const createdAt = Date.now();
    const attemptId = await ctx.db.insert("billingAttempts", {
      ...args,
      clerkUserId: profile.userId,
      createdAt,
      completed: false,
    });
    return { attemptId, createdAt };
  },
});

export const linkStripeCustomer = internalMutation({
  args: { householdId: v.id("households"), stripeCustomerId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const household = await ctx.db.get(args.householdId);
    if (!household) throw new Error("Household not found");
    if (household.stripeCustomerId && household.stripeCustomerId !== args.stripeCustomerId) {
      throw new Error("Household already has another billing customer");
    }
    const existing = await ctx.db
      .query("households")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .unique();
    if (existing && existing._id !== household._id)
      throw new Error("Customer already belongs to another household");
    await ctx.db.patch(household._id, {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Each fulfillment and event receipt commit in one transaction.
export const applySubscription = internalMutation({
  args: {
    eventId: v.string(),
    snapshotAt: v.number(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    priceId: v.string(),
    status: subscriptionStatusValidator,
    billingAttemptId: v.optional(v.id("billingAttempts")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (
      await ctx.db
        .query("stripeEvents")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .unique()
    )
      return null;
    const household = await ctx.db
      .query("households")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .unique();
    if (!household) throw new Error("Customer mapping not ready; retry event");
    const tier = resolveTierFromPriceId(args.priceId);
    if (!tier) {
      if (
        household.stripeSubscriptionId === args.stripeSubscriptionId &&
        household.billingProvider === "stripe"
      ) {
        await ctx.db.patch(household._id, {
          subscriptionStatus: "inactive",
          updatedAt: Date.now(),
        });
        await ctx.db.insert("stripeEvents", { eventId: args.eventId, processedAt: Date.now() });
      }
      return null;
    }
    if (household.billingProvider === "clerk") return null;
    let replacementAuthorized = false;
    if (args.billingAttemptId) {
      const attempt = await ctx.db.get(args.billingAttemptId);
      if (!attempt || attempt.householdId !== household._id || attempt.mode !== "subscription")
        throw new Error("Invalid checkout identity");
      replacementAuthorized = !attempt.completed && household.subscriptionStatus !== "active";
      await ctx.db.patch(attempt._id, { completed: true });
    }
    if (
      household.stripeSubscriptionId &&
      household.stripeSubscriptionId !== args.stripeSubscriptionId &&
      !replacementAuthorized
    )
      return null;
    if (
      household.stripeSnapshotAt !== undefined &&
      args.snapshotAt < household.stripeSnapshotAt &&
      !replacementAuthorized
    )
      return null;
    await ctx.db.patch(household._id, {
      subscriptionTier: tier,
      subscriptionStatus: args.status,
      billingProvider: "stripe",
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeSnapshotAt: args.snapshotAt,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("stripeEvents", { eventId: args.eventId, processedAt: Date.now() });
    return null;
  },
});

export const applyExecutorPayment = internalMutation({
  args: {
    eventId: v.string(),
    householdId: v.id("households"),
    stripeCustomerId: v.string(),
    billingAttemptId: v.id("billingAttempts"),
    priceId: v.string(),
    paymentIntentId: v.string(),
    chargeId: v.string(),
    paid: v.boolean(),
    fullyRefunded: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (
      await ctx.db
        .query("stripeEvents")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .unique()
    )
      return null;
    const attempt = await ctx.db.get(args.billingAttemptId);
    const household = await ctx.db.get(args.householdId);
    if (
      !household ||
      !attempt ||
      attempt.householdId !== household._id ||
      attempt.mode !== "payment" ||
      household.stripeCustomerId !== args.stripeCustomerId
    )
      throw new Error("Executor billing identity mismatch");
    if (!isExecutorPriceId(args.priceId) || !args.paid) return null;
    if (
      household.executorPurchasedAt !== undefined &&
      household.executorPurchasedAt > attempt.createdAt
    )
      return null;
    // A replay of an older purchase must not replace the identity of a newer purchase.
    if (attempt.completed && household.executorPaymentIntentId !== args.paymentIntentId)
      return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", attempt.clerkUserId))
      .unique();
    if (!profile) throw new Error("Purchaser profile not ready; retry event");
    const refund = await ctx.db
      .query("stripeRefunds")
      .withIndex("by_paymentIntentId", (q) => q.eq("paymentIntentId", args.paymentIntentId))
      .unique();
    await ctx.db.patch(household._id, {
      executorPurchased: !args.fullyRefunded && !refund,
      executorPurchasedBy: profile._id,
      executorPurchasedAt: attempt.createdAt,
      executorPaymentIntentId: args.paymentIntentId,
      executorChargeId: args.chargeId,
      updatedAt: Date.now(),
    });
    await ctx.db.patch(attempt._id, { completed: true });
    await ctx.db.insert("stripeEvents", { eventId: args.eventId, processedAt: Date.now() });
    return null;
  },
});

export const applyExecutorRefund = internalMutation({
  args: {
    eventId: v.string(),
    stripeCustomerId: v.string(),
    paymentIntentId: v.string(),
    chargeId: v.string(),
    fullyRefunded: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (
      await ctx.db
        .query("stripeEvents")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .unique()
    )
      return null;
    const household = await ctx.db
      .query("households")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .unique();
    if (!household) throw new Error("Customer mapping not ready; retry event");
    if (
      args.fullyRefunded &&
      !(await ctx.db
        .query("stripeRefunds")
        .withIndex("by_paymentIntentId", (q) => q.eq("paymentIntentId", args.paymentIntentId))
        .unique())
    ) {
      await ctx.db.insert("stripeRefunds", {
        paymentIntentId: args.paymentIntentId,
        chargeId: args.chargeId,
      });
    }
    if (
      args.fullyRefunded &&
      household.executorPaymentIntentId === args.paymentIntentId &&
      household.executorChargeId === args.chargeId
    ) {
      await ctx.db.patch(household._id, { executorPurchased: false, updatedAt: Date.now() });
    }
    await ctx.db.insert("stripeEvents", { eventId: args.eventId, processedAt: Date.now() });
    return null;
  },
});

export const getLegacyAccount = internalQuery({
  args: {},
  returns: v.union(
    v.object({ householdId: v.id("households"), clerkUserId: v.string() }),
    v.null(),
  ),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();
    const membership = memberships.find((m) => m.status === "active");
    if (!membership) return null;
    const household = await ctx.db.get(membership.householdId);
    if (!household || household.billingProvider || household.stripeSubscriptionId) return null;
    const contact = await ctx.db.get(household.primaryContactId);
    return contact ? { householdId: household._id, clerkUserId: contact.userId } : null;
  },
});

export const completeCutover = internalMutation({
  args: { householdId: v.id("households"), approvedBy: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const household = await ctx.db.get(args.householdId);
    if (!household || household.stripeSubscriptionId)
      throw new Error("Household cannot be cut over");
    if (args.approvedBy) {
      const role = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", args.approvedBy ?? ""))
        .unique();
      if (role?.role !== "admin")
        throw new Error("An administrator must approve a paid-account cutover");
    } else if (household.billingProvider) {
      throw new Error("Existing provider requires explicit administrator approval");
    }
    await ctx.db.patch(household._id, {
      billingProvider: "stripe",
      subscriptionStatus: "inactive",
      updatedAt: Date.now(),
    });
    return null;
  },
});
export const getCutoverAccount = internalQuery({
  args: { householdId: v.id("households") },
  returns: v.object({ clerkUserId: v.string() }),
  handler: async (ctx, args) => {
    const household = await ctx.db.get(args.householdId);
    if (!household) throw new Error("Household not found");
    const profile = await ctx.db.get(household.primaryContactId);
    if (!profile) throw new Error("Owner profile not found");
    return { clerkUserId: profile.userId };
  },
});
