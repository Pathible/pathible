import { createClient } from "@convex-dev/better-auth";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalQuery, query } from "./_generated/server";

/**
 * Better Auth Configuration for Convex
 *
 * This file sets up the Better Auth component client and exports helper functions
 * for authentication and authorization in Convex functions.
 *
 * NOTE: The createAuth function (which uses Node.js APIs from better-auth)
 * is in authNode.ts with the "use node" directive.
 */

/**
 * Better Auth component instance for Convex
 */
export const authComponent = createClient(components.betterAuth, {
  local: {
    schema: undefined, // Uses default schema from component
  },
});

/**
 * Type for authenticated context with user and profile
 */
export interface AuthenticatedContext {
  user: {
    _id: string;
    email: string;
  };
  profile: {
    _id: Id<"profiles">;
    _creationTime: number;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    phone?: string;
    dateOfBirth?: number;
    // Address fields
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    updatedAt: number;
    onboardingStatus?:
      | "not_started"
      | "profile_complete"
      | "household_complete"
      | "preferences_complete"
      | "complete";
    onboardingStep?: number;
    onboardingCompletedAt?: number;
    // Soft-delete
    deletedAt?: number;
  };
}

/**
 * Require authentication and return user + profile
 *
 * Throws an error if not authenticated or profile doesn't exist.
 * Use this in mutations and queries that require authentication.
 *
 * @example
 * export const myMutation = mutation({
 *   handler: async (ctx, args) => {
 *     const { user, profile } = await requireAuth(ctx);
 *     // ... use user and profile
 *   }
 * });
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<AuthenticatedContext> {
  // Get the authenticated user from Better Auth
  // Note: Better Auth's context type doesn't perfectly match Convex's ctx, so we cast carefully
  const user = await authComponent.getAuthUser(
    ctx as unknown as Parameters<typeof authComponent.getAuthUser>[0],
  );
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Extract user ID safely
  const userId = String(user._id);

  // Get the user's profile
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Reject soft-deleted profiles
  if (profile.deletedAt) {
    throw new Error("Account has been deleted");
  }

  return {
    user: {
      _id: userId,
      email: user.email,
    },
    profile,
  };
}

/**
 * Require admin role
 *
 * Throws an error if not authenticated or not an admin.
 * Use this in admin-only mutations and queries.
 *
 * @example
 * export const adminOnlyMutation = mutation({
 *   handler: async (ctx, args) => {
 *     await requireAdmin(ctx);
 *     // ... admin-only logic
 *   }
 * });
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<void> {
  const { user } = await requireAuth(ctx);

  // Check if user has admin role
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .unique();

  if (!userRole || userRole.role !== "admin") {
    throw new Error("Admin access required");
  }
}

/**
 * Require household access and return membership
 *
 * Verifies that the authenticated user is an active member of the specified household.
 * Returns the user's membership record.
 *
 * @example
 * export const householdQuery = query({
 *   handler: async (ctx, args) => {
 *     const membership = await requireHouseholdAccess(ctx, args.householdId);
 *     // membership.role contains "owner" | "steward" | "viewer" | "executor"
 *   }
 * });
 */
export async function requireHouseholdAccess(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
): Promise<Doc<"householdMemberships">> {
  const { profile } = await requireAuth(ctx);

  // Check if user is a member of this household
  const membership = await ctx.db
    .query("householdMemberships")
    .withIndex("by_household_and_user", (q) =>
      q.eq("householdId", householdId).eq("userId", profile._id),
    )
    .unique();

  if (!membership || membership.status !== "active") {
    throw new Error("Access denied: Not a member of this household");
  }

  return membership;
}

/**
 * Require household admin access (owner or steward)
 *
 * Verifies that the authenticated user is an active member with admin privileges
 * (owner or steward role) in the specified household.
 *
 * @example
 * export const adminMutation = mutation({
 *   handler: async (ctx, args) => {
 *     await requireHouseholdAdmin(ctx, args.householdId);
 *     // User is confirmed to be owner or steward
 *   }
 * });
 */
export async function requireHouseholdAdmin(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
): Promise<void> {
  const membership = await requireHouseholdAccess(ctx, householdId);

  // Only owners and stewards have admin privileges
  if (membership.role !== "owner" && membership.role !== "steward") {
    throw new Error("Access denied: Admin privileges required");
  }
}

/**
 * Helper: Get the current authenticated user (without requiring a profile)
 *
 * Returns null if not authenticated.
 * Use this helper in other Convex functions when you need to check auth without throwing.
 */
async function getCurrentUserHelper(
  ctx: QueryCtx | MutationCtx,
): Promise<{ user: { _id: string; email: string } } | null> {
  // Note: Better Auth's context type doesn't perfectly match Convex's ctx, so we cast carefully
  const user = await authComponent.safeGetAuthUser(
    ctx as unknown as Parameters<typeof authComponent.safeGetAuthUser>[0],
  );

  if (!user) {
    return null;
  }

  return {
    user: {
      _id: String(user._id),
      email: user.email,
    },
  };
}

// ============================================================================
// CONVEX QUERY EXPORTS (for Next.js server-side calls)
// ============================================================================

/**
 * Query: Get current authenticated user (for Next.js getServerSession)
 * Returns user info or null if not authenticated
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.string(),
        email: v.string(),
      }),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    return await getCurrentUserHelper(ctx);
  },
});

/**
 * Query: Get current user with profile (for Next.js getServerSessionWithProfile)
 * Returns user and profile or null if not authenticated or no profile
 */
export const getCurrentUserWithProfile = query({
  args: {},
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.string(),
        email: v.string(),
      }),
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
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    try {
      const auth = await requireAuth(ctx);
      return auth;
    } catch {
      return null;
    }
  },
});

/**
 * Internal Query: Require authentication (for use in actions)
 * Throws if not authenticated
 */
export const requireAuthInternal = internalQuery({
  args: {},
  returns: v.object({
    user: v.object({
      _id: v.string(),
      email: v.string(),
    }),
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
      updatedAt: v.number(),
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
      deletedAt: v.optional(v.number()),
    }),
  }),
  handler: async (ctx) => {
    return await requireAuth(ctx);
  },
});

/**
 * Internal Query: Require household access (for use in actions)
 * Returns membership or throws if not authorized
 */
export const requireHouseholdAccessInternal = internalQuery({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    _id: v.id("householdMemberships"),
    _creationTime: v.number(),
    householdId: v.id("households"),
    userId: v.id("profiles"),
    role: v.union(
      v.literal("owner"),
      v.literal("steward"),
      v.literal("viewer"),
      v.literal("executor"),
    ),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive")),
    invitedBy: v.optional(v.id("profiles")),
    joinedAt: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    return await requireHouseholdAccess(ctx, args.householdId);
  },
});

/**
 * Internal Query: Get a document by ID (for use in actions)
 */
export const getDocumentInternal = internalQuery({
  args: {
    documentId: v.id("vaultDocuments"),
  },
  returns: v.union(
    v.object({
      _id: v.id("vaultDocuments"),
      _creationTime: v.number(),
      householdId: v.id("households"),
      uploadedBy: v.id("profiles"),
      name: v.string(),
      description: v.optional(v.string()),
      b2FileId: v.string(),
      b2FileName: v.string(),
      b2BucketName: v.string(),
      fileHash: v.optional(v.string()),
      fileSize: v.number(),
      fileType: v.string(),
      categories: v.array(v.string()),
      accessLevel: v.union(v.literal("household"), v.literal("admins"), v.literal("custom")),
      sharedWithUsers: v.array(v.id("profiles")),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});
