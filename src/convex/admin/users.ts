import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../auth";

/**
 * Admin Users & Families Management
 *
 * These functions provide admin-only access to user and household management,
 * including search, details, and administrative actions like deactivation
 * and tier overrides.
 */

// ============================================================================
// USERS QUERIES
// ============================================================================

/**
 * List all users with pagination and search
 * Admin-only function
 */
export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    users: v.array(
      v.object({
        _id: v.id("profiles"),
        _creationTime: v.number(),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        status: v.union(v.literal("active"), v.literal("inactive")),
        householdCount: v.number(),
      }),
    ),
    nextCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get all profiles (we'll filter in memory for search)
    const profiles = await ctx.db.query("profiles").collect();

    // Filter out deleted profiles and apply search
    let filteredProfiles = profiles.filter((p) => !p.deletedAt);

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredProfiles = filteredProfiles.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower),
      );
    }

    // Sort by creation time (newest first)
    filteredProfiles.sort((a, b) => b._creationTime - a._creationTime);

    // Get all Better Auth users to map email
    // We'll get identity for each user by their userId (Clerk ID)
    const enrichedUsers = await Promise.all(
      filteredProfiles.map(async (profile) => {
        // Count household memberships
        const memberships = await ctx.db
          .query("householdMemberships")
          .withIndex("by_user", (q) => q.eq("userId", profile._id))
          .collect();

        const activeHouseholds = memberships.filter((m) => m.status === "active").length;

        return {
          _id: profile._id,
          _creationTime: profile._creationTime,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email ?? "No email on file",
          status: profile.deletedAt ? ("inactive" as const) : ("active" as const),
          householdCount: activeHouseholds,
        };
      }),
    );

    return {
      users: enrichedUsers,
      nextCursor: undefined, // Simple pagination for now
    };
  },
});

/**
 * Get a single user with full details
 * Admin-only function
 */
export const getUser = query({
  args: { profileId: v.id("profiles") },
  returns: v.union(
    v.object({
      profile: v.object({
        _id: v.id("profiles"),
        _creationTime: v.number(),
        userId: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        avatarUrl: v.optional(v.string()),
        phone: v.optional(v.string()),
        dateOfBirth: v.optional(v.number()),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zipCode: v.optional(v.string()),
        onboardingStatus: v.optional(
          v.union(
            v.literal("not_started"),
            v.literal("profile_complete"),
            v.literal("household_complete"),
            v.literal("preferences_complete"),
            v.literal("complete"),
          ),
        ),
        onboardingStep: v.optional(v.number()),
        onboardingCompletedAt: v.optional(v.number()),
        updatedAt: v.number(),
        deletedAt: v.optional(v.number()),
      }),
      email: v.string(),
      householdMemberships: v.array(
        v.object({
          _id: v.id("householdMemberships"),
          householdId: v.id("households"),
          householdName: v.string(),
          role: v.union(
            v.literal("owner"),
            v.literal("steward"),
            v.literal("viewer"),
            v.literal("executor"),
          ),
          status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive")),
          joinedAt: v.optional(v.number()),
        }),
      ),
      recentActivity: v.array(
        v.object({
          _id: v.id("activityLog"),
          _creationTime: v.number(),
          actionType: v.string(),
          description: v.string(),
          module: v.optional(v.string()),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      return null;
    }

    // Get household memberships
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    const enrichedMemberships = await Promise.all(
      memberships.map(async (m) => {
        const household = await ctx.db.get(m.householdId);
        return {
          _id: m._id,
          householdId: m.householdId,
          householdName: household?.name || "Unknown Household",
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt,
        };
      }),
    );

    // Get recent activity
    const recentActivity = await ctx.db
      .query("activityLog")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .order("desc")
      .take(10);

    const activityList = recentActivity.map((a) => ({
      _id: a._id,
      _creationTime: a._creationTime,
      actionType: a.actionType,
      description: a.description,
      module: a.module,
    }));

    return {
      profile: {
        _id: profile._id,
        _creationTime: profile._creationTime,
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        onboardingStatus: profile.onboardingStatus,
        onboardingStep: profile.onboardingStep,
        onboardingCompletedAt: profile.onboardingCompletedAt,
        updatedAt: profile.updatedAt,
        deletedAt: profile.deletedAt,
      },
      email: profile.email ?? "No email on file",
      householdMemberships: enrichedMemberships,
      recentActivity: activityList,
    };
  },
});

// ============================================================================
// HOUSEHOLDS QUERIES
// ============================================================================

/**
 * List all households with pagination and search
 * Admin-only function
 */
export const listHouseholds = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    households: v.array(
      v.object({
        _id: v.id("households"),
        _creationTime: v.number(),
        name: v.string(),
        primaryContactName: v.string(),
        memberCount: v.number(),
        subscriptionTier: v.union(
          v.literal("foundations"),
          v.literal("heritage"),
          v.literal("legacy"),
          v.literal("founders"),
        ),
        subscriptionStatus: v.union(
          v.literal("active"),
          v.literal("inactive"),
          v.literal("cancelled"),
          v.literal("past_due"),
        ),
        tierOverride: v.optional(
          v.union(
            v.literal("foundations"),
            v.literal("heritage"),
            v.literal("legacy"),
            v.literal("founders"),
          ),
        ),
      }),
    ),
    nextCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get all households
    const households = await ctx.db.query("households").collect();

    // Apply search filter
    let filteredHouseholds = households;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredHouseholds = households.filter((h) => h.name.toLowerCase().includes(searchLower));
    }

    // Sort by creation time (newest first)
    filteredHouseholds.sort((a, b) => b._creationTime - a._creationTime);

    // Enrich with primary contact info
    const enrichedHouseholds = await Promise.all(
      filteredHouseholds.map(async (household) => {
        const primaryContact = await ctx.db.get(household.primaryContactId);
        const primaryContactName = primaryContact
          ? `${primaryContact.firstName} ${primaryContact.lastName}`
          : "Unknown";

        return {
          _id: household._id,
          _creationTime: household._creationTime,
          name: household.name,
          primaryContactName,
          memberCount: household.memberCount || 0,
          subscriptionTier: household.subscriptionTier,
          subscriptionStatus: household.subscriptionStatus,
          tierOverride: household.tierOverride,
        };
      }),
    );

    return {
      households: enrichedHouseholds,
      nextCursor: undefined, // Simple pagination for now
    };
  },
});

/**
 * Get a single household with full details
 * Admin-only function
 */
export const getHousehold = query({
  args: { householdId: v.id("households") },
  returns: v.union(
    v.object({
      household: v.object({
        _id: v.id("households"),
        _creationTime: v.number(),
        name: v.string(),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        primaryContactId: v.id("profiles"),
        primaryContactName: v.string(),
        subscriptionTier: v.union(
          v.literal("foundations"),
          v.literal("heritage"),
          v.literal("legacy"),
          v.literal("founders"),
        ),
        subscriptionStatus: v.union(
          v.literal("active"),
          v.literal("inactive"),
          v.literal("cancelled"),
          v.literal("past_due"),
        ),
        storageUsedBytes: v.optional(v.number()),
        memberCount: v.optional(v.number()),
        familyUnitCount: v.optional(v.number()),
        vaultDocumentCount: v.optional(v.number()),
        updatedAt: v.number(),
        // Tier override fields (to be added to schema)
        tierOverride: v.optional(
          v.union(
            v.literal("foundations"),
            v.literal("heritage"),
            v.literal("legacy"),
            v.literal("founders"),
          ),
        ),
        tierOverrideExpiresAt: v.optional(v.number()),
        tierOverrideReason: v.optional(v.string()),
      }),
      members: v.array(
        v.object({
          _id: v.id("householdMemberships"),
          profileId: v.id("profiles"),
          firstName: v.string(),
          lastName: v.string(),
          email: v.string(),
          role: v.union(
            v.literal("owner"),
            v.literal("steward"),
            v.literal("viewer"),
            v.literal("executor"),
          ),
          status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive")),
          joinedAt: v.optional(v.number()),
        }),
      ),
      recentActivity: v.array(
        v.object({
          _id: v.id("activityLog"),
          _creationTime: v.number(),
          actionType: v.string(),
          description: v.string(),
          module: v.optional(v.string()),
          userName: v.optional(v.string()),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      return null;
    }

    // Get primary contact
    const primaryContact = await ctx.db.get(household.primaryContactId);
    const primaryContactName = primaryContact
      ? `${primaryContact.firstName} ${primaryContact.lastName}`
      : "Unknown";

    // Get all members
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    const enrichedMembers = await Promise.all(
      memberships.map(async (m) => {
        const profile = await ctx.db.get(m.userId);
        return {
          _id: m._id,
          profileId: m.userId,
          firstName: profile?.firstName || "Unknown",
          lastName: profile?.lastName || "User",
          email: profile?.email ?? "No email on file",
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt,
        };
      }),
    );

    // Get recent activity for this household
    const recentActivity = await ctx.db
      .query("activityLog")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .order("desc")
      .take(10);

    const enrichedActivity = await Promise.all(
      recentActivity.map(async (a) => {
        const user = await ctx.db.get(a.userId);
        return {
          _id: a._id,
          _creationTime: a._creationTime,
          actionType: a.actionType,
          description: a.description,
          module: a.module,
          userName: user ? `${user.firstName} ${user.lastName}` : undefined,
        };
      }),
    );

    return {
      household: {
        _id: household._id,
        _creationTime: household._creationTime,
        name: household.name,
        description: household.description,
        imageUrl: household.imageUrl,
        primaryContactId: household.primaryContactId,
        primaryContactName,
        subscriptionTier: household.subscriptionTier,
        subscriptionStatus: household.subscriptionStatus,
        storageUsedBytes: household.storageUsedBytes,
        memberCount: household.memberCount,
        familyUnitCount: household.familyUnitCount,
        vaultDocumentCount: household.vaultDocumentCount,
        updatedAt: household.updatedAt,
        // Tier override fields
        tierOverride: household.tierOverride,
        tierOverrideExpiresAt: household.tierOverrideExpiresAt,
        tierOverrideReason: household.tierOverrideReason,
      },
      members: enrichedMembers,
      recentActivity: enrichedActivity,
    };
  },
});

// ============================================================================
// USER MUTATIONS
// ============================================================================

/**
 * Deactivate a user account (soft delete)
 * Admin-only function
 */
export const deactivateUser = mutation({
  args: {
    profileId: v.id("profiles"),
    reason: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (profile.deletedAt) {
      throw new Error("User is already deactivated");
    }

    // Set deletedAt timestamp
    await ctx.db.patch(args.profileId, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the action
    // Get user's primary household for logging
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.profileId))
      .first();

    if (membership) {
      await ctx.db.insert("activityLog", {
        householdId: membership.householdId,
        userId: args.profileId,
        module: "household",
        actionType: "other",
        entityType: "other",
        description: `Admin deactivated user account${args.reason ? `: ${args.reason}` : ""}`,
      });
    }

    return { success: true };
  },
});

/**
 * Reactivate a user account
 * Admin-only function
 */
export const reactivateUser = mutation({
  args: {
    profileId: v.id("profiles"),
    reason: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!profile.deletedAt) {
      throw new Error("User is already active");
    }

    // Clear deletedAt timestamp
    await ctx.db.patch(args.profileId, {
      deletedAt: undefined,
      updatedAt: Date.now(),
    });

    // Log the action
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.profileId))
      .first();

    if (membership) {
      await ctx.db.insert("activityLog", {
        householdId: membership.householdId,
        userId: args.profileId,
        module: "household",
        actionType: "other",
        entityType: "other",
        description: `Admin reactivated user account${args.reason ? `: ${args.reason}` : ""}`,
      });
    }

    return { success: true };
  },
});

// ============================================================================
// HOUSEHOLD MUTATIONS
// ============================================================================

/**
 * Apply subscription tier override to household
 * Admin-only function
 *
 * Note: This requires schema changes to add tierOverride fields
 */
export const applyTierOverride = mutation({
  args: {
    householdId: v.id("households"),
    tier: v.union(
      v.literal("foundations"),
      v.literal("heritage"),
      v.literal("legacy"),
      v.literal("founders"),
    ),
    expiresAt: v.optional(v.number()),
    reason: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Apply tier override
    await ctx.db.patch(args.householdId, {
      tierOverride: args.tier,
      tierOverrideExpiresAt: args.expiresAt,
      tierOverrideReason: args.reason,
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("activityLog", {
      householdId: args.householdId,
      userId: household.primaryContactId,
      module: "household",
      actionType: "other",
      entityType: "household",
      description: `Admin applied tier override: ${args.tier} - ${args.reason}`,
    });

    return { success: true };
  },
});

/**
 * Remove subscription tier override
 * Admin-only function
 */
export const removeTierOverride = mutation({
  args: {
    householdId: v.id("households"),
    reason: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Clear tier override fields
    await ctx.db.patch(args.householdId, {
      tierOverride: undefined,
      tierOverrideExpiresAt: undefined,
      tierOverrideReason: undefined,
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("activityLog", {
      householdId: args.householdId,
      userId: household.primaryContactId,
      module: "household",
      actionType: "other",
      entityType: "household",
      description: `Admin removed tier override${args.reason ? `: ${args.reason}` : ""}`,
    });

    return { success: true };
  },
});
