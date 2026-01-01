import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./auth";

/**
 * Admin Dashboard Queries
 *
 * These queries provide real-time platform metrics for the admin dashboard.
 * All queries require admin role.
 */

/**
 * Get platform-wide statistics
 */
export const getStats = query({
  args: {},
  returns: v.object({
    totalUsers: v.number(),
    totalHouseholds: v.number(),
    totalContent: v.number(),
    totalLegacyPlans: v.number(),
    // Breakdown
    wisdomEntries: v.number(),
    vaultDocuments: v.number(),
    // Subscription breakdown
    subscriptionsByTier: v.object({
      foundations: v.number(),
      heritage: v.number(),
      legacy: v.number(),
      founders: v.number(),
    }),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Count profiles (users)
    const profiles = await ctx.db.query("profiles").collect();
    const totalUsers = profiles.filter((p) => !p.deletedAt).length;

    // Count households
    const households = await ctx.db.query("households").collect();
    const totalHouseholds = households.length;

    // Count by subscription tier
    const subscriptionsByTier = {
      foundations: households.filter((h) => h.subscriptionTier === "foundations").length,
      heritage: households.filter((h) => h.subscriptionTier === "heritage").length,
      legacy: households.filter((h) => h.subscriptionTier === "legacy").length,
      founders: households.filter((h) => h.subscriptionTier === "founders").length,
    };

    // Count wisdom entries
    const wisdomEntries = await ctx.db.query("wisdomEntries").collect();
    const wisdomCount = wisdomEntries.length;

    // Count vault documents
    const vaultDocuments = await ctx.db.query("vaultDocuments").collect();
    const vaultCount = vaultDocuments.length;

    // Count legacy plans
    const legacyPlans = await ctx.db.query("legacyPlans").collect();
    const legacyCount = legacyPlans.length;

    return {
      totalUsers,
      totalHouseholds,
      totalContent: wisdomCount + vaultCount,
      totalLegacyPlans: legacyCount,
      wisdomEntries: wisdomCount,
      vaultDocuments: vaultCount,
      subscriptionsByTier,
    };
  },
});

/**
 * Get recent activity across the platform
 */
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("activityLog"),
      _creationTime: v.number(),
      actionType: v.string(),
      description: v.string(),
      module: v.optional(v.string()),
      userName: v.optional(v.string()),
      userEmail: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 10;

    // Get recent activity logs
    const activities = await ctx.db.query("activityLog").order("desc").take(limit);

    // Enrich with user info
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const profile = await ctx.db.get(activity.userId);
        return {
          _id: activity._id,
          _creationTime: activity._creationTime,
          actionType: activity.actionType,
          description: activity.description,
          module: activity.module,
          userName: profile ? `${profile.firstName} ${profile.lastName}` : undefined,
          userEmail: undefined, // We don't store email in profiles
        };
      }),
    );

    return enrichedActivities;
  },
});

/**
 * Get households with their details for admin view
 */
export const listHouseholds = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("households"),
      _creationTime: v.number(),
      name: v.string(),
      subscriptionTier: v.string(),
      subscriptionStatus: v.string(),
      memberCount: v.optional(v.number()),
      storageUsedBytes: v.optional(v.number()),
      primaryContactName: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    const households = await ctx.db.query("households").order("desc").take(limit);

    const enrichedHouseholds = await Promise.all(
      households.map(async (household) => {
        const primaryContact = await ctx.db.get(household.primaryContactId);
        return {
          _id: household._id,
          _creationTime: household._creationTime,
          name: household.name,
          subscriptionTier: household.subscriptionTier,
          subscriptionStatus: household.subscriptionStatus,
          memberCount: household.memberCount,
          storageUsedBytes: household.storageUsedBytes,
          primaryContactName: primaryContact
            ? `${primaryContact.firstName} ${primaryContact.lastName}`
            : undefined,
        };
      }),
    );

    return enrichedHouseholds;
  },
});

/**
 * Get users/profiles for admin view
 */
export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      onboardingStatus: v.optional(v.string()),
      householdName: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    const profiles = await ctx.db.query("profiles").order("desc").take(limit);

    const enrichedProfiles = await Promise.all(
      profiles
        .filter((p) => !p.deletedAt)
        .map(async (profile) => {
          // Get user's household
          const membership = await ctx.db
            .query("householdMemberships")
            .withIndex("by_user", (q) => q.eq("userId", profile._id))
            .first();

          let householdName: string | undefined;
          if (membership) {
            const household = await ctx.db.get(membership.householdId);
            householdName = household?.name;
          }

          return {
            _id: profile._id,
            _creationTime: profile._creationTime,
            firstName: profile.firstName,
            lastName: profile.lastName,
            onboardingStatus: profile.onboardingStatus,
            householdName,
          };
        }),
    );

    return enrichedProfiles;
  },
});

/**
 * Get incomplete legacy plans (potential follow-up needed)
 */
export const getIncompleteLegacyPlans = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("legacyPlans"),
      _creationTime: v.number(),
      completionPercentage: v.number(),
      userName: v.optional(v.string()),
      householdName: v.optional(v.string()),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 10;

    // Get legacy plans that aren't complete
    const legacyPlans = await ctx.db.query("legacyPlans").order("desc").take(50);

    const incompletePlans = legacyPlans.filter((plan) => !plan.isComplete).slice(0, limit);

    const enrichedPlans = await Promise.all(
      incompletePlans.map(async (plan) => {
        const user = await ctx.db.get(plan.userId);
        const household = await ctx.db.get(plan.householdId);

        return {
          _id: plan._id,
          _creationTime: plan._creationTime,
          completionPercentage: plan.completionPercentage,
          userName: user ? `${user.firstName} ${user.lastName}` : undefined,
          householdName: household?.name,
          updatedAt: plan.updatedAt,
        };
      }),
    );

    return enrichedPlans;
  },
});
