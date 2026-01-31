import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

/**
 * Testing Module
 *
 * Contains mutations for E2E test setup and cleanup.
 * These should ONLY be used in test environments.
 *
 * SECURITY: These mutations are protected by checking for test user email patterns.
 * They will reject requests from non-test users.
 */

// Test user email patterns that are allowed to be reset
const TEST_EMAIL_PATTERNS = ["+clerk_test", "+e2e_test", "@test.pathible.com"];

// Return type for deleted counts
const deletedSchema = v.object({
  profile: v.boolean(),
  memberships: v.number(),
  households: v.number(),
  familyUnits: v.number(),
  familyMembers: v.number(),
  documents: v.number(),
  categories: v.number(),
  preferences: v.number(),
  invitations: v.number(),
  activityLogs: v.number(),
  wisdomEntries: v.number(),
  letters: v.number(),
  coreBeliefs: v.number(),
  legacyPlans: v.number(),
  keyContacts: v.number(),
  financialAccounts: v.number(),
  properties: v.number(),
  insurancePolicies: v.number(),
  userSuggestions: v.number(),
  notifications: v.number(),
  userRoles: v.number(),
});

// Default empty deleted object
const emptyDeleted = {
  profile: false,
  memberships: 0,
  households: 0,
  familyUnits: 0,
  familyMembers: 0,
  documents: 0,
  categories: 0,
  preferences: 0,
  invitations: 0,
  activityLogs: 0,
  wisdomEntries: 0,
  letters: 0,
  coreBeliefs: 0,
  legacyPlans: 0,
  keyContacts: 0,
  financialAccounts: 0,
  properties: 0,
  insurancePolicies: 0,
  userSuggestions: 0,
  notifications: 0,
  userRoles: 0,
};

/**
 * Reset a test user to fresh state
 *
 * This mutation completely resets a user's data, allowing E2E tests
 * to start from a clean slate. It deletes:
 * - User profile and preferences
 * - All household memberships
 * - Households where user is primary contact (and ALL related data)
 * - Vault documents and categories
 * - Family units and members
 * - Activity logs
 * - Wisdom entries, letters, core beliefs
 * - Legacy plans and key contacts
 * - Financial accounts, properties, insurance policies
 * - Smart suggestions and user suggestions
 * - Notifications
 * - User roles
 *
 * Note: B2 files are NOT deleted here - they need separate cleanup
 *
 * SECURITY: Only works for test user emails (containing +clerk_test, etc.)
 * SECURITY: Disabled in production environments
 */
export const resetTestUser = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    deleted: deletedSchema,
  }),
  handler: async (ctx) => {
    // Environment check - disable in production
    const convexUrl = process.env.CONVEX_CLOUD_URL || "";
    if (convexUrl.includes("prod") || convexUrl.includes("hushed-horse")) {
      return {
        success: false,
        message: "Test functions are disabled in production",
        deleted: { ...emptyDeleted },
      };
    }

    // Get current user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        success: false,
        message: "Not authenticated",
        deleted: { ...emptyDeleted },
      };
    }

    const email = identity.email || "";
    const userId = identity.subject;

    // SECURITY: Only allow test users to be reset
    const isTestUser = TEST_EMAIL_PATTERNS.some((pattern) =>
      email.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (!isTestUser) {
      return {
        success: false,
        message: `Security: Only test users can be reset. Email must contain one of: ${TEST_EMAIL_PATTERNS.join(", ")}`,
        deleted: { ...emptyDeleted },
      };
    }

    const deleted = { ...emptyDeleted };

    // Find the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return {
        success: true,
        message: "User already in clean state (no profile)",
        deleted,
      };
    }

    // =========================================================================
    // 1. Delete profile-level data (not tied to household)
    // =========================================================================

    // Delete user preferences
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .collect();

    for (const pref of preferences) {
      await ctx.db.delete(pref._id);
      deleted.preferences++;
    }

    // Delete user roles (userRoles uses Better Auth userId, not profile._id)
    const userRoles = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const role of userRoles) {
      await ctx.db.delete(role._id);
      deleted.userRoles++;
    }

    // Delete user suggestions
    const userSuggestions = await ctx.db
      .query("userSuggestions")
      .withIndex("by_user_and_status", (q) => q.eq("userId", profile._id))
      .collect();

    for (const suggestion of userSuggestions) {
      await ctx.db.delete(suggestion._id);
      deleted.userSuggestions++;
    }

    // Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
      deleted.notifications++;
    }

    // =========================================================================
    // 2. Get all household memberships and identify households to delete
    // =========================================================================

    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    // Collect household IDs where user is primary contact (we'll delete these)
    const householdsToDelete: Id<"households">[] = [];

    for (const membership of memberships) {
      const household = await ctx.db.get(membership.householdId);
      if (household && household.primaryContactId === profile._id) {
        householdsToDelete.push(household._id);
      }
      // Delete the membership
      await ctx.db.delete(membership._id);
      deleted.memberships++;
    }

    // =========================================================================
    // 3. Delete households where user is primary contact (and all related data)
    // =========================================================================

    for (const householdId of householdsToDelete) {
      const household = await ctx.db.get(householdId);
      if (!household) continue;

      // --- Vault Data ---

      // Delete all vault documents
      // Note: B2 files are NOT deleted here - they need separate cleanup
      const documents = await ctx.db
        .query("vaultDocuments")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const doc of documents) {
        await ctx.db.delete(doc._id);
        deleted.documents++;
      }

      // Delete vault categories
      const categories = await ctx.db
        .query("vaultCategories")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const cat of categories) {
        await ctx.db.delete(cat._id);
        deleted.categories++;
      }

      // --- Family Data ---

      // Delete all family members
      const familyMembers = await ctx.db
        .query("familyMembers")
        .withIndex("by_household_and_status", (q) => q.eq("householdId", householdId))
        .collect();

      for (const member of familyMembers) {
        await ctx.db.delete(member._id);
        deleted.familyMembers++;
      }

      // Delete all family units
      const familyUnits = await ctx.db
        .query("familyUnits")
        .withIndex("by_household_and_orderIndex", (q) => q.eq("householdId", householdId))
        .collect();

      for (const unit of familyUnits) {
        await ctx.db.delete(unit._id);
        deleted.familyUnits++;
      }

      // --- Wisdom & Letters ---

      // Delete wisdom entries
      const wisdomEntries = await ctx.db
        .query("wisdomEntries")
        .withIndex("by_household_and_category", (q) => q.eq("householdId", householdId))
        .collect();

      for (const entry of wisdomEntries) {
        await ctx.db.delete(entry._id);
        deleted.wisdomEntries++;
      }

      // Delete letters
      const letters = await ctx.db
        .query("letters")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const letter of letters) {
        await ctx.db.delete(letter._id);
        deleted.letters++;
      }

      // Delete core beliefs
      const coreBeliefs = await ctx.db
        .query("coreBeliefs")
        .withIndex("by_household_and_orderIndex", (q) => q.eq("householdId", householdId))
        .collect();

      for (const belief of coreBeliefs) {
        await ctx.db.delete(belief._id);
        deleted.coreBeliefs++;
      }

      // --- Legacy Planning ---

      // Delete key contacts first (they reference legacy plans)
      const keyContacts = await ctx.db
        .query("keyContacts")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const contact of keyContacts) {
        await ctx.db.delete(contact._id);
        deleted.keyContacts++;
      }

      // Delete legacy plans
      const legacyPlans = await ctx.db
        .query("legacyPlans")
        .withIndex("by_household_and_user", (q) => q.eq("householdId", householdId))
        .collect();

      for (const plan of legacyPlans) {
        await ctx.db.delete(plan._id);
        deleted.legacyPlans++;
      }

      // --- Financial Data ---

      // Delete financial accounts
      const financialAccounts = await ctx.db
        .query("financialAccounts")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const account of financialAccounts) {
        await ctx.db.delete(account._id);
        deleted.financialAccounts++;
      }

      // Delete properties
      const properties = await ctx.db
        .query("properties")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const property of properties) {
        await ctx.db.delete(property._id);
        deleted.properties++;
      }

      // Delete insurance policies
      const insurancePolicies = await ctx.db
        .query("insurancePolicies")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const policy of insurancePolicies) {
        await ctx.db.delete(policy._id);
        deleted.insurancePolicies++;
      }

      // Note: smartSuggestions are system-wide (not per-household), so we don't delete them here
      // User's dismissed/completed suggestions are tracked in userSuggestions (already deleted above)

      // --- Activity Logs ---

      // Delete activity logs
      const activityLogs = await ctx.db
        .query("activityLog")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const log of activityLogs) {
        await ctx.db.delete(log._id);
        deleted.activityLogs++;
      }

      // --- Household Memberships & Invitations ---

      // Delete all memberships for this household (from other users too)
      const allMemberships = await ctx.db
        .query("householdMemberships")
        .withIndex("by_household_and_status", (q) => q.eq("householdId", householdId))
        .collect();

      for (const m of allMemberships) {
        await ctx.db.delete(m._id);
        // Don't double-count - only count if it wasn't the test user's membership
        if (m.userId !== profile._id) {
          deleted.memberships++;
        }
      }

      // Delete all invitations for this household
      const householdInvitations = await ctx.db
        .query("householdInvitations")
        .withIndex("by_household_email_status", (q) => q.eq("householdId", householdId))
        .collect();

      for (const inv of householdInvitations) {
        await ctx.db.delete(inv._id);
        deleted.invitations++;
      }

      // --- Finally delete the household ---
      await ctx.db.delete(householdId);
      deleted.households++;
    }

    // =========================================================================
    // 4. Delete the profile itself
    // =========================================================================
    await ctx.db.delete(profile._id);
    deleted.profile = true;

    return {
      success: true,
      message: `Successfully reset test user ${email}`,
      deleted,
    };
  },
});

/**
 * Check if current user is in a clean state (no profile)
 * Useful for tests to verify cleanup worked
 */
/**
 * Grant admin role to current test user
 * Only works for test user emails (containing +clerk_test, etc.)
 * SECURITY: Disabled in production environments
 */
export const grantAdminRole = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    // Environment check - disable in production
    const convexUrl = process.env.CONVEX_CLOUD_URL || "";
    if (convexUrl.includes("prod") || convexUrl.includes("hushed-horse")) {
      return {
        success: false,
        message: "Test functions are disabled in production",
      };
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    const email = identity.email;
    if (!email) {
      return {
        success: false,
        message: "No email associated with user",
      };
    }

    // Security check - only allow test users
    const isTestUser = TEST_EMAIL_PATTERNS.some((pattern) => email.includes(pattern));
    if (!isTestUser) {
      return {
        success: false,
        message: "Admin role grant only allowed for test users",
      };
    }

    const userId = identity.subject;

    // Check if admin role already exists
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingRole) {
      if (existingRole.role === "admin") {
        return {
          success: true,
          message: "User already has admin role",
        };
      }
      // Update existing role to admin
      await ctx.db.patch(existingRole._id, { role: "admin" });
      return {
        success: true,
        message: "Updated existing role to admin",
      };
    }

    // Create new admin role
    await ctx.db.insert("userRoles", {
      userId,
      role: "admin",
    });

    return {
      success: true,
      message: `Granted admin role to ${email}`,
    };
  },
});

/**
 * Clean up test articles created during E2E tests
 * Deletes all articles with slugs starting with "e2e-test-"
 * Only works for authenticated test users
 * SECURITY: Disabled in production environments
 */
export const cleanupTestArticles = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    deletedCount: v.number(),
  }),
  handler: async (ctx) => {
    // Environment check - disable in production
    const convexUrl = process.env.CONVEX_CLOUD_URL || "";
    if (convexUrl.includes("prod") || convexUrl.includes("hushed-horse")) {
      return {
        success: false,
        message: "Test functions are disabled in production",
        deletedCount: 0,
      };
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        success: false,
        message: "Not authenticated",
        deletedCount: 0,
      };
    }

    const email = identity.email || "";

    // Security check - only allow test users
    const isTestUser = TEST_EMAIL_PATTERNS.some((pattern) =>
      email.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (!isTestUser) {
      return {
        success: false,
        message: "Article cleanup only allowed for test users",
        deletedCount: 0,
      };
    }

    // Find all articles with test patterns in slug or title
    const allArticles = await ctx.db.query("educationalArticles").collect();
    const testArticles = allArticles.filter(
      (article) =>
        article.slug.startsWith("e2e-") ||
        article.title.includes("E2E Test") ||
        article.title.includes("E2E Public Learn Test") ||
        article.title.includes("Test article for E2E") ||
        article.slug.includes("test-article"),
    );

    // Collect article IDs for batch cleanup of read records
    const testArticleIds = new Set(testArticles.map((a) => a._id));

    // Clean up read records for test articles (query all and filter since by_article index was removed)
    const allReadRecords = await ctx.db.query("userArticleReads").collect();
    for (const record of allReadRecords) {
      if (testArticleIds.has(record.articleId)) {
        await ctx.db.delete(record._id);
      }
    }

    let deletedCount = 0;
    for (const article of testArticles) {
      await ctx.db.delete(article._id);
      deletedCount++;
    }

    return {
      success: true,
      message: `Cleaned up ${deletedCount} test articles`,
      deletedCount,
    };
  },
});

/**
 * Admin cleanup function to remove ALL test articles
 * This does NOT require authentication - use only for manual cleanup
 *
 * Run manually with:
 *   npx convex run testing:adminCleanupTestArticles
 *
 * WARNING: This will delete all articles matching test patterns
 * SECURITY: Disabled in production environments
 */
export const adminCleanupTestArticles = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    deletedCount: v.number(),
  }),
  handler: async (ctx) => {
    // Environment check - disable in production
    const convexUrl = process.env.CONVEX_CLOUD_URL || "";
    if (convexUrl.includes("prod") || convexUrl.includes("hushed-horse")) {
      return {
        success: false,
        message: "Test functions are disabled in production",
        deletedCount: 0,
      };
    }

    // Find all articles with test patterns in slug or title
    const allArticles = await ctx.db.query("educationalArticles").collect();
    const testArticles = allArticles.filter(
      (article) =>
        article.slug.startsWith("e2e-") ||
        article.title.includes("E2E Test") ||
        article.title.includes("E2E Public Learn Test") ||
        article.title.includes("Test article for E2E") ||
        article.slug.includes("test-article"),
    );

    // Collect article IDs for batch cleanup of read records
    const testArticleIds = new Set(testArticles.map((a) => a._id));

    // Clean up read records for test articles (query all and filter since by_article index was removed)
    const allReadRecords = await ctx.db.query("userArticleReads").collect();
    for (const record of allReadRecords) {
      if (testArticleIds.has(record.articleId)) {
        await ctx.db.delete(record._id);
      }
    }

    let deletedCount = 0;
    for (const article of testArticles) {
      await ctx.db.delete(article._id);
      deletedCount++;
    }

    return {
      success: true,
      message: `Admin cleanup: removed ${deletedCount} test articles`,
      deletedCount,
    };
  },
});

/**
 * Set subscription tier override for test user's household
 * This allows E2E tests to test features that require higher tier subscriptions
 *
 * SECURITY: Only works for test user emails (containing +clerk_test, etc.)
 * SECURITY: Disabled in production environments
 */
export const setTestSubscriptionTier = mutation({
  args: {
    tier: v.union(
      v.literal("foundations"),
      v.literal("heritage"),
      v.literal("legacy"),
      v.literal("founders"),
    ),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Environment check - disable in production
    const convexUrl = process.env.CONVEX_CLOUD_URL || "";
    if (convexUrl.includes("prod") || convexUrl.includes("hushed-horse")) {
      return {
        success: false,
        message: "Test functions are disabled in production",
      };
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    const email = identity.email || "";
    const userId = identity.subject;

    // Security check - only allow test users
    const isTestUser = TEST_EMAIL_PATTERNS.some((pattern) =>
      email.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (!isTestUser) {
      return {
        success: false,
        message: `Security: Only test users can have tier overrides. Email must contain one of: ${TEST_EMAIL_PATTERNS.join(", ")}`,
      };
    }

    // Find user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return {
        success: false,
        message: "User profile not found. Complete onboarding first.",
      };
    }

    // Find user's household (as primary contact)
    const household = await ctx.db
      .query("households")
      .withIndex("by_primaryContactId", (q) => q.eq("primaryContactId", profile._id))
      .first();

    if (!household) {
      return {
        success: false,
        message: "No household found. Complete onboarding first.",
      };
    }

    // Set the tier override
    await ctx.db.patch(household._id, {
      tierOverride: args.tier,
      tierOverrideReason: "E2E Testing",
      tierOverrideExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expires in 24 hours
    });

    return {
      success: true,
      message: `Subscription tier override set to ${args.tier}`,
    };
  },
});

export const isCleanState = mutation({
  args: {},
  returns: v.object({
    isClean: v.boolean(),
    hasProfile: v.boolean(),
    hasMemberships: v.boolean(),
    hasHouseholds: v.boolean(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isClean: true,
        hasProfile: false,
        hasMemberships: false,
        hasHouseholds: false,
      };
    }

    const userId = identity.subject;

    // Check for profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return {
        isClean: true,
        hasProfile: false,
        hasMemberships: false,
        hasHouseholds: false,
      };
    }

    // Check for memberships
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    // Check for owned households
    const ownedHouseholds = await ctx.db
      .query("households")
      .withIndex("by_primaryContactId", (q) => q.eq("primaryContactId", profile._id))
      .collect();

    return {
      isClean: false,
      hasProfile: true,
      hasMemberships: memberships.length > 0,
      hasHouseholds: ownedHouseholds.length > 0,
    };
  },
});
