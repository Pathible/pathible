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
  subscriptions: v.number(),
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
  subscriptions: 0,
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
 * - Notifications and subscriptions
 * - User roles
 *
 * Note: B2 files are NOT deleted here - they need separate cleanup
 *
 * SECURITY: Only works for test user emails (containing +clerk_test, etc.)
 */
export const resetTestUser = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    deleted: deletedSchema,
  }),
  handler: async (ctx) => {
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
      console.warn(`[Testing] Blocked reset attempt for non-test user: ${email}`);
      return {
        success: false,
        message: `Security: Only test users can be reset. Email must contain one of: ${TEST_EMAIL_PATTERNS.join(", ")}`,
        deleted: { ...emptyDeleted },
      };
    }

    console.log(`[Testing] Resetting test user: ${email} (${userId})`);

    const deleted = { ...emptyDeleted };

    // Find the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      console.log(`[Testing] No profile found for user ${userId} - already clean`);
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
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
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
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const member of familyMembers) {
        await ctx.db.delete(member._id);
        deleted.familyMembers++;
      }

      // Delete all family units
      const familyUnits = await ctx.db
        .query("familyUnits")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const unit of familyUnits) {
        await ctx.db.delete(unit._id);
        deleted.familyUnits++;
      }

      // --- Wisdom & Letters ---

      // Delete wisdom entries
      const wisdomEntries = await ctx.db
        .query("wisdomEntries")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
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
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
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
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
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

      // --- Subscriptions ---

      // Delete subscriptions
      const subscriptions = await ctx.db
        .query("subscriptions")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      for (const subscription of subscriptions) {
        await ctx.db.delete(subscription._id);
        deleted.subscriptions++;
      }

      // --- Household Memberships & Invitations ---

      // Delete all memberships for this household (from other users too)
      const allMemberships = await ctx.db
        .query("householdMemberships")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
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
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
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

    console.log(`[Testing] Reset complete for ${email}:`, deleted);

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
