import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalQuery, query } from "./_generated/server";
import { formatBytesAsGB, formatLimit } from "./shared/constants";
import { getFamilyUnitCount, getMemberCountFromHousehold } from "./shared/counters";
import { checkDocumentAccess } from "./vaultHelpers";

/**
 * Authentication helpers for Convex with Clerk
 *
 * Clerk handles authentication (login, sessions, JWT tokens).
 * Convex validates the JWT and provides user identity via ctx.auth.getUserIdentity().
 * We look up the user's profile and enforce access control.
 */

// ============================================================================
// SUBSCRIPTION TIERS & PLAN LIMITS
// ============================================================================

/**
 * Subscription tier hierarchy (higher number = more features)
 *
 * Founders tier: Special launch offer (first 7 days of 2025).
 * Matches Legacy features forever, with priority support instead of concierge.
 */
export const TIER_LEVELS = {
  foundations: 1,
  heritage: 2,
  legacy: 3,
  founders: 3, // Same level as Legacy - full feature access
} as const;

export type SubscriptionTier = keyof typeof TIER_LEVELS;

/**
 * Plan limits by tier
 *
 * These limits are enforced server-side in Convex mutations.
 * Must match the limits defined in Clerk Dashboard and UI.
 */
export const PLAN_LIMITS = {
  foundations: {
    storageBytesMax: 5 * 1024 * 1024 * 1024, // 5GB
    familyMembersMax: 1, // 1 viewer
    familyUnitsMax: 1, // Primary family only
  },
  heritage: {
    storageBytesMax: 25 * 1024 * 1024 * 1024, // 25GB
    familyMembersMax: 3, // 3 members
    familyUnitsMax: 3, // Up to 3 family units
  },
  legacy: {
    storageBytesMax: Number.MAX_SAFE_INTEGER, // Unlimited
    familyMembersMax: Number.MAX_SAFE_INTEGER, // Unlimited
    familyUnitsMax: Number.MAX_SAFE_INTEGER, // Unlimited
  },
  founders: {
    // Same as Legacy - exclusive launch offer
    storageBytesMax: Number.MAX_SAFE_INTEGER, // Unlimited
    familyMembersMax: Number.MAX_SAFE_INTEGER, // Unlimited
    familyUnitsMax: Number.MAX_SAFE_INTEGER, // Unlimited
  },
} as const;

/**
 * Feature-to-minimum-tier mapping
 *
 * Defines which subscription tier is required for each feature.
 * Used by requireFeatureAccess() for server-side enforcement.
 *
 * IMPORTANT: These slugs MUST match exactly what's configured in Clerk Dashboard.
 * See /api/debug/clerk-billing to verify the current Clerk configuration.
 */
export const FEATURE_TIERS = {
  // Heritage Vault
  vault_document_storage: "foundations",
  vault_photo_video: "foundations",
  vault_folders: "foundations",
  vault_tags_collections: "heritage",
  vault_voice_uploads: "heritage",
  vault_guided_organization: "heritage",

  // Financial Intelligence
  financial_overview: "foundations",
  financial_summaries: "heritage",
  financial_insights: "heritage",
  financial_spending_categories: "legacy",
  financial_trends: "legacy",

  // Family Network
  family_members: "foundations",
  family_profiles: "heritage",
  family_messaging: "heritage",
  family_relationships: "legacy",

  // Legacy Builder - Premium only
  legacy_questionnaires: "legacy",
  legacy_story_templates: "legacy",

  // Wisdom
  wisdom_entries: "heritage",
  wisdom_shared_pages: "legacy",

  // Support
  standard_support: "foundations",
  support_priority: "heritage",
  support_concierge: "legacy",

  // Early Access
  early_access_features: "heritage",
} as const satisfies Record<string, SubscriptionTier>;

export type FeatureSlug = keyof typeof FEATURE_TIERS;

/**
 * Type for authenticated context with user and profile
 */
export interface AuthenticatedContext {
  user: {
    _id: string; // Clerk user ID
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
    deletedAt?: number;
  };
}

const profileReturnValidator = v.object({
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
});

/**
 * Get the authenticated user from Clerk via Convex
 * Returns null if not authenticated
 */
async function getClerkUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return {
    _id: identity.subject, // Clerk user ID
    email: identity.email ?? "",
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
  const user = await getClerkUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get the user's profile by Clerk user ID
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
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
      _id: user._id,
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

// ============================================================================
// SUBSCRIPTION & FEATURE ACCESS ENFORCEMENT
// ============================================================================

/**
 * Get household with subscription info
 *
 * Returns the household document, throwing if not found.
 */
export async function getHouseholdWithSubscription(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
): Promise<Doc<"households">> {
  const household = await ctx.db.get(householdId);
  if (!household) {
    throw new Error("Household not found");
  }
  return household;
}

/**
 * Require active subscription
 *
 * Verifies that the household has an active subscription.
 * Throws if subscription is inactive, cancelled, or past_due.
 *
 * @example
 * export const paidFeature = mutation({
 *   handler: async (ctx, args) => {
 *     await requireHouseholdAccess(ctx, args.householdId);
 *     await requireActiveSubscription(ctx, args.householdId);
 *     // ... feature logic
 *   }
 * });
 */
export async function requireActiveSubscription(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
): Promise<Doc<"households">> {
  const household = await getHouseholdWithSubscription(ctx, householdId);

  if (household.subscriptionStatus !== "active") {
    throw new Error(
      `Subscription is ${household.subscriptionStatus}. Please update your subscription to continue.`,
    );
  }

  return household;
}

/**
 * Require minimum subscription tier
 *
 * Verifies that the household has at least the required subscription tier.
 * Also checks that the subscription is active.
 *
 * @example
 * export const heritageFeature = mutation({
 *   handler: async (ctx, args) => {
 *     await requireHouseholdAccess(ctx, args.householdId);
 *     await requireSubscriptionTier(ctx, args.householdId, "heritage");
 *     // ... feature logic for heritage+ tiers
 *   }
 * });
 */
export async function requireSubscriptionTier(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  requiredTier: SubscriptionTier,
): Promise<Doc<"households">> {
  const household = await requireActiveSubscription(ctx, householdId);

  const currentLevel = TIER_LEVELS[household.subscriptionTier];
  const requiredLevel = TIER_LEVELS[requiredTier];

  if (currentLevel < requiredLevel) {
    throw new Error(
      `This feature requires the ${requiredTier} plan or higher. Current plan: ${household.subscriptionTier}`,
    );
  }

  return household;
}

/**
 * Require feature access by feature slug
 *
 * Looks up the required tier for a feature and enforces it.
 * Use this for feature-specific access control.
 *
 * @example
 * export const tagsFeature = mutation({
 *   handler: async (ctx, args) => {
 *     await requireHouseholdAccess(ctx, args.householdId);
 *     await requireFeatureAccess(ctx, args.householdId, "vault_tags_collections");
 *     // ... tags feature logic
 *   }
 * });
 */
export async function requireFeatureAccess(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  featureSlug: FeatureSlug,
): Promise<Doc<"households">> {
  const requiredTier = FEATURE_TIERS[featureSlug];

  if (!requiredTier) {
    // Unknown feature - fail secure (deny access)
    console.error(`[auth] Unknown feature slug: ${featureSlug}`);
    throw new Error("Access denied: Unknown feature");
  }

  return await requireSubscriptionTier(ctx, householdId, requiredTier);
}

// ============================================================================
// STORAGE QUOTA HELPERS
// ============================================================================

/**
 * Check storage quota
 *
 * Uses the pre-computed `storageUsedBytes` counter on the household document
 * for O(1) performance instead of scanning all documents.
 *
 * @example
 * export const uploadDocument = mutation({
 *   handler: async (ctx, args) => {
 *     await requireHouseholdAccess(ctx, args.householdId);
 *     const { remainingBytes } = await checkStorageQuota(ctx, args.householdId, args.fileSize);
 *     // ... upload logic
 *   }
 * });
 */
export async function checkStorageQuota(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  additionalBytes: number = 0,
): Promise<{ currentBytes: number; maxBytes: number; remainingBytes: number }> {
  const household = await requireActiveSubscription(ctx, householdId);
  const limits = PLAN_LIMITS[household.subscriptionTier];

  // Use pre-computed counter (defaults to 0 for backwards compatibility)
  const currentBytes = household.storageUsedBytes ?? 0;
  const remainingBytes = limits.storageBytesMax - currentBytes;

  if (additionalBytes > 0 && currentBytes + additionalBytes > limits.storageBytesMax) {
    const usedGB = formatBytesAsGB(currentBytes);
    const maxGB = formatBytesAsGB(limits.storageBytesMax);
    throw new Error(
      `Storage limit exceeded. Used: ${usedGB}GB of ${maxGB}GB. Upgrade your plan for more storage.`,
    );
  }

  return {
    currentBytes,
    maxBytes: limits.storageBytesMax,
    remainingBytes: Math.max(0, remainingBytes),
  };
}

/**
 * Check family member limit
 *
 * Verifies that the household has not exceeded their family member limit.
 * Returns the current count and limit.
 *
 * @example
 * export const inviteFamilyMember = mutation({
 *   handler: async (ctx, args) => {
 *     await requireHouseholdAdmin(ctx, args.householdId);
 *     await checkFamilyMemberLimit(ctx, args.householdId, true);
 *     // ... invite logic
 *   }
 * });
 */
export async function checkFamilyMemberLimit(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  checkingForNewMember: boolean = false,
): Promise<{ currentCount: number; maxCount: number; canAddMore: boolean }> {
  const household = await requireActiveSubscription(ctx, householdId);
  const limits = PLAN_LIMITS[household.subscriptionTier];

  const nonOwnerCount = await getMemberCountFromHousehold(ctx, household);
  const canAddMore = nonOwnerCount < limits.familyMembersMax;

  if (checkingForNewMember && !canAddMore) {
    throw new Error(
      `Family member limit reached. Your ${household.subscriptionTier} plan allows ${formatLimit(
        limits.familyMembersMax,
      )} member(s). Upgrade for more.`,
    );
  }

  return {
    currentCount: nonOwnerCount,
    maxCount: limits.familyMembersMax,
    canAddMore,
  };
}

/**
 * Check family unit limit
 *
 * Verifies that the household has not exceeded their family unit limit.
 *
 * @example
 * export const createFamilyUnit = mutation({
 *   handler: async (ctx, args) => {
 *     await requireHouseholdAdmin(ctx, args.householdId);
 *     await checkFamilyUnitLimit(ctx, args.householdId, true);
 *     // ... create logic
 *   }
 * });
 */
export async function checkFamilyUnitLimit(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  checkingForNewUnit: boolean = false,
): Promise<{ currentCount: number; maxCount: number; canAddMore: boolean }> {
  const household = await requireActiveSubscription(ctx, householdId);
  const limits = PLAN_LIMITS[household.subscriptionTier];

  const currentCount = await getFamilyUnitCount(ctx, household);
  const canAddMore = currentCount < limits.familyUnitsMax;

  if (checkingForNewUnit && !canAddMore) {
    throw new Error(
      `Family unit limit reached. Your ${household.subscriptionTier} plan allows ${formatLimit(
        limits.familyUnitsMax,
      )} family unit(s). Upgrade for more.`,
    );
  }

  return {
    currentCount,
    maxCount: limits.familyUnitsMax,
    canAddMore,
  };
}

// ============================================================================
// CONVEX QUERY EXPORTS (for Next.js server-side calls)
// ============================================================================

/**
 * Query: Get current authenticated user
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
    const user = await getClerkUser(ctx);
    if (!user) {
      return null;
    }
    return { user };
  },
});

/**
 * Query: Get current user with profile
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
      profile: profileReturnValidator,
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
    profile: profileReturnValidator,
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

// /**
//  * Internal Query: Get a document by ID (for use in actions)
//  *
//  * @deprecated Use getDocumentWithAccessInternal instead for safer access control.
//  * This function does NOT verify access permissions and may expose documents
//  * to unauthorized access if callers forget to check permissions.
//  *
//  * SECURITY WARNING: This query does NOT verify access permissions.
//  * Callers MUST:
//  * 1. Call requireHouseholdAccessInternal to verify household membership
//  * 2. Check document-level access using checkDocumentAccess from vaultHelpers
//  *
//  * Consider using getDocumentWithAccessInternal for a safer combined approach.
//  */
// export const getDocumentInternal = internalQuery({
//   args: {
//     documentId: v.id("vaultDocuments"),
//   },
//   returns: v.union(
//     v.object({
//       _id: v.id("vaultDocuments"),
//       _creationTime: v.number(),
//       householdId: v.id("households"),
//       uploadedBy: v.id("profiles"),
//       name: v.string(),
//       description: v.optional(v.string()),
//       b2FileId: v.string(),
//       b2FileName: v.string(),
//       b2BucketName: v.string(),
//       fileHash: v.optional(v.string()),
//       fileSize: v.number(),
//       fileType: v.string(),
//       categories: v.array(v.string()),
//       accessLevel: v.union(v.literal("household"), v.literal("admins"), v.literal("custom")),
//       sharedWithUsers: v.array(v.id("profiles")),
//       updatedAt: v.number(),
//     }),
//     v.null(),
//   ),
//   handler: async (ctx, args) => {
//     return await ctx.db.get(args.documentId);
//   },
// });

/**
 * Internal Query: Get a document with access verification (PREFERRED)
 *
 * This is the safer alternative to getDocumentInternal. It:
 * 1. Verifies the caller is authenticated
 * 2. Verifies household membership
 * 3. Checks document-level access permissions
 *
 * Returns null if document doesn't exist or access is denied.
 * Throws only for authentication failures.
 */
export const getDocumentWithAccessInternal = internalQuery({
  args: {
    documentId: v.id("vaultDocuments"),
  },
  returns: v.union(
    v.object({
      document: v.object({
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
      membership: v.object({
        _id: v.id("householdMemberships"),
        role: v.union(
          v.literal("owner"),
          v.literal("steward"),
          v.literal("viewer"),
          v.literal("executor"),
        ),
      }),
      profile: v.object({
        _id: v.id("profiles"),
      }),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Get document first
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return null;
    }

    // Verify authentication
    const { profile } = await requireAuth(ctx);

    // Verify household membership
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", document.householdId).eq("userId", profile._id),
      )
      .unique();

    if (!membership || membership.status !== "active") {
      return null; // Not a member - deny access silently
    }

    // Check document-level access
    const hasAccess = checkDocumentAccess(document, profile._id, membership.role);
    if (!hasAccess) {
      return null; // No document access - deny silently
    }

    return {
      document,
      membership: {
        _id: membership._id,
        role: membership.role,
      },
      profile: {
        _id: profile._id,
      },
    };
  },
});

// ============================================================================
// ONBOARDING STATUS CHECK (for server-side route protection)
// ============================================================================

/**
 * Query: Get onboarding status for route protection
 *
 * Used by server-side code (middleware, layouts) to determine if
 * a user can access protected routes.
 *
 * Returns detailed status for routing decisions:
 * - hasProfile: true if user has a profile record
 * - onboardingComplete: true if onboarding workflow is finished
 * - hasHousehold: true if user belongs to at least one household
 * - needsOnboarding: true if user should be redirected to /onboarding
 *
 * Returns null if user is not authenticated.
 */
export const getOnboardingStatus = query({
  args: {},
  returns: v.union(
    v.object({
      hasProfile: v.boolean(),
      onboardingComplete: v.boolean(),
      hasHousehold: v.boolean(),
      needsOnboarding: v.boolean(),
      onboardingStatus: v.optional(
        v.union(
          v.literal("not_started"),
          v.literal("profile_complete"),
          v.literal("household_complete"),
          v.literal("preferences_complete"),
          v.literal("complete"),
        ),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    // Get user identity from Clerk JWT
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    // Look up profile by Clerk user ID
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    // No profile means user needs to complete onboarding
    if (!profile || profile.deletedAt) {
      return {
        hasProfile: false,
        onboardingComplete: false,
        hasHousehold: false,
        needsOnboarding: true,
        onboardingStatus: undefined,
      };
    }

    // Check if user has a household membership
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    const hasHousehold = membership !== null && membership.status === "active";

    // Check onboarding completion status
    const onboardingStatus = profile.onboardingStatus || "not_started";
    const onboardingComplete = onboardingStatus === "complete";

    // User needs onboarding if:
    // 1. Profile exists but onboarding is not complete, OR
    // 2. Profile exists but has no household
    const needsOnboarding = !onboardingComplete || !hasHousehold;

    return {
      hasProfile: true,
      onboardingComplete,
      hasHousehold,
      needsOnboarding,
      onboardingStatus,
    };
  },
});
