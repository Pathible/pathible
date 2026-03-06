import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  requireActiveSubscription,
  requireAuth,
  requireFeatureAccess,
  requireHouseholdAccess,
} from "./auth";
import { requireNotInEstateMode } from "./estateHelpers";
import { logActivity } from "./shared/activity";
import { trackAnalytics } from "./shared/analyticsHelpers";

/**
 * Wisdom & Education - Wisdom Entries Module
 *
 * Provides CRUD operations for wisdom entries - family values, lessons, stories,
 * advice, and traditions that users want to preserve and share.
 */

// ============================================================================
// VALIDATORS
// ============================================================================

const categoryValidator = v.union(
  v.literal("values"),
  v.literal("lessons"),
  v.literal("stories"),
  v.literal("advice"),
  v.literal("traditions"),
);

const wisdomEntryReturnValidator = v.object({
  _id: v.id("wisdomEntries"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  authorId: v.id("profiles"),
  authorName: v.string(),
  title: v.string(),
  content: v.string(),
  category: categoryValidator,
  tags: v.array(v.string()),
  isPublished: v.boolean(),
  sharedWith: v.union(v.literal("household"), v.literal("descendants"), v.literal("specific")),
  mediaStorageIds: v.array(v.id("_storage")),
  updatedAt: v.number(),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get statistics for the Wisdom Hub
 * Returns counts of user's wisdom entries
 */
export const getStats = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    totalEntries: v.number(),
    publishedEntries: v.number(),
    draftEntries: v.number(),
    entriesByCategory: v.object({
      values: v.number(),
      lessons: v.number(),
      stories: v.number(),
      advice: v.number(),
      traditions: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // Get all entries authored by this user in this household
    const entries = await ctx.db
      .query("wisdomEntries")
      .withIndex("by_author", (q) => q.eq("authorId", profile._id))
      .collect();

    // Filter to this household (since index is by author only)
    const householdEntries = entries.filter((entry) => entry.householdId === args.householdId);

    const publishedEntries = householdEntries.filter((e) => e.isPublished);
    const draftEntries = householdEntries.filter((e) => !e.isPublished);

    // Count by category
    const entriesByCategory = {
      values: householdEntries.filter((e) => e.category === "values").length,
      lessons: householdEntries.filter((e) => e.category === "lessons").length,
      stories: householdEntries.filter((e) => e.category === "stories").length,
      advice: householdEntries.filter((e) => e.category === "advice").length,
      traditions: householdEntries.filter((e) => e.category === "traditions").length,
    };

    return {
      totalEntries: householdEntries.length,
      publishedEntries: publishedEntries.length,
      draftEntries: draftEntries.length,
      entriesByCategory,
    };
  },
});

/**
 * List wisdom entries for the user's library
 * Returns only entries authored by the current user
 */
export const list = query({
  args: {
    householdId: v.id("households"),
    category: v.optional(categoryValidator),
    searchQuery: v.optional(v.string()),
    includePublishedOnly: v.optional(v.boolean()),
  },
  returns: v.array(wisdomEntryReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // Get entries by author
    let entries: Doc<"wisdomEntries">[];

    if (args.category) {
      // Use category index if filtering by category
      const categoryValue = args.category;
      entries = await ctx.db
        .query("wisdomEntries")
        .withIndex("by_household_and_category", (q) =>
          q.eq("householdId", args.householdId).eq("category", categoryValue),
        )
        .collect();
      // Filter to author's entries
      entries = entries.filter((e) => e.authorId === profile._id);
    } else {
      // Get all entries by this author
      entries = await ctx.db
        .query("wisdomEntries")
        .withIndex("by_author", (q) => q.eq("authorId", profile._id))
        .collect();
      // Filter to this household
      entries = entries.filter((e) => e.householdId === args.householdId);
    }

    // Filter by published status if requested
    if (args.includePublishedOnly) {
      entries = entries.filter((e) => e.isPublished);
    }

    // Apply search filter
    if (args.searchQuery) {
      const searchLower = args.searchQuery.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.content.toLowerCase().includes(searchLower),
      );
    }

    // Sort by most recent first
    entries.sort((a, b) => b._creationTime - a._creationTime);

    // Add author name (all entries are by current user in library view)
    return entries.map((entry) => ({
      ...entry,
      authorName: `${profile.firstName} ${profile.lastName}`,
    }));
  },
});

/**
 * Get a single wisdom entry by ID
 */
export const get = query({
  args: {
    entryId: v.id("wisdomEntries"),
  },
  returns: v.union(wisdomEntryReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) return null;

    // Verify access to household
    await requireHouseholdAccess(ctx, entry.householdId);
    const { profile } = await requireAuth(ctx);

    // For now, only allow viewing own entries or published entries
    const isAuthor = entry.authorId === profile._id;
    if (!isAuthor && !entry.isPublished) {
      throw new Error("Access denied: This entry is private");
    }

    // Get author name
    const author = await ctx.db.get(entry.authorId);
    const authorName = author ? `${author.firstName} ${author.lastName}` : "Unknown";

    return {
      ...entry,
      authorName,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new wisdom entry
 */
export const create = mutation({
  args: {
    householdId: v.id("households"),
    title: v.string(),
    content: v.string(),
    category: categoryValidator,
    isPublished: v.optional(v.boolean()),
  },
  returns: v.id("wisdomEntries"),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const createHousehold = await requireActiveSubscription(ctx, args.householdId);
    requireNotInEstateMode(createHousehold);
    await requireFeatureAccess(ctx, args.householdId, "wisdom_entries");
    const { profile } = await requireAuth(ctx);

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
    if (args.content.length > 50000) {
      throw new Error("Content is too long (max 50,000 characters)");
    }

    // Create the entry
    const entryId = await ctx.db.insert("wisdomEntries", {
      householdId: args.householdId,
      authorId: profile._id,
      title: args.title.trim(),
      content: args.content.trim(),
      category: args.category,
      tags: [], // Tags disabled for MVP
      isPublished: args.isPublished ?? false,
      sharedWith: "household", // MVP: only household sharing
      mediaStorageIds: [], // No media for MVP
      updatedAt: Date.now(),
    });

    // Log activity
    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "wisdom",
      actionType: "wisdom_created",
      entityType: "wisdom_entry",
      entityId: entryId,
      description: `Created wisdom entry: ${args.title}`,
    });

    // Analytics: Track wisdom entry creation
    await trackAnalytics(ctx, profile.userId, "wisdom_entry_created", {
      household_id: args.householdId,
      category: args.category,
      is_published: args.isPublished ?? false,
      content_length: args.content.trim().length,
    });

    return entryId;
  },
});

/**
 * Update an existing wisdom entry
 * Only the author can update their own entries
 */
export const update = mutation({
  args: {
    entryId: v.id("wisdomEntries"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(categoryValidator),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.id("wisdomEntries"),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Wisdom entry not found");
    }

    await requireHouseholdAccess(ctx, entry.householdId);
    const updateHousehold = await requireActiveSubscription(ctx, entry.householdId);
    requireNotInEstateMode(updateHousehold);
    await requireFeatureAccess(ctx, entry.householdId, "wisdom_entries");
    const { profile } = await requireAuth(ctx);

    // Only author can edit
    if (entry.authorId !== profile._id) {
      throw new Error("Access denied: Only the author can edit this entry");
    }

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
      if (args.content.length > 50000) {
        throw new Error("Content is too long (max 50,000 characters)");
      }
    }

    // Build update object
    const updates: Partial<Doc<"wisdomEntries">> = {
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
    if (args.isPublished !== undefined) {
      updates.isPublished = args.isPublished;
    }

    // Apply updates
    await ctx.db.patch(args.entryId, updates);

    // Log activity
    await logActivity(ctx, {
      householdId: entry.householdId,
      userId: profile._id,
      module: "wisdom",
      actionType: "wisdom_updated",
      entityType: "wisdom_entry",
      entityId: args.entryId,
      description: `Updated wisdom entry: ${updates.title || entry.title}`,
    });

    return args.entryId;
  },
});

/**
 * Delete a wisdom entry
 * Only the author can delete their own entries
 */
export const remove = mutation({
  args: {
    entryId: v.id("wisdomEntries"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Wisdom entry not found");
    }

    await requireHouseholdAccess(ctx, entry.householdId);
    const removeHousehold = await requireActiveSubscription(ctx, entry.householdId);
    requireNotInEstateMode(removeHousehold);
    await requireFeatureAccess(ctx, entry.householdId, "wisdom_entries");
    const { profile } = await requireAuth(ctx);

    // Only author can delete
    if (entry.authorId !== profile._id) {
      throw new Error("Access denied: Only the author can delete this entry");
    }

    const title = entry.title;
    const householdId = entry.householdId;

    // Delete the entry
    await ctx.db.delete(args.entryId);

    // Log activity
    await logActivity(ctx, {
      householdId,
      userId: profile._id,
      module: "wisdom",
      actionType: "wisdom_deleted",
      entityType: "wisdom_entry",
      entityId: args.entryId,
      description: `Deleted wisdom entry: ${title}`,
    });

    return null;
  },
});
