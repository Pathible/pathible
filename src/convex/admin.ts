import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

/**
 * List activity logs with filtering and pagination
 */
export const listActivityLogs = query({
  args: {
    search: v.optional(v.string()),
    actionType: v.optional(v.string()),
    module: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("activityLog"),
        _creationTime: v.number(),
        actionType: v.string(),
        description: v.string(),
        module: v.optional(v.string()),
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
        userId: v.id("profiles"),
        userName: v.string(),
        householdId: v.id("households"),
        householdName: v.optional(v.string()),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Start with base query ordered by creation time (descending)
    const results = await ctx.db.query("activityLog").order("desc").paginate(args.paginationOpts);

    // Apply filters in memory (since we can't efficiently filter on multiple fields in Convex)
    let filteredResults = results.page;

    // Filter by module
    if (args.module) {
      filteredResults = filteredResults.filter((log) => log.module === args.module);
    }

    // Filter by actionType
    if (args.actionType) {
      filteredResults = filteredResults.filter((log) => log.actionType === args.actionType);
    }

    // Filter by date range
    if (args.startDate) {
      const startDate = args.startDate;
      filteredResults = filteredResults.filter((log) => log._creationTime >= startDate);
    }
    if (args.endDate) {
      const endDate = args.endDate;
      filteredResults = filteredResults.filter((log) => log._creationTime <= endDate);
    }

    // Filter by search term (search in description)
    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase();
      filteredResults = filteredResults.filter((log) =>
        log.description.toLowerCase().includes(searchLower),
      );
    }

    // Enrich with user and household info
    const enrichedLogs = await Promise.all(
      filteredResults.map(async (log) => {
        const profile = await ctx.db.get(log.userId);
        const household = await ctx.db.get(log.householdId);

        return {
          _id: log._id,
          _creationTime: log._creationTime,
          actionType: log.actionType,
          description: log.description,
          module: log.module,
          entityType: log.entityType,
          entityId: log.entityId,
          userId: log.userId,
          userName: profile ? `${profile.firstName} ${profile.lastName}` : "Unknown User",
          householdId: log.householdId,
          householdName: household?.name,
        };
      }),
    );

    return {
      page: enrichedLogs,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

/**
 * Get action type counts for filter dropdown hints
 */
export const getActionTypeCounts = query({
  args: {},
  returns: v.object({
    total: v.number(),
    byActionType: v.record(v.string(), v.number()),
    byModule: v.record(v.string(), v.number()),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all activity logs (limited to recent for performance)
    const logs = await ctx.db.query("activityLog").order("desc").take(1000);

    // Count by action type
    const byActionType: Record<string, number> = {};
    const byModule: Record<string, number> = {};

    for (const log of logs) {
      // Count action types
      byActionType[log.actionType] = (byActionType[log.actionType] || 0) + 1;

      // Count modules
      if (log.module) {
        byModule[log.module] = (byModule[log.module] || 0) + 1;
      }
    }

    return {
      total: logs.length,
      byActionType,
      byModule,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update a household's subscription tier (admin only)
 * Use this to fix tier mismatches or manually upgrade/downgrade
 */
export const updateHouseholdTier = mutation({
  args: {
    householdId: v.id("households"),
    tier: v.union(
      v.literal("foundations"),
      v.literal("heritage"),
      v.literal("legacy"),
      v.literal("founders"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    await ctx.db.patch(args.householdId, {
      subscriptionTier: args.tier,
      updatedAt: Date.now(),
    });

    console.log(
      `[Admin] Updated household ${args.householdId} tier from ${household.subscriptionTier} to ${args.tier}`,
    );

    return null;
  },
});
