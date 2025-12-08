import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireHouseholdAccess } from "./auth";

/**
 * Family Ecosystem - Family Unit & Member Management
 *
 * This module provides comprehensive family ecosystem management including:
 * - Family units (sub-groups within households)
 * - Family members (individuals in family units, linked or unlinked to profiles)
 * - Relationship tracking and role assignment
 * - Activity logging for all changes
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const relationshipTypeValidator = v.union(
  v.literal("parent"),
  v.literal("child"),
  v.literal("spouse"),
  v.literal("partner"),
  v.literal("sibling"),
  v.literal("grandparent"),
  v.literal("grandchild"),
  v.literal("aunt_uncle"),
  v.literal("niece_nephew"),
  v.literal("cousin"),
  v.literal("in_law"),
  v.literal("other"),
);

const genderValidator = v.union(
  v.literal("male"),
  v.literal("female"),
  v.literal("non_binary"),
  v.literal("prefer_not_to_say"),
  v.literal("other"),
);

const memberStatusValidator = v.union(
  v.literal("active"),
  v.literal("pending_invite"),
  v.literal("inactive"),
);

// Return type validators
const familyUnitReturnValidator = v.object({
  _id: v.id("familyUnits"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  name: v.string(),
  description: v.optional(v.string()),
  relationshipToHousehold: v.optional(v.string()),
  isPrimary: v.boolean(),
  orderIndex: v.number(),
  createdBy: v.id("profiles"),
  updatedAt: v.number(),
});

const familyUnitWithPreviewReturnValidator = v.object({
  _id: v.id("familyUnits"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  name: v.string(),
  description: v.optional(v.string()),
  relationshipToHousehold: v.optional(v.string()),
  isPrimary: v.boolean(),
  orderIndex: v.number(),
  createdBy: v.id("profiles"),
  updatedAt: v.number(),
  memberCount: v.number(),
  memberPreview: v.array(
    v.object({
      _id: v.id("familyMembers"),
      firstName: v.string(),
      lastName: v.string(),
      avatarUrl: v.optional(v.string()),
    }),
  ),
});

const familyMemberReturnValidator = v.object({
  _id: v.id("familyMembers"),
  _creationTime: v.number(),
  familyUnitId: v.id("familyUnits"),
  householdId: v.id("households"),
  profileId: v.optional(v.id("profiles")),
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  gender: v.optional(genderValidator),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  relationshipType: relationshipTypeValidator,
  roles: v.array(v.string()),
  status: memberStatusValidator,
  orderIndex: v.number(),
  notes: v.optional(v.string()),
  createdBy: v.id("profiles"),
  updatedAt: v.number(),
});

const familyMemberWithProfileReturnValidator = v.object({
  _id: v.id("familyMembers"),
  _creationTime: v.number(),
  familyUnitId: v.id("familyUnits"),
  householdId: v.id("households"),
  profileId: v.optional(v.id("profiles")),
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  gender: v.optional(genderValidator),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  relationshipType: relationshipTypeValidator,
  roles: v.array(v.string()),
  status: memberStatusValidator,
  orderIndex: v.number(),
  notes: v.optional(v.string()),
  createdBy: v.id("profiles"),
  updatedAt: v.number(),
  // Enriched profile data (if linked)
  profile: v.optional(
    v.object({
      _id: v.id("profiles"),
      userId: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      avatarUrl: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
  ),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all family units for a household with member counts and preview
 * Returns family units ordered by orderIndex (ascending)
 * Returns null if user is not authenticated (handles auth race conditions)
 */
export const listFamilyUnits = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.union(v.array(familyUnitWithPreviewReturnValidator), v.null()),
  handler: async (ctx, args) => {
    // Handle auth race conditions gracefully
    try {
      await requireHouseholdAccess(ctx, args.householdId);
    } catch {
      // Return null if auth isn't ready yet (race condition)
      return null;
    }

    // Get all family units for the household, ordered by orderIndex
    const familyUnits = await ctx.db
      .query("familyUnits")
      .withIndex("by_household_and_orderIndex", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Fetch ALL active members for ALL family units in one query (avoids N+1)
    const allMembers = await ctx.db
      .query("familyMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Group members by familyUnitId in memory
    const membersByUnit = new Map<string, typeof allMembers>();
    for (const member of allMembers) {
      const unitId = member.familyUnitId;
      const existing = membersByUnit.get(unitId);
      if (existing) {
        existing.push(member);
      } else {
        membersByUnit.set(unitId, [member]);
      }
    }

    // Enrich family units with member counts and preview
    const enrichedUnits = familyUnits.map((unit) => {
      const unitMembers = membersByUnit.get(unit._id) || [];
      // Sort by orderIndex and take first 2 for preview
      unitMembers.sort((a, b) => a.orderIndex - b.orderIndex);

      const memberPreview = unitMembers.slice(0, 2).map((member) => ({
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        avatarUrl: member.avatarUrl,
      }));

      return {
        ...unit,
        memberCount: unitMembers.length,
        memberPreview,
      };
    });

    return enrichedUnits;
  },
});

/**
 * Get a single family unit with full details
 * Returns null if user is not authenticated (handles auth race conditions)
 */
export const getFamilyUnit = query({
  args: {
    familyUnitId: v.id("familyUnits"),
  },
  returns: v.union(familyUnitReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const familyUnit = await ctx.db.get(args.familyUnitId);
    if (!familyUnit) {
      return null;
    }

    // Verify household access (handle auth race conditions)
    try {
      await requireHouseholdAccess(ctx, familyUnit.householdId);
    } catch {
      return null;
    }

    return familyUnit;
  },
});

/**
 * List all active members of a family unit
 * Returns members ordered by orderIndex (ascending)
 * Returns null if family unit not found or user not authenticated (handles auth race conditions)
 */
export const listFamilyMembers = query({
  args: {
    familyUnitId: v.id("familyUnits"),
  },
  returns: v.union(v.array(familyMemberReturnValidator), v.null()),
  handler: async (ctx, args) => {
    const familyUnit = await ctx.db.get(args.familyUnitId);
    if (!familyUnit) {
      return null;
    }

    // Verify household access (handle auth race conditions)
    try {
      await requireHouseholdAccess(ctx, familyUnit.householdId);
    } catch {
      return null;
    }

    // Get all active members for this family unit
    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_familyUnit_and_status", (q) =>
        q.eq("familyUnitId", args.familyUnitId).eq("status", "active"),
      )
      .collect();

    // Sort by orderIndex (should already be sorted by index, but ensure it)
    return members.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

/**
 * Get a single family member with profile data if linked
 * Returns null if member not found or user not authenticated (handles auth race conditions)
 */
export const getFamilyMember = query({
  args: {
    memberId: v.id("familyMembers"),
  },
  returns: v.union(familyMemberWithProfileReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      return null;
    }

    // Verify household access (handle auth race conditions)
    try {
      await requireHouseholdAccess(ctx, member.householdId);
    } catch {
      return null;
    }

    // If member is linked to a profile, fetch profile data
    let profile:
      | {
          _id: Doc<"profiles">["_id"];
          userId: string;
          firstName: string;
          lastName: string;
          avatarUrl?: string;
          phone?: string;
        }
      | undefined;
    if (member.profileId) {
      const profileDoc = await ctx.db.get(member.profileId);
      if (profileDoc) {
        profile = {
          _id: profileDoc._id,
          userId: profileDoc.userId,
          firstName: profileDoc.firstName,
          lastName: profileDoc.lastName,
          avatarUrl: profileDoc.avatarUrl,
          phone: profileDoc.phone,
        };
      }
    }

    return {
      ...member,
      profile,
    };
  },
});

// ============================================================================
// MUTATIONS - FAMILY UNITS
// ============================================================================

/**
 * Create a new family unit
 */
export const createFamilyUnit = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
    description: v.optional(v.string()),
    relationshipToHousehold: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  returns: v.id("familyUnits"),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // Validate inputs
    if (!args.name.trim()) {
      throw new Error("Family unit name is required");
    }

    if (args.name.length > 100) {
      throw new Error("Family unit name is too long (max 100 characters)");
    }

    if (args.description && args.description.length > 500) {
      throw new Error("Description is too long (max 500 characters)");
    }

    if (args.relationshipToHousehold && args.relationshipToHousehold.length > 100) {
      throw new Error("Relationship description is too long (max 100 characters)");
    }

    // Get current max orderIndex for this household
    const existingUnits = await ctx.db
      .query("familyUnits")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const maxOrderIndex = existingUnits.reduce((max, unit) => Math.max(max, unit.orderIndex), -1);

    // Create the family unit
    const familyUnitId = await ctx.db.insert("familyUnits", {
      householdId: args.householdId,
      name: args.name.trim(),
      description: args.description?.trim(),
      relationshipToHousehold: args.relationshipToHousehold?.trim(),
      isPrimary: args.isPrimary ?? false,
      orderIndex: maxOrderIndex + 1,
      createdBy: profile._id,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: args.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: familyUnitId,
      description: `Created family unit: ${args.name}`,
    });

    return familyUnitId;
  },
});

/**
 * Update a family unit
 */
export const updateFamilyUnit = mutation({
  args: {
    familyUnitId: v.id("familyUnits"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    relationshipToHousehold: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  returns: v.id("familyUnits"),
  handler: async (ctx, args) => {
    const familyUnit = await ctx.db.get(args.familyUnitId);
    if (!familyUnit) {
      throw new Error("Family unit not found");
    }

    await requireHouseholdAccess(ctx, familyUnit.householdId);
    const { profile } = await requireAuth(ctx);

    // Build update object
    const updates: Partial<Doc<"familyUnits">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Family unit name cannot be empty");
      }
      if (args.name.length > 100) {
        throw new Error("Family unit name is too long (max 100 characters)");
      }
      updates.name = args.name.trim();
    }

    if (args.description !== undefined) {
      if (args.description && args.description.length > 500) {
        throw new Error("Description is too long (max 500 characters)");
      }
      updates.description = args.description?.trim();
    }

    if (args.relationshipToHousehold !== undefined) {
      if (args.relationshipToHousehold && args.relationshipToHousehold.length > 100) {
        throw new Error("Relationship description is too long (max 100 characters)");
      }
      updates.relationshipToHousehold = args.relationshipToHousehold?.trim();
    }

    if (args.isPrimary !== undefined) {
      updates.isPrimary = args.isPrimary;
    }

    // Update the family unit
    await ctx.db.patch(args.familyUnitId, updates);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: familyUnit.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: args.familyUnitId,
      description: `Updated family unit: ${updates.name || familyUnit.name}`,
    });

    return args.familyUnitId;
  },
});

/**
 * Delete a family unit and all its members
 */
export const deleteFamilyUnit = mutation({
  args: {
    familyUnitId: v.id("familyUnits"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const familyUnit = await ctx.db.get(args.familyUnitId);
    if (!familyUnit) {
      throw new Error("Family unit not found");
    }

    await requireHouseholdAccess(ctx, familyUnit.householdId);
    const { profile } = await requireAuth(ctx);

    // Get all members of this family unit
    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_familyUnit", (q) => q.eq("familyUnitId", args.familyUnitId))
      .collect();

    // Delete all members
    await Promise.all(members.map((member) => ctx.db.delete(member._id)));

    // Delete the family unit
    await ctx.db.delete(args.familyUnitId);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: familyUnit.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: args.familyUnitId,
      description: `Deleted family unit: ${familyUnit.name} (${members.length} members removed)`,
    });

    return null;
  },
});

// ============================================================================
// MUTATIONS - FAMILY MEMBERS
// ============================================================================

/**
 * Add a family member to a family unit
 */
export const addFamilyMember = mutation({
  args: {
    familyUnitId: v.id("familyUnits"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    relationshipType: relationshipTypeValidator,
    gender: v.optional(genderValidator),
    dateOfBirth: v.optional(v.number()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
  },
  returns: v.id("familyMembers"),
  handler: async (ctx, args) => {
    const familyUnit = await ctx.db.get(args.familyUnitId);
    if (!familyUnit) {
      throw new Error("Family unit not found");
    }

    await requireHouseholdAccess(ctx, familyUnit.householdId);
    const { profile } = await requireAuth(ctx);

    // Validate inputs
    if (!args.firstName.trim()) {
      throw new Error("First name is required");
    }

    if (!args.lastName.trim()) {
      throw new Error("Last name is required");
    }

    if (args.firstName.length > 100) {
      throw new Error("First name is too long (max 100 characters)");
    }

    if (args.lastName.length > 100) {
      throw new Error("Last name is too long (max 100 characters)");
    }

    // Validate email if provided
    if (args.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(args.email)) {
        throw new Error("Invalid email address");
      }
    }

    // Validate phone if provided
    if (args.phone && args.phone.length > 20) {
      throw new Error("Phone number is too long (max 20 characters)");
    }

    // Get current max orderIndex for this family unit
    const existingMembers = await ctx.db
      .query("familyMembers")
      .withIndex("by_familyUnit", (q) => q.eq("familyUnitId", args.familyUnitId))
      .collect();

    const maxOrderIndex = existingMembers.reduce(
      (max, member) => Math.max(max, member.orderIndex),
      -1,
    );

    // Create the family member
    const memberId = await ctx.db.insert("familyMembers", {
      familyUnitId: args.familyUnitId,
      householdId: familyUnit.householdId,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      email: args.email?.toLowerCase().trim(),
      phone: args.phone?.trim(),
      relationshipType: args.relationshipType,
      gender: args.gender,
      dateOfBirth: args.dateOfBirth,
      city: args.city?.trim(),
      state: args.state?.trim(),
      roles: args.roles || [],
      status: "active",
      orderIndex: maxOrderIndex + 1,
      createdBy: profile._id,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: familyUnit.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: memberId,
      description: `Added family member: ${args.firstName} ${args.lastName}`,
    });

    return memberId;
  },
});

/**
 * Update a family member
 */
export const updateFamilyMember = mutation({
  args: {
    memberId: v.id("familyMembers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    relationshipType: v.optional(relationshipTypeValidator),
    gender: v.optional(genderValidator),
    dateOfBirth: v.optional(v.number()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  returns: v.id("familyMembers"),
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Family member not found");
    }

    await requireHouseholdAccess(ctx, member.householdId);
    const { profile } = await requireAuth(ctx);

    // Build update object
    const updates: Partial<Doc<"familyMembers">> = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) {
      if (!args.firstName.trim()) {
        throw new Error("First name cannot be empty");
      }
      if (args.firstName.length > 100) {
        throw new Error("First name is too long (max 100 characters)");
      }
      updates.firstName = args.firstName.trim();
    }

    if (args.lastName !== undefined) {
      if (!args.lastName.trim()) {
        throw new Error("Last name cannot be empty");
      }
      if (args.lastName.length > 100) {
        throw new Error("Last name is too long (max 100 characters)");
      }
      updates.lastName = args.lastName.trim();
    }

    if (args.email !== undefined) {
      if (args.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
          throw new Error("Invalid email address");
        }
        updates.email = args.email.toLowerCase().trim();
      } else {
        updates.email = undefined;
      }
    }

    if (args.phone !== undefined) {
      if (args.phone && args.phone.length > 20) {
        throw new Error("Phone number is too long (max 20 characters)");
      }
      updates.phone = args.phone?.trim();
    }

    if (args.relationshipType !== undefined) {
      updates.relationshipType = args.relationshipType;
    }

    if (args.gender !== undefined) {
      updates.gender = args.gender;
    }

    if (args.dateOfBirth !== undefined) {
      updates.dateOfBirth = args.dateOfBirth;
    }

    if (args.city !== undefined) {
      updates.city = args.city?.trim();
    }

    if (args.state !== undefined) {
      updates.state = args.state?.trim();
    }

    if (args.roles !== undefined) {
      updates.roles = args.roles;
    }

    if (args.notes !== undefined) {
      if (args.notes && args.notes.length > 1000) {
        throw new Error("Notes are too long (max 1000 characters)");
      }
      updates.notes = args.notes?.trim();
    }

    // Update the family member
    await ctx.db.patch(args.memberId, updates);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: member.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: args.memberId,
      description: `Updated family member: ${updates.firstName || member.firstName} ${updates.lastName || member.lastName}`,
    });

    return args.memberId;
  },
});

/**
 * Remove a family member from a family unit
 */
export const removeFamilyMember = mutation({
  args: {
    memberId: v.id("familyMembers"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Family member not found");
    }

    await requireHouseholdAccess(ctx, member.householdId);
    const { profile } = await requireAuth(ctx);

    // Delete the family member
    await ctx.db.delete(args.memberId);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: member.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: args.memberId,
      description: `Removed family member: ${member.firstName} ${member.lastName}`,
    });

    return null;
  },
});

// ============================================================================
// MUTATIONS - ENSURE CURRENT USER IN PRIMARY FAMILY
// ============================================================================

/**
 * Ensure the current user is a member of the primary family unit
 * Creates the primary family unit if it doesn't exist
 * Adds the current user as a member if not already present
 * This should be called when a user visits the Family Ecosystem page
 */
export const ensureCurrentUserInPrimaryFamily = mutation({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    familyUnitId: v.id("familyUnits"),
    memberId: v.union(v.id("familyMembers"), v.null()),
    wasCreated: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { user, profile } = await requireAuth(ctx);

    // Get or create the primary family unit
    let primaryUnit = await ctx.db
      .query("familyUnits")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("isPrimary"), true))
      .first();

    let wasCreated = false;

    if (!primaryUnit) {
      // Create primary family unit
      const familyUnitId = await ctx.db.insert("familyUnits", {
        householdId: args.householdId,
        name: "Your Family",
        description: "Your immediate family",
        relationshipToHousehold: "Primary",
        isPrimary: true,
        orderIndex: 0,
        createdBy: profile._id,
        updatedAt: Date.now(),
      });

      primaryUnit = await ctx.db.get(familyUnitId);
      if (!primaryUnit) {
        throw new Error("Failed to create primary family unit");
      }
      wasCreated = true;
    }

    // Check if current user is already a member
    const existingMember = await ctx.db
      .query("familyMembers")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile._id))
      .filter((q) => q.eq(q.field("familyUnitId"), primaryUnit._id))
      .first();

    if (existingMember) {
      // User already exists in primary family
      return {
        familyUnitId: primaryUnit._id,
        memberId: null,
        wasCreated: false,
      };
    }

    // Get current max orderIndex
    const existingMembers = await ctx.db
      .query("familyMembers")
      .withIndex("by_familyUnit", (q) => q.eq("familyUnitId", primaryUnit._id))
      .collect();

    const maxOrderIndex = existingMembers.reduce(
      (max, member) => Math.max(max, member.orderIndex),
      -1,
    );

    // Add current user as a member
    const memberId = await ctx.db.insert("familyMembers", {
      familyUnitId: primaryUnit._id,
      householdId: args.householdId,
      profileId: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user.email,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      dateOfBirth: profile.dateOfBirth,
      city: profile.city,
      state: profile.state,
      relationshipType: "parent", // Default - user can update later
      roles: ["Family Admin"],
      status: "active",
      orderIndex: maxOrderIndex + 1,
      createdBy: profile._id,
      updatedAt: Date.now(),
    });

    return {
      familyUnitId: primaryUnit._id,
      memberId,
      wasCreated,
    };
  },
});

// ============================================================================
// QUERIES - PRIMARY FAMILY UNIT
// ============================================================================

/**
 * Get the primary family unit for a household
 * Returns null if not found or user not authenticated
 */
export const getPrimaryFamilyUnit = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.union(familyUnitReturnValidator, v.null()),
  handler: async (ctx, args) => {
    // Handle auth race conditions gracefully
    try {
      await requireHouseholdAccess(ctx, args.householdId);
    } catch {
      return null;
    }

    // Get the primary family unit
    const primaryUnit = await ctx.db
      .query("familyUnits")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("isPrimary"), true))
      .first();

    return primaryUnit;
  },
});

// ============================================================================
// MUTATIONS - INVITE TO PRIMARY FAMILY
// ============================================================================

/**
 * Invite a member to the primary family unit
 * This is the main entry point for inviting family members from the Family Ecosystem
 */
export const inviteToPrimaryFamily = mutation({
  args: {
    householdId: v.id("households"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    relationshipType: relationshipTypeValidator,
    gender: v.optional(genderValidator),
  },
  returns: v.id("familyMembers"),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // Validate inputs
    if (!args.firstName.trim()) {
      throw new Error("First name is required");
    }
    if (!args.lastName.trim()) {
      throw new Error("Last name is required");
    }
    if (!args.email.trim()) {
      throw new Error("Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email address");
    }

    // Get or create the primary family unit
    let primaryUnit = await ctx.db
      .query("familyUnits")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("isPrimary"), true))
      .first();

    if (!primaryUnit) {
      // Create primary family unit if it doesn't exist (for legacy households)
      const familyUnitId = await ctx.db.insert("familyUnits", {
        householdId: args.householdId,
        name: "Your Family",
        description: "Your immediate family",
        relationshipToHousehold: "Primary",
        isPrimary: true,
        orderIndex: 0,
        createdBy: profile._id,
        updatedAt: Date.now(),
      });

      primaryUnit = await ctx.db.get(familyUnitId);
      if (!primaryUnit) {
        throw new Error("Failed to create primary family unit");
      }
    }

    // Check if member with this email already exists in this family unit
    const existingMembers = await ctx.db
      .query("familyMembers")
      .withIndex("by_familyUnit", (q) => q.eq("familyUnitId", primaryUnit._id))
      .collect();

    const existingMember = existingMembers.find(
      (m) => m.email?.toLowerCase() === args.email.toLowerCase(),
    );

    if (existingMember) {
      throw new Error("A member with this email already exists in your family");
    }

    // Get current max orderIndex
    const maxOrderIndex = existingMembers.reduce(
      (max, member) => Math.max(max, member.orderIndex),
      -1,
    );

    // Create the family member as active (direct add, not email invitation)
    const memberId = await ctx.db.insert("familyMembers", {
      familyUnitId: primaryUnit._id,
      householdId: args.householdId,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      email: args.email.toLowerCase().trim(),
      phone: args.phone?.trim(),
      gender: args.gender,
      relationshipType: args.relationshipType,
      roles: [],
      status: "active",
      orderIndex: maxOrderIndex + 1,
      createdBy: profile._id,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: args.householdId,
      userId: profile._id,
      actionType: "member_invited",
      entityType: "other",
      entityId: memberId,
      description: `Invited ${args.firstName} ${args.lastName} to primary family`,
    });

    return memberId;
  },
});
