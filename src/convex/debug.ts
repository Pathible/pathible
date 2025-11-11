import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { BetterAuthUser } from "../types/auth";

/**
 * DEBUG QUERIES FOR TROUBLESHOOTING
 *
 * These queries help you inspect the state of authentication and user data.
 * Run these in the Convex dashboard to debug issues.
 *
 * NOTE: Better Auth manages its own tables internally through the component.
 * We can't query them directly - instead we use Pathible tables and the current user context.
 */

// ============================================================================
// BETTER AUTH COMPONENT DEBUG
// ============================================================================

/**
 * Check Better Auth component status
 * Helps diagnose if Better Auth is working correctly
 */
export const checkBetterAuthStatus = query({
  args: {},
  returns: v.object({
    componentWorking: v.boolean(),
    hasCurrentUser: v.boolean(),
    currentUserId: v.union(v.string(), v.null()),
    currentUserEmail: v.union(v.string(), v.null()),
    currentUserEmailVerified: v.boolean(),
    currentUserCreatedAt: v.union(v.number(), v.null()),
    message: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    try {
      // Try to get current user
      const user = await authComponent.getAuthUser(ctx);

      if (!user) {
        return {
          componentWorking: true,
          hasCurrentUser: false,
          currentUserId: null,
          currentUserEmail: null,
          currentUserEmailVerified: false,
          currentUserCreatedAt: null,
          message: "Better Auth component is working, but no user is currently authenticated",
        };
      }

      const typedUser = user as BetterAuthUser;
      return {
        componentWorking: true,
        hasCurrentUser: true,
        currentUserId: typedUser._id,
        currentUserEmail: typedUser.email,
        currentUserEmailVerified: typedUser.emailVerified,
        currentUserCreatedAt: typedUser.createdAt,
      };
    } catch (error) {
      return {
        componentWorking: false,
        hasCurrentUser: false,
        currentUserId: null,
        currentUserEmail: null,
        currentUserEmailVerified: false,
        currentUserCreatedAt: null,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Better Auth component appears to be misconfigured",
      };
    }
  },
});

// ============================================================================
// PATHIBLE DATA DEBUG QUERIES
// ============================================================================

/**
 * Get current authenticated user
 * Returns the currently logged-in user or null
 */
export const getCurrentAuthUser = query({
  args: {},
  returns: v.union(
    v.object({
      authenticated: v.literal(true),
      user: v.object({
        id: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        emailVerified: v.boolean(),
        createdAt: v.number(),
      }),
    }),
    v.object({
      authenticated: v.literal(false),
      error: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    try {
      const user = await authComponent.getAuthUser(ctx);
      if (!user) {
        return { authenticated: false as const };
      }
      const typedUser = user as BetterAuthUser;
      return {
        authenticated: true as const,
        user: {
          id: typedUser._id,
          email: typedUser.email,
          name: typedUser.name,
          emailVerified: typedUser.emailVerified,
          createdAt: typedUser.createdAt,
        },
      };
    } catch (error) {
      return {
        authenticated: false as const,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * List all profiles
 * Shows all user profiles in the system
 */
export const listAllProfiles = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("profiles"),
      userId: v.string(), // Better Auth user ID
      firstName: v.string(),
      lastName: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();

    return profiles.map((p) => ({
      id: p._id,
      userId: p.userId,
      firstName: p.firstName,
      lastName: p.lastName,
      createdAt: p._creationTime,
    }));
  },
});

/**
 * List all user roles
 * Shows admin and user role assignments
 */
export const listAllRoles = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("userRoles"),
      userId: v.string(), // Better Auth user ID
      role: v.union(v.literal("admin"), v.literal("user")),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const roles = await ctx.db.query("userRoles").collect();

    return roles.map((r) => ({
      id: r._id,
      userId: r.userId,
      role: r.role,
      createdAt: r._creationTime,
    }));
  },
});

/**
 * List all households
 * Shows all households in the system
 */
export const listAllHouseholds = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("households"),
      name: v.string(),
      primaryContactId: v.id("profiles"),
      subscriptionTier: v.union(
        v.literal("foundations"),
        v.literal("heritage"),
        v.literal("legacy")
      ),
      subscriptionStatus: v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("cancelled"),
        v.literal("past_due")
      ),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const households = await ctx.db.query("households").collect();

    return households.map((h) => ({
      id: h._id,
      name: h.name,
      primaryContactId: h.primaryContactId,
      subscriptionTier: h.subscriptionTier,
      subscriptionStatus: h.subscriptionStatus,
      createdAt: h._creationTime,
    }));
  },
});

/**
 * Get complete user info by email
 * Shows all Pathible data for a specific user
 * NOTE: Email lookup only works for the currently authenticated user
 */
export const getMyCompleteInfo = query({
  args: {},
  returns: v.union(
    v.object({
      user: v.object({
        id: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        emailVerified: v.boolean(),
        createdAt: v.number(),
      }),
      profile: v.union(
        v.object({
          id: v.id("profiles"),
          firstName: v.string(),
          lastName: v.string(),
          phone: v.optional(v.string()),
          createdAt: v.number(),
        }),
        v.null()
      ),
      systemRole: v.union(v.literal("admin"), v.literal("user")),
      households: v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          userRole: v.union(
            v.literal("owner"),
            v.literal("steward"),
            v.literal("viewer"),
            v.literal("executor")
          ),
          status: v.union(
            v.literal("active"),
            v.literal("pending"),
            v.literal("inactive")
          ),
        })
      ),
    }),
    v.object({
      error: v.string(),
    })
  ),
  handler: async (ctx) => {
    try {
      const user = await authComponent.getAuthUser(ctx);
      if (!user) {
        return { error: "Not authenticated" };
      }

      const typedUser = user as BetterAuthUser;

      // Get profile
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", typedUser._id))
        .first();

      // Get role
      const role = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", typedUser._id))
        .first();

      // Get household memberships
      const memberships = profile
        ? await ctx.db
            .query("householdMemberships")
            .withIndex("by_user", (q) => q.eq("userId", profile._id))
            .collect()
        : [];

      // Get household details
      const households = await Promise.all(
        memberships.map(async (m) => {
          const household = await ctx.db.get(m.householdId);
          return {
            id: m.householdId,
            name: household?.name || "Unknown",
            userRole: m.role,
            status: m.status,
          };
        })
      );

      return {
        user: {
          id: typedUser._id,
          email: typedUser.email,
          name: typedUser.name,
          emailVerified: typedUser.emailVerified,
          createdAt: typedUser.createdAt,
        },
        profile: profile
          ? {
              id: profile._id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              phone: profile.phone,
              createdAt: profile._creationTime,
            }
          : null,
        systemRole: role ? role.role : ("user" as const),
        households,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Database stats
 * Shows counts of all major Pathible tables
 */
export const getDatabaseStats = query({
  args: {},
  returns: v.object({
    pathible: v.object({
      profiles: v.number(),
      roles: v.number(),
      households: v.number(),
      memberships: v.number(),
      documents: v.number(),
      wisdomEntries: v.number(),
      letters: v.number(),
    }),
    health: v.object({
      profilesWithoutHouseholds: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const [
      profilesCount,
      rolesCount,
      householdsCount,
      membershipsCount,
      documentsCount,
      wisdomCount,
      lettersCount,
    ] = await Promise.all([
      ctx.db.query("profiles").collect().then((r) => r.length),
      ctx.db.query("userRoles").collect().then((r) => r.length),
      ctx.db.query("households").collect().then((r) => r.length),
      ctx.db.query("householdMemberships").collect().then((r) => r.length),
      ctx.db.query("vaultDocuments").collect().then((r) => r.length),
      ctx.db.query("wisdomEntries").collect().then((r) => r.length),
      ctx.db.query("letters").collect().then((r) => r.length),
    ]);

    // Calculate profiles without households
    const profiles = await ctx.db.query("profiles").collect();
    let profilesWithoutHouseholds = 0;

    for (const profile of profiles) {
      const membership = await ctx.db
        .query("householdMemberships")
        .withIndex("by_user", (q) => q.eq("userId", profile._id))
        .first();
      if (!membership) {
        profilesWithoutHouseholds++;
      }
    }

    return {
      pathible: {
        profiles: profilesCount,
        roles: rolesCount,
        households: householdsCount,
        memberships: membershipsCount,
        documents: documentsCount,
        wisdomEntries: wisdomCount,
        letters: lettersCount,
      },
      health: {
        profilesWithoutHouseholds,
      },
    };
  },
});

/**
 * Check authentication status
 * Quick check to see if current user is authenticated
 */
export const amIAuthenticated = query({
  args: {},
  returns: v.object({
    authenticated: v.boolean(),
    hasProfile: v.boolean(),
    email: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    try {
      const user = await authComponent.getAuthUser(ctx);
      if (!user) {
        return { authenticated: false, hasProfile: false };
      }

      const typedUser = user as BetterAuthUser;

      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", typedUser._id))
        .first();

      return {
        authenticated: true,
        hasProfile: !!profile,
        email: typedUser.email,
      };
    } catch {
      return { authenticated: false, hasProfile: false };
    }
  },
});
