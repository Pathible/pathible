import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireHouseholdAccess } from "./auth";
import { logActivity } from "./shared/activity";

/**
 * Family Tree - Tree visualization queries and mutations
 *
 * This module provides:
 * - Tree data fetching (members with positions + relationships)
 * - Position persistence for drag-and-drop
 * - Relationship CRUD for the tree graph
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const relationshipTypeValidator = v.union(
  v.literal("parent_of"),
  v.literal("spouse_of"),
  v.literal("partner_of"),
);

const genderValidator = v.union(
  v.literal("male"),
  v.literal("female"),
  v.literal("prefer_not_to_say"),
);

const memberStatusValidator = v.union(
  v.literal("active"),
  v.literal("pending_invite"),
  v.literal("inactive"),
);

const memberRelationshipTypeValidator = v.union(
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

// Return type validators for tree data
const treeMemberValidator = v.object({
  _id: v.id("familyMembers"),
  _creationTime: v.number(),
  familyUnitId: v.id("familyUnits"),
  householdId: v.id("households"),
  profileId: v.optional(v.id("profiles")),
  firstName: v.string(),
  lastName: v.string(),
  avatarUrl: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  gender: v.optional(genderValidator),
  relationshipType: memberRelationshipTypeValidator,
  status: memberStatusValidator,
  treePositionX: v.optional(v.number()),
  treePositionY: v.optional(v.number()),
});

const treeRelationshipValidator = v.object({
  _id: v.id("familyRelationships"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  familyUnitId: v.id("familyUnits"),
  person1Id: v.id("familyMembers"),
  person2Id: v.id("familyMembers"),
  relationshipType: relationshipTypeValidator,
  marriageDate: v.optional(v.number()),
  divorceDate: v.optional(v.number()),
  createdBy: v.id("profiles"),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all tree data for a family unit (members + relationships)
 * Returns data optimized for React Flow rendering
 */
export const getTreeData = query({
  args: {
    familyUnitId: v.id("familyUnits"),
  },
  returns: v.union(
    v.null(),
    v.object({
      members: v.array(treeMemberValidator),
      relationships: v.array(treeRelationshipValidator),
    }),
  ),
  handler: async (ctx, args) => {
    // Handle auth race conditions gracefully
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get the family unit to verify access
    const familyUnit = await ctx.db.get(args.familyUnitId);
    if (!familyUnit) {
      return null;
    }

    // Verify household access
    try {
      await requireHouseholdAccess(ctx, familyUnit.householdId);
    } catch {
      return null;
    }

    // Fetch all active members for this family unit
    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_familyUnit_and_status", (q) =>
        q.eq("familyUnitId", args.familyUnitId).eq("status", "active"),
      )
      .collect();

    // Fetch all relationships for this family unit
    const relationships = await ctx.db
      .query("familyRelationships")
      .withIndex("by_familyUnit", (q) => q.eq("familyUnitId", args.familyUnitId))
      .collect();

    // Transform members to include only fields needed for tree
    const treeMembers = members.map((member) => ({
      _id: member._id,
      _creationTime: member._creationTime,
      familyUnitId: member.familyUnitId,
      householdId: member.householdId,
      profileId: member.profileId,
      firstName: member.firstName,
      lastName: member.lastName,
      avatarUrl: member.avatarUrl,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      relationshipType: member.relationshipType,
      status: member.status,
      treePositionX: member.treePositionX,
      treePositionY: member.treePositionY,
    }));

    return {
      members: treeMembers,
      relationships,
    };
  },
});

/**
 * Get relationships involving a specific member
 */
export const getMemberRelationships = query({
  args: {
    memberId: v.id("familyMembers"),
  },
  returns: v.union(v.null(), v.array(treeRelationshipValidator)),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      return null;
    }

    try {
      await requireHouseholdAccess(ctx, member.householdId);
    } catch {
      return null;
    }

    // Get relationships where this member is person1
    const asPerson1 = await ctx.db
      .query("familyRelationships")
      .withIndex("by_person1", (q) =>
        q.eq("familyUnitId", member.familyUnitId).eq("person1Id", args.memberId),
      )
      .collect();

    // Get relationships where this member is person2
    const asPerson2 = await ctx.db
      .query("familyRelationships")
      .withIndex("by_person2", (q) =>
        q.eq("familyUnitId", member.familyUnitId).eq("person2Id", args.memberId),
      )
      .collect();

    return [...asPerson1, ...asPerson2];
  },
});

// ============================================================================
// MUTATIONS - POSITIONS
// ============================================================================

/**
 * Update position for a single member (called on drag end)
 */
export const updateMemberPosition = mutation({
  args: {
    memberId: v.id("familyMembers"),
    positionX: v.number(),
    positionY: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    await requireHouseholdAccess(ctx, member.householdId);

    await ctx.db.patch(args.memberId, {
      treePositionX: args.positionX,
      treePositionY: args.positionY,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Batch update positions for multiple members (after auto-layout)
 */
export const batchUpdatePositions = mutation({
  args: {
    familyUnitId: v.id("familyUnits"),
    positions: v.array(
      v.object({
        memberId: v.id("familyMembers"),
        x: v.number(),
        y: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    const familyUnit = await ctx.db.get(args.familyUnitId);
    if (!familyUnit) {
      throw new Error("Family unit not found");
    }

    await requireHouseholdAccess(ctx, familyUnit.householdId);

    const now = Date.now();

    // Update each member's position
    for (const pos of args.positions) {
      const member = await ctx.db.get(pos.memberId);
      if (member && member.familyUnitId === args.familyUnitId) {
        await ctx.db.patch(pos.memberId, {
          treePositionX: pos.x,
          treePositionY: pos.y,
          updatedAt: now,
        });
      }
    }

    // Log activity for batch position update
    await logActivity(ctx, {
      householdId: familyUnit.householdId,
      userId: profile._id,
      module: "family",
      actionType: "family_tree_positions_updated",
      entityType: "family_unit",
      entityId: args.familyUnitId,
      description: `Updated tree layout for ${args.positions.length} family members`,
    });

    return null;
  },
});

// ============================================================================
// MUTATIONS - RELATIONSHIPS
// ============================================================================

/**
 * Create a new relationship between two members
 */
export const createRelationship = mutation({
  args: {
    familyUnitId: v.id("familyUnits"),
    person1Id: v.id("familyMembers"),
    person2Id: v.id("familyMembers"),
    relationshipType: relationshipTypeValidator,
    marriageDate: v.optional(v.number()),
  },
  returns: v.id("familyRelationships"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Validate family unit exists
    const familyUnit = await ctx.db.get(args.familyUnitId);
    if (!familyUnit) {
      throw new Error("Family unit not found");
    }

    await requireHouseholdAccess(ctx, familyUnit.householdId);

    // Validate both members exist and belong to the same family unit
    const person1 = await ctx.db.get(args.person1Id);
    const person2 = await ctx.db.get(args.person2Id);

    if (!person1 || !person2) {
      throw new Error("One or both members not found");
    }

    if (person1.familyUnitId !== args.familyUnitId || person2.familyUnitId !== args.familyUnitId) {
      throw new Error("Both members must belong to the same family unit");
    }

    // Prevent self-referential relationships
    if (args.person1Id === args.person2Id) {
      throw new Error("Cannot create a relationship with oneself");
    }

    // Check for existing relationship between these two people
    const existingAsPerson1 = await ctx.db
      .query("familyRelationships")
      .withIndex("by_person1", (q) =>
        q.eq("familyUnitId", args.familyUnitId).eq("person1Id", args.person1Id),
      )
      .collect();

    const duplicateRelationship = existingAsPerson1.find(
      (rel) => rel.person2Id === args.person2Id && rel.relationshipType === args.relationshipType,
    );

    if (duplicateRelationship) {
      throw new Error("This relationship already exists");
    }

    // For symmetric relationships (spouse/partner), check reverse direction too
    if (args.relationshipType === "spouse_of" || args.relationshipType === "partner_of") {
      const existingAsPerson2 = await ctx.db
        .query("familyRelationships")
        .withIndex("by_person1", (q) =>
          q.eq("familyUnitId", args.familyUnitId).eq("person1Id", args.person2Id),
        )
        .collect();

      const reverseDuplicate = existingAsPerson2.find(
        (rel) => rel.person2Id === args.person1Id && rel.relationshipType === args.relationshipType,
      );

      if (reverseDuplicate) {
        throw new Error("This relationship already exists");
      }
    }

    const now = Date.now();

    // Create the relationship
    const relationshipId = await ctx.db.insert("familyRelationships", {
      householdId: familyUnit.householdId,
      familyUnitId: args.familyUnitId,
      person1Id: args.person1Id,
      person2Id: args.person2Id,
      relationshipType: args.relationshipType,
      marriageDate: args.marriageDate,
      createdBy: profile._id,
      createdAt: now,
      updatedAt: now,
    });

    // Format relationship type for logging
    const relationshipLabel = args.relationshipType.replace("_", " ");

    // Log activity
    await logActivity(ctx, {
      householdId: familyUnit.householdId,
      userId: profile._id,
      module: "family",
      actionType: "family_relationship_created",
      entityType: "family_relationship",
      entityId: relationshipId,
      description: `Added ${relationshipLabel} relationship between ${person1.firstName} and ${person2.firstName}`,
    });

    return relationshipId;
  },
});

/**
 * Update an existing relationship
 */
export const updateRelationship = mutation({
  args: {
    relationshipId: v.id("familyRelationships"),
    relationshipType: v.optional(relationshipTypeValidator),
    marriageDate: v.optional(v.number()),
    divorceDate: v.optional(v.number()),
  },
  returns: v.id("familyRelationships"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    const relationship = await ctx.db.get(args.relationshipId);
    if (!relationship) {
      throw new Error("Relationship not found");
    }

    await requireHouseholdAccess(ctx, relationship.householdId);

    const updates: {
      relationshipType?: "parent_of" | "spouse_of" | "partner_of";
      marriageDate?: number;
      divorceDate?: number;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.relationshipType !== undefined) {
      updates.relationshipType = args.relationshipType;
    }
    if (args.marriageDate !== undefined) {
      updates.marriageDate = args.marriageDate;
    }
    if (args.divorceDate !== undefined) {
      updates.divorceDate = args.divorceDate;
    }

    await ctx.db.patch(args.relationshipId, updates);

    // Log activity
    await logActivity(ctx, {
      householdId: relationship.householdId,
      userId: profile._id,
      module: "family",
      actionType: "family_relationship_updated",
      entityType: "family_relationship",
      entityId: args.relationshipId,
      description: "Updated family relationship",
    });

    return args.relationshipId;
  },
});

/**
 * Delete a relationship
 */
export const deleteRelationship = mutation({
  args: {
    relationshipId: v.id("familyRelationships"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    const relationship = await ctx.db.get(args.relationshipId);
    if (!relationship) {
      throw new Error("Relationship not found");
    }

    await requireHouseholdAccess(ctx, relationship.householdId);

    // Get member names for activity log
    const person1 = await ctx.db.get(relationship.person1Id);
    const person2 = await ctx.db.get(relationship.person2Id);

    const description =
      person1 && person2
        ? `Removed relationship between ${person1.firstName} and ${person2.firstName}`
        : "Removed family relationship";

    // Delete the relationship
    await ctx.db.delete(args.relationshipId);

    // Log activity
    await logActivity(ctx, {
      householdId: relationship.householdId,
      userId: profile._id,
      module: "family",
      actionType: "family_relationship_deleted",
      entityType: "family_relationship",
      entityId: args.relationshipId,
      description,
    });

    return null;
  },
});

/**
 * Delete all relationships for a member (called when deleting a member)
 * This is an internal helper - use removeFamilyMember from familyEcosystem.ts
 */
export const deleteRelationshipsForMember = mutation({
  args: {
    memberId: v.id("familyMembers"),
  },
  returns: v.number(), // Returns count of deleted relationships
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      return 0;
    }

    await requireHouseholdAccess(ctx, member.householdId);

    // Get all relationships where this member is person1
    const asPerson1 = await ctx.db
      .query("familyRelationships")
      .withIndex("by_person1", (q) =>
        q.eq("familyUnitId", member.familyUnitId).eq("person1Id", args.memberId),
      )
      .collect();

    // Get all relationships where this member is person2
    const asPerson2 = await ctx.db
      .query("familyRelationships")
      .withIndex("by_person2", (q) =>
        q.eq("familyUnitId", member.familyUnitId).eq("person2Id", args.memberId),
      )
      .collect();

    const allRelationships = [...asPerson1, ...asPerson2];

    // Delete all relationships
    for (const rel of allRelationships) {
      await ctx.db.delete(rel._id);
    }

    return allRelationships.length;
  },
});
