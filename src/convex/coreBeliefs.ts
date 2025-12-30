import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireHouseholdAccess, requireHouseholdAdmin } from "./auth";

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
  title: v.string(),
  content: v.string(),
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
    title: v.string(),
    content: v.string(),
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
    if (!args.title.trim()) {
      throw new Error("Title is required");
    }
    if (args.title.length > 200) {
      throw new Error("Title is too long (max 200 characters)");
    }
    if (!args.content.trim()) {
      throw new Error("Content is required");
    }
    if (args.content.length > 5000) {
      throw new Error("Content is too long (max 5,000 characters)");
    }

    // Calculate next orderIndex
    const maxOrderIndex = existingBeliefs.reduce((max, b) => Math.max(max, b.orderIndex), -1);

    // Create the belief
    const beliefId = await ctx.db.insert("coreBeliefs", {
      householdId: args.householdId,
      createdBy: profile._id,
      title: args.title.trim(),
      content: args.content.trim(),
      category: args.category,
      orderIndex: maxOrderIndex + 1,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: args.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: beliefId,
      description: `Added core belief: ${args.title}`,
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
    title: v.optional(v.string()),
    content: v.optional(v.string()),
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
    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new Error("Title cannot be empty");
      }
      if (args.title.length > 200) {
        throw new Error("Title is too long (max 200 characters)");
      }
    }
    if (args.content !== undefined) {
      if (!args.content.trim()) {
        throw new Error("Content cannot be empty");
      }
      if (args.content.length > 5000) {
        throw new Error("Content is too long (max 5,000 characters)");
      }
    }

    // Build update object
    const updates: Partial<Doc<"coreBeliefs">> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title.trim();
    }
    if (args.content !== undefined) {
      updates.content = args.content.trim();
    }
    if (args.category !== undefined) {
      updates.category = args.category;
    }

    // Apply updates
    await ctx.db.patch(args.beliefId, updates);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: belief.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: args.beliefId,
      description: `Updated core belief: ${updates.title || belief.title}`,
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

    const title = belief.title;
    const householdId = belief.householdId;

    // Delete the belief
    await ctx.db.delete(args.beliefId);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      entityId: args.beliefId,
      description: `Deleted core belief: ${title}`,
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
