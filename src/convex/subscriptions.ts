import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./auth";

/**
 * Subscriptions Module
 *
 * Handles syncing subscription data from Clerk to Convex.
 *
 * IMPORTANT: Clerk is the source of truth for subscriptions.
 * This module mirrors that data in Convex for convenience queries.
 *
 * For access control, always use Clerk's has() method:
 * - Server: `const { has } = await auth(); has({ plan: 'foundations' })`
 * - Client: `const { has } = useAuth(); has({ plan: 'foundations' })`
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the current user's subscription info from Convex
 * Note: This is a mirror of Clerk data. Use Clerk's has() for access control.
 */
export const getCurrentSubscription = query({
  args: {},
  returns: v.union(
    v.object({
      tier: v.union(v.literal("foundations"), v.literal("heritage"), v.literal("legacy")),
      status: v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("cancelled"),
        v.literal("past_due"),
      ),
      householdId: v.id("households"),
      householdName: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const authResult = await requireAuth(ctx);
    if (!authResult) return null;

    const { profile } = authResult;

    // Get user's household
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    if (!membership) return null;

    const household = await ctx.db.get(membership.householdId);
    if (!household) return null;

    return {
      tier: household.subscriptionTier,
      status: household.subscriptionStatus,
      householdId: household._id,
      householdName: household.name,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Sync subscription data from Clerk webhook
 *
 * Called by the Clerk webhook handler when subscription events occur.
 * Updates the household's subscription tier and status.
 *
 * Note: This is for data mirroring only. Access control uses Clerk's has() method.
 */
export const syncFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    planId: v.string(),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log(`[Subscriptions] Syncing from Clerk: ${args.clerkUserId}, plan: ${args.planId}`);

    // Find profile by Clerk user ID
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.clerkUserId))
      .unique();

    if (!profile) {
      console.warn(`[Subscriptions] Profile not found for Clerk user: ${args.clerkUserId}`);
      return null;
    }

    // Find household membership
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    if (!membership) {
      console.warn(`[Subscriptions] No household for profile: ${profile._id}`);
      return null;
    }

    // Map Clerk plan ID to our tier names
    // Adjust these mappings based on your Clerk plan slugs
    const tierMap: Record<string, "foundations" | "heritage" | "legacy"> = {
      foundations: "foundations",
      heritage: "heritage",
      legacy: "legacy",
      // Add any Clerk-specific plan IDs here
      plan_foundations: "foundations",
      plan_heritage: "heritage",
      plan_legacy: "legacy",
    };

    const tier = tierMap[args.planId.toLowerCase()] || "foundations";

    // Map subscription status
    const statusMap: Record<string, "active" | "inactive" | "cancelled" | "past_due"> = {
      active: "active",
      canceled: "cancelled",
      cancelled: "cancelled",
      past_due: "past_due",
      pastdue: "past_due",
      inactive: "inactive",
      trialing: "active", // Treat trial as active
    };

    const status = statusMap[args.status.toLowerCase()] || "inactive";

    // Update household subscription data
    await ctx.db.patch(membership.householdId, {
      subscriptionTier: tier,
      subscriptionStatus: status,
      updatedAt: Date.now(),
    });

    console.log(
      `[Subscriptions] Updated household ${membership.householdId}: tier=${tier}, status=${status}`,
    );

    return null;
  },
});

/**
 * Manually update subscription (admin use or testing)
 * Requires owner role in the household
 */
export const updateSubscription = mutation({
  args: {
    tier: v.union(v.literal("foundations"), v.literal("heritage"), v.literal("legacy")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Get user's household membership
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    if (!membership) {
      throw new Error("No household found");
    }

    // Only owners can change subscription
    if (membership.role !== "owner") {
      throw new Error("Only household owners can change subscription");
    }

    // Update household
    await ctx.db.patch(membership.householdId, {
      subscriptionTier: args.tier,
      updatedAt: Date.now(),
    });

    return null;
  },
});
