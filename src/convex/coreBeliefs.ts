import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireHouseholdAccess, requireHouseholdAdmin } from "./auth";
import { logActivity } from "./shared/activity";

/**
 * Wisdom & Education - Core Beliefs Module
 *
 * Provides CRUD operations for core beliefs - the fundamental values and
 * principles that guide a family's life. Limited to 5 beliefs per household.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_CORE_BELIEFS = 5;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Validate belief statement and reflection inputs
 */
function validateBeliefInput(args: { statement?: string; reflection?: string }): void {
  if (args.statement !== undefined) {
    if (!args.statement.trim()) {
      throw new Error("Belief statement is required");
    }
    if (args.statement.length > 200) {
      throw new Error("Statement is too long (max 200 characters)");
    }
  }
  if (args.reflection !== undefined) {
    if (!args.reflection.trim()) {
      throw new Error("Reflection is required");
    }
    if (args.reflection.length > 5000) {
      throw new Error("Reflection is too long (max 5,000 characters)");
    }
  }
}

// ============================================================================
// VALIDATORS
// ============================================================================

const categoryValidator = v.union(
  v.literal("faith"),
  v.literal("family"),
  v.literal("work"),
  v.literal("community"),
  v.literal("personal"),
  v.literal("other"),
);

const coreBeliefReturnValidator = v.object({
  _id: v.id("coreBeliefs"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  createdBy: v.id("profiles"),
  createdByName: v.string(),
  statement: v.string(),
  reflection: v.string(),
  category: categoryValidator,
  orderIndex: v.number(),
  updatedAt: v.number(),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all core beliefs for a household
 * Ordered by orderIndex for display
 */
export const list = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    beliefs: v.array(coreBeliefReturnValidator),
    canAddMore: v.boolean(),
    maxBeliefs: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    // Get beliefs ordered by orderIndex
    const beliefs = await ctx.db
      .query("coreBeliefs")
      .withIndex("by_household_and_orderIndex", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Batch fetch creator names
    const creatorIds = [...new Set(beliefs.map((b) => b.createdBy))];
    const creators = await Promise.all(creatorIds.map((id) => ctx.db.get(id)));
    const creatorNameMap = new Map<string, string>();
    for (let i = 0; i < creatorIds.length; i++) {
      const creator = creators[i];
      const name = creator ? `${creator.firstName} ${creator.lastName}` : "Unknown";
      creatorNameMap.set(creatorIds[i], name);
    }

    // Add creator names
    const beliefsWithNames = beliefs.map((belief) => ({
      ...belief,
      createdByName: creatorNameMap.get(belief.createdBy) ?? "Unknown",
    }));

    return {
      beliefs: beliefsWithNames,
      canAddMore: beliefs.length < MAX_CORE_BELIEFS,
      maxBeliefs: MAX_CORE_BELIEFS,
    };
  },
});

/**
 * Get a single core belief by ID
 */
export const get = query({
  args: {
    beliefId: v.id("coreBeliefs"),
  },
  returns: v.union(coreBeliefReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const belief = await ctx.db.get(args.beliefId);
    if (!belief) return null;

    await requireHouseholdAccess(ctx, belief.householdId);

    // Get creator name
    const creator = await ctx.db.get(belief.createdBy);
    const createdByName = creator ? `${creator.firstName} ${creator.lastName}` : "Unknown";

    return {
      ...belief,
      createdByName,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new core belief
 * Limited to MAX_CORE_BELIEFS (5) per household
 * Only admins (owner/steward) can create
 */
export const create = mutation({
  args: {
    householdId: v.id("households"),
    statement: v.string(),
    reflection: v.string(),
    category: categoryValidator,
  },
  returns: v.id("coreBeliefs"),
  handler: async (ctx, args) => {
    // Only admins can manage core beliefs
    await requireHouseholdAdmin(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // Check limit
    const existingBeliefs = await ctx.db
      .query("coreBeliefs")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    if (existingBeliefs.length >= MAX_CORE_BELIEFS) {
      throw new Error(
        `Cannot add more than ${MAX_CORE_BELIEFS} core beliefs. Please remove one first.`,
      );
    }

    // Validate inputs
    validateBeliefInput({ statement: args.statement, reflection: args.reflection });

    // Calculate next orderIndex
    const maxOrderIndex = existingBeliefs.reduce((max, b) => Math.max(max, b.orderIndex), -1);

    // Create the belief
    const beliefId = await ctx.db.insert("coreBeliefs", {
      householdId: args.householdId,
      createdBy: profile._id,
      statement: args.statement.trim(),
      reflection: args.reflection.trim(),
      category: args.category,
      orderIndex: maxOrderIndex + 1,
      updatedAt: Date.now(),
    });

    // Log activity
    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "wisdom",
      actionType: "wisdom_created",
      entityType: "core_belief",
      entityId: beliefId,
      description: `Added core belief: ${args.statement}`,
    });

    return beliefId;
  },
});

/**
 * Update an existing core belief
 * Only admins can update
 */
export const update = mutation({
  args: {
    beliefId: v.id("coreBeliefs"),
    statement: v.optional(v.string()),
    reflection: v.optional(v.string()),
    category: v.optional(categoryValidator),
  },
  returns: v.id("coreBeliefs"),
  handler: async (ctx, args) => {
    const belief = await ctx.db.get(args.beliefId);
    if (!belief) {
      throw new Error("Core belief not found");
    }

    // Only admins can manage core beliefs
    await requireHouseholdAdmin(ctx, belief.householdId);
    const { profile } = await requireAuth(ctx);

    // Validate inputs
    validateBeliefInput({ statement: args.statement, reflection: args.reflection });

    // Build update object
    const updates: Partial<Doc<"coreBeliefs">> = {
      updatedAt: Date.now(),
    };

    if (args.statement !== undefined) {
      updates.statement = args.statement.trim();
    }
    if (args.reflection !== undefined) {
      updates.reflection = args.reflection.trim();
    }
    if (args.category !== undefined) {
      updates.category = args.category;
    }

    // Apply updates
    await ctx.db.patch(args.beliefId, updates);

    // Log activity
    await logActivity(ctx, {
      householdId: belief.householdId,
      userId: profile._id,
      module: "wisdom",
      actionType: "wisdom_updated",
      entityType: "core_belief",
      entityId: args.beliefId,
      description: `Updated core belief: ${updates.statement || belief.statement}`,
    });

    return args.beliefId;
  },
});

/**
 * Delete a core belief
 * Only admins can delete
 */
export const remove = mutation({
  args: {
    beliefId: v.id("coreBeliefs"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const belief = await ctx.db.get(args.beliefId);
    if (!belief) {
      throw new Error("Core belief not found");
    }

    // Only admins can manage core beliefs
    await requireHouseholdAdmin(ctx, belief.householdId);
    const { profile } = await requireAuth(ctx);

    const statement = belief.statement;
    const householdId = belief.householdId;

    // Delete the belief
    await ctx.db.delete(args.beliefId);

    // Log activity
    await logActivity(ctx, {
      householdId,
      userId: profile._id,
      module: "wisdom",
      actionType: "wisdom_deleted",
      entityType: "core_belief",
      entityId: args.beliefId,
      description: `Deleted core belief: ${statement}`,
    });

    return null;
  },
});

/**
 * Reorder core beliefs
 * Takes an array of belief IDs in the desired order
 * Only admins can reorder
 */
export const reorder = mutation({
  args: {
    householdId: v.id("households"),
    orderedIds: v.array(v.id("coreBeliefs")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Only admins can manage core beliefs
    await requireHouseholdAdmin(ctx, args.householdId);

    // Verify all IDs belong to this household
    for (const beliefId of args.orderedIds) {
      const belief = await ctx.db.get(beliefId);
      if (!belief || belief.householdId !== args.householdId) {
        throw new Error("Invalid belief ID in order list");
      }
    }

    // Update orderIndex for each belief
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], {
        orderIndex: i,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});
