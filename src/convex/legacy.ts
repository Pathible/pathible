import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireHouseholdAccess, requireSubscriptionTier } from "./auth";
import { requireNotInEstateMode } from "./estateHelpers";
import { logActivity } from "./shared/activity";
import { EMAIL_REGEX } from "./shared/validators";

/**
 * Legacy Planning functions
 *
 * Provides queries and mutations for managing legacy planning data.
 * Each authenticated user can have one legacy plan per household.
 */

// ============================================================================
// VALIDATORS
// ============================================================================

const keyContactRoleValidator = v.union(
  // Professional roles
  v.literal("attorney"),
  v.literal("financial_advisor"),
  v.literal("executor"),
  v.literal("trustee"),
  v.literal("guardian"),
  v.literal("healthcare_proxy"),
  // Personal contact roles
  v.literal("friend"),
  v.literal("neighbor"),
  v.literal("business_partner"),
  v.literal("caregiver"),
  v.literal("charitable_org"),
  v.literal("religious_org"),
  v.literal("other"),
);

const legacyPlanValidator = v.object({
  _id: v.id("legacyPlans"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  userId: v.id("profiles"),
  trustedContacts: v.optional(v.string()),
  guardians: v.optional(v.string()),
  petCare: v.optional(v.string()),
  memorial: v.optional(v.string()),
  finalMessage: v.optional(v.string()),
  isComplete: v.boolean(),
  completionPercentage: v.number(),
  updatedAt: v.number(),
});

const keyContactValidator = v.object({
  _id: v.id("keyContacts"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  legacyPlanId: v.optional(v.id("legacyPlans")),
  name: v.string(),
  role: keyContactRoleValidator,
  relationship: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  notes: v.optional(v.string()),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the current user's legacy plan for a household
 * Returns null if no plan exists yet
 */
export const get = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.union(legacyPlanValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Verify household access
    await requireHouseholdAccess(ctx, args.householdId);

    // Get the user's legacy plan for this household
    const plan = await ctx.db
      .query("legacyPlans")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", profile._id),
      )
      .unique();

    return plan;
  },
});

/**
 * Get key contacts for a legacy plan
 */
export const getKeyContacts = query({
  args: {
    householdId: v.id("households"),
    legacyPlanId: v.id("legacyPlans"),
  },
  returns: v.array(keyContactValidator),
  handler: async (ctx, args) => {
    // Verify authentication and household access
    await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    // Verify the legacy plan belongs to this household
    const plan = await ctx.db.get(args.legacyPlanId);
    if (!plan || plan.householdId !== args.householdId) {
      throw new Error("Access denied: Legacy plan not found in this household");
    }

    // Get key contacts for this legacy plan
    const contacts = await ctx.db
      .query("keyContacts")
      .withIndex("by_legacyPlan", (q) => q.eq("legacyPlanId", args.legacyPlanId))
      .collect();

    return contacts;
  },
});

/**
 * Get legacy planning stats for a household
 */
export const getStats = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    hasLegacyPlan: v.boolean(),
    isComplete: v.boolean(),
    completionPercentage: v.number(),
    keyContactsCount: v.number(),
    lastUpdated: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Verify household access
    await requireHouseholdAccess(ctx, args.householdId);

    // Get the user's legacy plan
    const plan = await ctx.db
      .query("legacyPlans")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", profile._id),
      )
      .unique();

    if (!plan) {
      return {
        hasLegacyPlan: false,
        isComplete: false,
        completionPercentage: 0,
        keyContactsCount: 0,
        lastUpdated: null,
      };
    }

    // Count key contacts
    const contacts = await ctx.db
      .query("keyContacts")
      .withIndex("by_legacyPlan", (q) => q.eq("legacyPlanId", plan._id))
      .collect();

    return {
      hasLegacyPlan: true,
      isComplete: plan.isComplete,
      completionPercentage: plan.completionPercentage,
      keyContactsCount: contacts.length,
      lastUpdated: plan.updatedAt,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create or initialize a legacy plan
 *
 * SECURITY: Requires Legacy tier subscription (premium feature)
 */
export const create = mutation({
  args: {
    householdId: v.id("households"),
  },
  returns: v.id("legacyPlans"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Verify household access
    await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require Legacy tier subscription
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    // Check if a plan already exists
    const existing = await ctx.db
      .query("legacyPlans")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", profile._id),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    // Create new legacy plan
    const planId = await ctx.db.insert("legacyPlans", {
      householdId: args.householdId,
      userId: profile._id,
      isComplete: false,
      completionPercentage: 0,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "legacy",
      actionType: "plan_updated",
      entityType: "plan",
      entityId: planId,
      description: "Started legacy planning",
    });

    return planId;
  },
});

/**
 * Update a specific section of the legacy plan
 *
 * SECURITY: Requires Legacy tier subscription (premium feature)
 */
export const updateSection = mutation({
  args: {
    householdId: v.id("households"),
    section: v.union(
      v.literal("trustedContacts"),
      v.literal("guardians"),
      v.literal("petCare"),
      v.literal("memorial"),
      v.literal("finalMessage"),
    ),
    content: v.string(),
  },
  returns: v.id("legacyPlans"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Verify household access
    await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require Legacy tier subscription
    const updateSectionHousehold = await requireSubscriptionTier(ctx, args.householdId, "legacy");
    requireNotInEstateMode(updateSectionHousehold);

    // Validate content length (50KB max)
    if (args.content.length > 50000) {
      throw new Error("Content exceeds maximum length of 50,000 characters");
    }

    // Get or create the legacy plan
    const plan = await ctx.db
      .query("legacyPlans")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", profile._id),
      )
      .unique();

    // Helper to calculate completion percentage
    const sections = ["trustedContacts", "guardians", "memorial", "finalMessage"] as const;
    const calculateCompletion = (
      planData: Record<string, string | undefined>,
      newSection: string,
      newContent: string,
    ) => {
      const updatedData = { ...planData, [newSection]: newContent };
      const filledSections = sections.filter((s) => updatedData[s]?.trim());
      return Math.round((filledSections.length / sections.length) * 100);
    };

    if (!plan) {
      // Create new plan with section and completion in one atomic insert
      const completionPercentage = calculateCompletion({}, args.section, args.content);
      const planId = await ctx.db.insert("legacyPlans", {
        householdId: args.householdId,
        userId: profile._id,
        [args.section]: args.content,
        isComplete: completionPercentage === 100,
        completionPercentage,
        updatedAt: Date.now(),
      });

      return planId;
    }

    // Calculate completion with the new content
    const completionPercentage = calculateCompletion(
      {
        trustedContacts: plan.trustedContacts,
        guardians: plan.guardians,
        memorial: plan.memorial,
        finalMessage: plan.finalMessage,
      },
      args.section,
      args.content,
    );

    // Atomic update: section content + completion in single patch
    await ctx.db.patch(plan._id, {
      [args.section]: args.content,
      completionPercentage,
      isComplete: completionPercentage === 100,
      updatedAt: Date.now(),
    });

    return plan._id;
  },
});

/**
 * Mark the legacy plan as complete
 *
 * SECURITY: Requires Legacy tier subscription (premium feature)
 */
export const markComplete = mutation({
  args: {
    householdId: v.id("households"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Verify household access
    await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require Legacy tier subscription
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    // Get the legacy plan
    const plan = await ctx.db
      .query("legacyPlans")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", profile._id),
      )
      .unique();

    if (!plan) {
      throw new Error("Legacy plan not found");
    }

    // Mark as complete
    await ctx.db.patch(plan._id, {
      isComplete: true,
      completionPercentage: 100,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "legacy",
      actionType: "plan_updated",
      entityType: "plan",
      entityId: plan._id,
      description: "Completed legacy planning",
    });

    return null;
  },
});

/**
 * Reset completion status to allow editing
 *
 * SECURITY: Requires Legacy tier subscription (premium feature)
 */
export const resetCompletion = mutation({
  args: {
    householdId: v.id("households"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Verify household access
    await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require Legacy tier subscription
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    // Get the legacy plan
    const plan = await ctx.db
      .query("legacyPlans")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", profile._id),
      )
      .unique();

    if (!plan) {
      throw new Error("Legacy plan not found");
    }

    // Recalculate completion percentage
    const sections = ["trustedContacts", "guardians", "memorial", "finalMessage"] as const;
    const filledSections = sections.filter((s) => plan[s] && plan[s].trim().length > 0);
    const completionPercentage = Math.round((filledSections.length / sections.length) * 100);

    // Reset completion status
    await ctx.db.patch(plan._id, {
      isComplete: false,
      completionPercentage,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// ============================================================================
// KEY CONTACTS MUTATIONS
// ============================================================================

/**
 * Add a key contact to the legacy plan
 *
 * SECURITY: Requires Legacy tier subscription (premium feature)
 */
export const addKeyContact = mutation({
  args: {
    householdId: v.id("households"),
    legacyPlanId: v.id("legacyPlans"),
    name: v.string(),
    role: keyContactRoleValidator,
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("keyContacts"),
  handler: async (ctx, args) => {
    // Verify authentication and household access
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require Legacy tier subscription
    const addContactHousehold = await requireSubscriptionTier(ctx, args.householdId, "legacy");
    requireNotInEstateMode(addContactHousehold);

    // Verify the legacy plan exists and belongs to this household
    const plan = await ctx.db.get(args.legacyPlanId);
    if (!plan || plan.householdId !== args.householdId) {
      throw new Error("Access denied: Legacy plan not found in this household");
    }

    // Validate inputs
    if (!args.name.trim()) {
      throw new Error("Contact name is required");
    }

    // Validate email format if provided
    if (args.email?.trim() && !EMAIL_REGEX.test(args.email.trim())) {
      throw new Error("Invalid email format");
    }

    // Create the key contact
    const contactId = await ctx.db.insert("keyContacts", {
      householdId: args.householdId,
      legacyPlanId: args.legacyPlanId,
      name: args.name.trim(),
      role: args.role,
      phone: args.phone?.trim() || undefined,
      email: args.email?.trim() || undefined,
      address: args.address?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
    });

    // Update the legacy plan's updated timestamp
    await ctx.db.patch(args.legacyPlanId, {
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "legacy",
      actionType: "plan_updated",
      entityType: "plan",
      entityId: args.legacyPlanId,
      description: `Added key contact: ${args.name.trim()}`,
    });

    return contactId;
  },
});

/**
 * Update a key contact
 *
 * SECURITY: Requires Legacy tier subscription (premium feature)
 */
export const updateKeyContact = mutation({
  args: {
    householdId: v.id("households"),
    contactId: v.id("keyContacts"),
    name: v.optional(v.string()),
    role: v.optional(keyContactRoleValidator),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify authentication and household access
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require Legacy tier subscription
    const updateContactHousehold = await requireSubscriptionTier(ctx, args.householdId, "legacy");
    requireNotInEstateMode(updateContactHousehold);

    // Get the contact
    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.householdId !== args.householdId) {
      throw new Error("Access denied: Contact not found in this household");
    }

    // Build update object
    const updates: {
      name?: string;
      role?: (typeof keyContactRoleValidator)["type"];
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
    } = {};

    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Contact name cannot be empty");
      }
      updates.name = args.name.trim();
    }

    if (args.role !== undefined) {
      updates.role = args.role;
    }

    if (args.phone !== undefined) {
      updates.phone = args.phone.trim() || undefined;
    }

    if (args.email !== undefined) {
      if (args.email.trim() && !EMAIL_REGEX.test(args.email.trim())) {
        throw new Error("Invalid email format");
      }
      updates.email = args.email.trim() || undefined;
    }

    if (args.address !== undefined) {
      updates.address = args.address.trim() || undefined;
    }

    if (args.notes !== undefined) {
      updates.notes = args.notes.trim() || undefined;
    }

    // Update the contact
    await ctx.db.patch(args.contactId, updates);

    // Update the legacy plan's updated timestamp (if linked to a plan)
    if (contact.legacyPlanId) {
      await ctx.db.patch(contact.legacyPlanId, {
        updatedAt: Date.now(),
      });

      await logActivity(ctx, {
        householdId: args.householdId,
        userId: profile._id,
        module: "legacy",
        actionType: "plan_updated",
        entityType: "plan",
        entityId: contact.legacyPlanId,
        description: `Updated key contact: ${contact.name}`,
      });
    }

    return null;
  },
});

/**
 * Delete a key contact
 *
 * SECURITY: Requires Legacy tier subscription (premium feature)
 */
export const deleteKeyContact = mutation({
  args: {
    householdId: v.id("households"),
    contactId: v.id("keyContacts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify authentication and household access
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require Legacy tier subscription
    const deleteContactHousehold = await requireSubscriptionTier(ctx, args.householdId, "legacy");
    requireNotInEstateMode(deleteContactHousehold);

    // Get the contact
    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.householdId !== args.householdId) {
      throw new Error("Access denied: Contact not found in this household");
    }

    // Store contact name before deletion for activity log
    const contactName = contact.name;
    const legacyPlanId = contact.legacyPlanId;

    // Delete the contact
    await ctx.db.delete(args.contactId);

    // Update the legacy plan's updated timestamp (if linked to a plan)
    if (legacyPlanId) {
      await ctx.db.patch(legacyPlanId, {
        updatedAt: Date.now(),
      });
    }

    // Log activity
    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "legacy",
      actionType: "plan_updated",
      entityType: "plan",
      entityId: legacyPlanId,
      description: `Deleted key contact: ${contactName}`,
    });

    return null;
  },
});
