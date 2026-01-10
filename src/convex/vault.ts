import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalQuery, mutation, query } from "./_generated/server";
import {
  checkStorageQuota,
  PLAN_LIMITS,
  requireActiveSubscription,
  requireAdminOrResourceOwner,
  requireAuth,
  requireFeatureAccess,
  requireHouseholdAccess,
  requireHouseholdAdmin,
} from "./auth";
import { logActivity } from "./shared/activity";
import { accessLevelValidator } from "./shared/commonValidators";
import { formatBytesAsGB } from "./shared/constants";
import {
  checkDocumentAccess,
  validateCategoryDescription,
  validateCategoryName,
  validateDocumentDescription,
  validateDocumentName,
} from "./vaultHelpers";

/**
 * Heritage Vault - Secure Document Storage System
 *
 * This module provides comprehensive document management for households including:
 * - File upload and storage using Convex storage
 * - Document metadata management
 * - Category-based organization
 * - Access control (household, admins, custom)
 * - Search and filtering
 * - Activity logging
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const documentReturnValidator = v.object({
  _id: v.id("vaultDocuments"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  uploadedBy: v.id("profiles"),
  uploaderName: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  // Backblaze B2 fields (no Convex storage)
  b2FileId: v.string(),
  b2FileName: v.string(),
  b2BucketName: v.string(),
  fileHash: v.optional(v.string()),
  fileSize: v.number(),
  fileType: v.string(),
  categories: v.array(v.string()),
  accessLevel: accessLevelValidator,
  sharedWithUsers: v.array(v.id("profiles")),
  updatedAt: v.number(),
});

const categoryReturnValidator = v.object({
  _id: v.id("vaultCategories"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  name: v.string(),
  description: v.optional(v.string()),
  documentCount: v.number(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get uploader name for a document
 * Returns "Unknown" for non-existent or soft-deleted profiles
 */
async function getUploaderName(ctx: QueryCtx, uploaderId: Id<"profiles">): Promise<string> {
  const uploader = await ctx.db.get(uploaderId);
  if (!uploader || uploader.deletedAt) return "Unknown";
  return `${uploader.firstName} ${uploader.lastName}`;
}

/**
 * Update category document counts
 * Increments or decrements the documentCount counter for each category
 *
 * @param ctx - Mutation context
 * @param householdId - The household ID
 * @param categoryNames - Array of category names to update
 * @param delta - Amount to add (positive) or subtract (negative)
 */
async function updateCategoryCounters(
  ctx: {
    db: QueryCtx["db"] & {
      patch: (id: Id<"vaultCategories">, updates: { documentCount: number }) => Promise<void>;
    };
  },
  householdId: Id<"households">,
  categoryNames: string[],
  delta: number,
): Promise<void> {
  if (categoryNames.length === 0) return;

  // Get all categories for this household
  const categories = await ctx.db
    .query("vaultCategories")
    .withIndex("by_household", (q) => q.eq("householdId", householdId))
    .collect();

  const categoryMap = new Map(categories.map((category) => [category.name, category]));

  for (const name of new Set(categoryNames)) {
    const category = categoryMap.get(name);
    if (!category) continue;
    const currentCount = category.documentCount ?? 0;
    const nextCount = Math.max(0, currentCount + delta);
    if (nextCount === currentCount) continue;

    await ctx.db.patch(category._id, {
      documentCount: nextCount,
    });

    category.documentCount = nextCount;
  }
}

/**
 * Adjust the household storage usage counter atomically.
 *
 * Convex serializes mutations per document, so a read-modify-write sequence on the same household
 * document is effectively atomic. Centralizing the logic here makes that assumption explicit.
 */
async function adjustStorageUsage(
  ctx: {
    db: QueryCtx["db"] & {
      patch: (id: Id<"households">, updates: { storageUsedBytes: number }) => Promise<void>;
    };
  },
  householdId: Id<"households">,
  delta: number,
): Promise<void> {
  if (delta === 0) return;
  const household = await ctx.db.get(householdId);
  if (!household) return;
  const currentStorage = household.storageUsedBytes ?? 0;
  const nextValue = Math.max(0, currentStorage + delta);
  await ctx.db.patch(householdId, { storageUsedBytes: nextValue });
}

/**
 * Atomically adjust the vault document count counter on a household.
 *
 * @param ctx - Mutation context
 * @param householdId - The household to update
 * @param delta - Amount to change (positive for create, negative for delete)
 */
async function adjustDocumentCount(
  ctx: {
    db: QueryCtx["db"] & {
      patch: (id: Id<"households">, updates: { vaultDocumentCount: number }) => Promise<void>;
    };
  },
  householdId: Id<"households">,
  delta: number,
): Promise<void> {
  if (delta === 0) return;
  const household = await ctx.db.get(householdId);
  if (!household) return;
  const currentCount = household.vaultDocumentCount ?? 0;
  const nextValue = Math.max(0, currentCount + delta);
  await ctx.db.patch(householdId, { vaultDocumentCount: nextValue });
}

// ============================================================================
// QUERIES
// ============================================================================

/** Default page size for document listings */
const DEFAULT_PAGE_SIZE = 50;

/** Maximum page size to prevent abuse */
const MAX_PAGE_SIZE = 100;

/**
 * List documents in a household with pagination
 * Returns only documents the user has access to
 *
 * @param limit - Number of documents to return (default 50, max 100)
 * @param cursor - Pagination cursor from previous response
 */
export const list = query({
  args: {
    householdId: v.id("households"),
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    documents: v.array(documentReturnValidator),
    nextCursor: v.union(v.string(), v.null()),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const membership = await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // Clamp limit to safe bounds
    const requestedLimit = args.limit ?? DEFAULT_PAGE_SIZE;
    const limit = Math.min(Math.max(1, requestedLimit), MAX_PAGE_SIZE);

    // Build query with pagination
    const query = ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .order("desc"); // Most recent first

    // Apply cursor if provided (for pagination)
    const paginatedResult = await query.paginate({
      numItems: limit,
      cursor: args.cursor ?? null,
    });

    // Filter by access permissions
    const accessibleDocs = paginatedResult.page.filter((doc) =>
      checkDocumentAccess(doc, profile._id, membership.role),
    );

    // Apply category filter
    let filteredDocs = accessibleDocs;
    if (args.category) {
      const category = args.category;
      filteredDocs = filteredDocs.filter((doc) => doc.categories.includes(category));
    }

    // Apply search filter
    if (args.searchQuery) {
      const searchQuery = args.searchQuery.toLowerCase();
      filteredDocs = filteredDocs.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery) ||
          doc.description?.toLowerCase().includes(searchQuery),
      );
    }

    // Batch fetch uploader names to avoid N+1
    const uploaderIds = [...new Set(filteredDocs.map((doc) => doc.uploadedBy))];
    const uploaderProfiles = await Promise.all(uploaderIds.map((id) => ctx.db.get(id)));
    const uploaderNameMap = new Map<string, string>();
    for (let i = 0; i < uploaderIds.length; i++) {
      const uploader = uploaderProfiles[i];
      const name =
        uploader && !uploader.deletedAt ? `${uploader.firstName} ${uploader.lastName}` : "Unknown";
      uploaderNameMap.set(uploaderIds[i], name);
    }

    // Build response with uploader info
    const docsWithDetails = filteredDocs.map((doc) => ({
      ...doc,
      uploaderName: uploaderNameMap.get(doc.uploadedBy) ?? "Unknown",
    }));

    return {
      documents: docsWithDetails,
      nextCursor: paginatedResult.continueCursor,
      hasMore: !paginatedResult.isDone,
    };
  },
});

/**
 * Get a single document by ID
 * Verifies access permissions
 */
export const get = query({
  args: {
    documentId: v.id("vaultDocuments"),
  },
  returns: v.union(documentReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) return null;

    // Verify household access
    const membership = await requireHouseholdAccess(ctx, document.householdId);
    const { profile } = await requireAuth(ctx);

    // Check document-level access
    const hasAccess = checkDocumentAccess(document, profile._id, membership.role);

    if (!hasAccess) {
      throw new Error("Access denied: You do not have permission to view this document");
    }

    // Note: Download URL is generated via vaultActions.generateDownloadUrl for security
    return {
      ...document,
      uploaderName: await getUploaderName(ctx, document.uploadedBy),
    };
  },
});

// Note: Upload URL generation moved to vaultActions.generateUploadUrl
// This uses Backblaze B2 instead of Convex storage to avoid vendor lock-in

/**
 * List all categories for a household
 * Includes document count for each category (O(1) using pre-computed counter)
 */
export const listCategories = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.array(categoryReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const categories = await ctx.db
      .query("vaultCategories")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Use pre-computed counter (defaults to 0 for backwards compatibility)
    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      documentCount: category.documentCount ?? 0,
    }));

    return categoriesWithCounts;
  },
});

/**
 * Get statistics for the vault
 *
 * Uses pre-computed counters where possible for O(1) performance.
 * Falls back to calculating from documents for legacy data where counters
 * haven't been initialized yet.
 *
 * - totalDocuments: Uses household.vaultDocumentCount counter (or calculates if not set)
 * - totalSize: Uses household.storageUsedBytes counter (or calculates if not set)
 * - totalCategories: Count from categories query
 * - recentUploads: Requires iteration (could be optimized with by_household_and_creationTime index)
 *
 * Note: For users with restricted access (non-admin viewing admin-only docs),
 * the counts reflect ALL household documents, not just accessible ones.
 * This is intentional for displaying overall vault statistics.
 */
export const getStats = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    totalDocuments: v.number(),
    totalSize: v.number(),
    totalCategories: v.number(),
    recentUploads: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    // Get household for pre-computed counters
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Fetch categories count
    const categories = await ctx.db
      .query("vaultCategories")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Use pre-computed counters if available
    const hasCounters =
      household.vaultDocumentCount !== undefined && household.storageUsedBytes !== undefined;

    let totalDocuments: number;
    let totalSize: number;
    let recentUploads: number;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    if (hasCounters) {
      // Use pre-computed counters (O(1)) for totals
      totalDocuments = household.vaultDocumentCount ?? 0;
      totalSize = household.storageUsedBytes ?? 0;

      // For recent uploads, we still need to query but only count
      // Use pagination to avoid loading all documents into memory
      let recentCount = 0;
      let cursor: string | null = null;
      const BATCH_SIZE = 100;

      do {
        const batch = await ctx.db
          .query("vaultDocuments")
          .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
          .paginate({ numItems: BATCH_SIZE, cursor });

        for (const doc of batch.page) {
          if (doc._creationTime >= thirtyDaysAgo) {
            recentCount++;
          }
        }

        cursor = batch.isDone ? null : batch.continueCursor;
      } while (cursor);

      recentUploads = recentCount;
    } else {
      // Fallback for legacy data: calculate from documents
      // This only runs once per household until counters are initialized
      const allDocs = await ctx.db
        .query("vaultDocuments")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .collect();

      totalDocuments = allDocs.length;
      totalSize = allDocs.reduce((sum, doc) => sum + doc.fileSize, 0);
      recentUploads = allDocs.filter((doc) => doc._creationTime >= thirtyDaysAgo).length;
    }

    return {
      totalDocuments,
      totalSize,
      totalCategories: categories.length,
      recentUploads,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create document metadata after file upload to B2
 * Call this after uploading the file directly to Backblaze B2
 *
 * SECURITY: Defense in depth - also validates storage quota here
 * even though it's checked in generateUploadUrl action
 */
export const create = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
    description: v.optional(v.string()),
    // Backblaze B2 fields (no Convex storage)
    b2FileId: v.string(),
    b2FileName: v.string(),
    b2BucketName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileHash: v.optional(v.string()),
    categories: v.array(v.string()),
    accessLevel: accessLevelValidator,
    sharedWithUsers: v.optional(v.array(v.id("profiles"))),
  },
  returns: v.id("vaultDocuments"),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Verify active subscription and storage quota (defense in depth)
    await checkStorageQuota(ctx, args.householdId, args.fileSize);

    // Validate inputs using shared helpers
    const validatedName = validateDocumentName(args.name, true);
    const validatedDescription = validateDocumentDescription(args.description);

    // Validate B2 file ID
    if (!args.b2FileId || !args.b2FileName) {
      throw new Error("B2 file information is required");
    }

    // Validate shared users if access level is custom
    const sharedWithUsers = args.sharedWithUsers || [];
    if (args.accessLevel === "custom") {
      // Verify all shared users are members of the household
      for (const userId of sharedWithUsers) {
        const membership = await ctx.db
          .query("householdMemberships")
          .withIndex("by_household_and_user", (q) =>
            q.eq("householdId", args.householdId).eq("userId", userId),
          )
          .unique();

        if (!membership || membership.status !== "active") {
          throw new Error("Cannot share with users who are not household members");
        }
      }
    }

    // Create document record with B2 references
    const documentId = await ctx.db.insert("vaultDocuments", {
      householdId: args.householdId,
      uploadedBy: profile._id,
      name: validatedName,
      description: validatedDescription,
      // Backblaze B2 storage references (no Convex storage)
      b2FileId: args.b2FileId,
      b2FileName: args.b2FileName,
      b2BucketName: args.b2BucketName,
      fileHash: args.fileHash,
      fileSize: args.fileSize,
      fileType: args.fileType || "application/octet-stream",
      categories: args.categories,
      accessLevel: args.accessLevel,
      sharedWithUsers,
      updatedAt: Date.now(),
    });

    // Atomically increment counters on household
    await adjustStorageUsage(ctx, args.householdId, args.fileSize);
    await adjustDocumentCount(ctx, args.householdId, 1);

    // Increment category document counters
    if (args.categories.length > 0) {
      await updateCategoryCounters(ctx, args.householdId, args.categories, 1);
    }

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "vault",
      actionType: "document_uploaded",
      entityType: "document",
      entityId: documentId,
      description: `Uploaded document: ${args.name}`,
    });

    return documentId;
  },
});

/**
 * Update document metadata
 * Cannot change the file itself, only metadata
 *
 * SECURITY: Requires active subscription
 */
export const update = mutation({
  args: {
    documentId: v.id("vaultDocuments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    accessLevel: v.optional(accessLevelValidator),
    sharedWithUsers: v.optional(v.array(v.id("profiles"))),
  },
  returns: v.id("vaultDocuments"),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    const membership = await requireHouseholdAccess(ctx, document.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription for modifications
    await requireActiveSubscription(ctx, document.householdId);

    // Only admins or the uploader can edit
    requireAdminOrResourceOwner(membership, profile._id, document.uploadedBy, "edit this document");

    // Build update object
    const updates: Partial<Doc<"vaultDocuments">> = {
      updatedAt: Date.now(),
    };

    // Validate and apply name update using shared helper
    if (args.name !== undefined) {
      updates.name = validateDocumentName(args.name, false);
    }

    // Validate and apply description update using shared helper
    if (args.description !== undefined) {
      updates.description = validateDocumentDescription(args.description);
    }

    // Track category changes for counter updates
    let removedCategories: string[] = [];
    let addedCategories: string[] = [];

    if (args.categories !== undefined) {
      const oldCategories = document.categories;
      const newCategories = args.categories;

      // Find categories that were removed
      removedCategories = oldCategories.filter((c) => !newCategories.includes(c));
      // Find categories that were added
      addedCategories = newCategories.filter((c) => !oldCategories.includes(c));

      updates.categories = args.categories;
    }

    if (args.accessLevel !== undefined) {
      updates.accessLevel = args.accessLevel;
    }

    if (args.sharedWithUsers !== undefined) {
      // Validate shared users if access level is custom
      if ((args.accessLevel || document.accessLevel) === "custom") {
        for (const userId of args.sharedWithUsers) {
          const membership = await ctx.db
            .query("householdMemberships")
            .withIndex("by_household_and_user", (q) =>
              q.eq("householdId", document.householdId).eq("userId", userId),
            )
            .unique();

          if (!membership || membership.status !== "active") {
            throw new Error("Cannot share with users who are not household members");
          }
        }
      }
      updates.sharedWithUsers = args.sharedWithUsers;
    }

    // Update document
    await ctx.db.patch(args.documentId, updates);

    // Update category counters if categories changed
    if (removedCategories.length > 0) {
      await updateCategoryCounters(ctx, document.householdId, removedCategories, -1);
    }
    if (addedCategories.length > 0) {
      await updateCategoryCounters(ctx, document.householdId, addedCategories, 1);
    }

    await logActivity(ctx, {
      householdId: document.householdId,
      userId: profile._id,
      module: "vault",
      actionType: "document_updated",
      entityType: "document",
      entityId: args.documentId,
      description: `Updated document: ${updates.name || document.name}`,
    });

    return args.documentId;
  },
});

/**
 * Delete a document
 * Removes metadata from Convex and file from B2
 * Note: B2 deletion happens via vaultActions.deleteFile
 *
 * SECURITY: Requires active subscription
 */
export const remove = mutation({
  args: {
    documentId: v.id("vaultDocuments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    const membership = await requireHouseholdAccess(ctx, document.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription for modifications
    await requireActiveSubscription(ctx, document.householdId);

    // Only admins or the uploader can delete
    requireAdminOrResourceOwner(
      membership,
      profile._id,
      document.uploadedBy,
      "delete this document",
    );

    // Note: B2 file deletion must be handled separately via vaultActions.deleteFile
    // This mutation only deletes the database record
    // The client should call both: vault.remove() and vaultActions.deleteFile()

    // Atomically decrement counters on household
    await adjustStorageUsage(ctx, document.householdId, -document.fileSize);
    await adjustDocumentCount(ctx, document.householdId, -1);

    // Decrement category document counters
    if (document.categories.length > 0) {
      await updateCategoryCounters(ctx, document.householdId, document.categories, -1);
    }

    // Delete the document record
    await ctx.db.delete(args.documentId);

    await logActivity(ctx, {
      householdId: document.householdId,
      userId: profile._id,
      module: "vault",
      actionType: "document_deleted",
      entityType: "document",
      entityId: args.documentId,
      description: `Deleted document: ${document.name}`,
    });

    return null;
  },
});

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

/**
 * Create a new category
 * Anyone in the household can create categories
 *
 * SECURITY: Requires active subscription and Heritage tier for tags/collections feature
 */
export const createCategory = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("vaultCategories"),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, args.householdId);

    // SECURITY: Require Heritage tier for tags/collections feature
    await requireFeatureAccess(ctx, args.householdId, "vault_tags_collections");

    // Validate inputs using shared helpers
    const validatedName = validateCategoryName(args.name);
    const validatedDescription = validateCategoryDescription(args.description);

    // Check if category already exists (case-insensitive)
    const existing = await ctx.db
      .query("vaultCategories")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const duplicate = existing.find(
      (cat) => cat.name.toLowerCase() === validatedName.toLowerCase(),
    );

    if (duplicate) {
      throw new Error("A category with this name already exists");
    }

    // Create category with initialized document count
    const categoryId = await ctx.db.insert("vaultCategories", {
      householdId: args.householdId,
      name: validatedName,
      description: validatedDescription,
      documentCount: 0,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "vault",
      actionType: "category_created",
      entityType: "category",
      entityId: categoryId,
      description: `Created category: ${args.name}`,
    });

    return categoryId;
  },
});

/**
 * Update a category
 * Admins only
 *
 * SECURITY: Requires active subscription and Heritage tier for tags/collections feature
 *
 * PERFORMANCE NOTE: Renaming a category requires updating all documents that use it.
 * This is O(n) where n = documents in household. Convex doesn't support indexing on
 * array elements, so a full scan is unavoidable without a schema change (junction table).
 * For most households (< 1000 documents), this is acceptable.
 */
export const updateCategory = mutation({
  args: {
    categoryId: v.id("vaultCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.id("vaultCategories"),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    await requireHouseholdAdmin(ctx, category.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, category.householdId);

    // SECURITY: Require Heritage tier for tags/collections feature
    await requireFeatureAccess(ctx, category.householdId, "vault_tags_collections");

    // Build update object
    const updates: Partial<Doc<"vaultCategories">> = {};

    if (args.name !== undefined) {
      // Validate name using shared helper
      const newName = validateCategoryName(args.name);

      // Check for duplicates (case-insensitive)
      const existingCategories = await ctx.db
        .query("vaultCategories")
        .withIndex("by_household", (q) => q.eq("householdId", category.householdId))
        .collect();

      const duplicate = existingCategories.find(
        (cat) => cat._id !== args.categoryId && cat.name.toLowerCase() === newName.toLowerCase(),
      );

      if (duplicate) {
        throw new Error("A category with this name already exists");
      }

      // Update all documents using the old category name
      // NOTE: O(n) scan - see function docs for explanation
      const oldName = category.name;
      if (oldName !== newName) {
        const documents = await ctx.db
          .query("vaultDocuments")
          .withIndex("by_household", (q) => q.eq("householdId", category.householdId))
          .collect();

        for (const doc of documents) {
          if (doc.categories.includes(oldName)) {
            const updatedCategories = doc.categories.map((cat) =>
              cat === oldName ? newName : cat,
            );
            await ctx.db.patch(doc._id, { categories: updatedCategories });
          }
        }
      }

      updates.name = newName;
    }

    // Validate description using shared helper
    if (args.description !== undefined) {
      updates.description = validateCategoryDescription(args.description);
    }

    // Update category
    await ctx.db.patch(args.categoryId, updates);

    await logActivity(ctx, {
      householdId: category.householdId,
      userId: profile._id,
      module: "vault",
      actionType: "category_updated",
      entityType: "category",
      entityId: args.categoryId,
      description: `Updated category: ${updates.name || category.name}`,
    });

    return args.categoryId;
  },
});

/**
 * Delete a category
 * Admins only - removes category from all documents
 *
 * SECURITY: Requires active subscription and Heritage tier for tags/collections feature
 *
 * PERFORMANCE NOTE: Deleting a category requires updating all documents that use it.
 * This is O(n) where n = documents in household. Convex doesn't support indexing on
 * array elements, so a full scan is unavoidable without a schema change (junction table).
 * For most households (< 1000 documents), this is acceptable.
 */
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("vaultCategories"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    await requireHouseholdAdmin(ctx, category.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, category.householdId);

    // SECURITY: Require Heritage tier for tags/collections feature
    await requireFeatureAccess(ctx, category.householdId, "vault_tags_collections");

    // Remove category from all documents
    // NOTE: O(n) scan - see function docs for explanation
    const categoryName = category.name;
    const documents = await ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", category.householdId))
      .collect();

    for (const doc of documents) {
      if (doc.categories.includes(categoryName)) {
        const updatedCategories = doc.categories.filter((cat) => cat !== categoryName);
        await ctx.db.patch(doc._id, { categories: updatedCategories });
      }
    }

    // Delete category
    await ctx.db.delete(args.categoryId);

    await logActivity(ctx, {
      householdId: category.householdId,
      userId: profile._id,
      module: "vault",
      actionType: "category_deleted",
      entityType: "category",
      entityId: args.categoryId,
      description: `Deleted category: ${categoryName}`,
    });

    return null;
  },
});

/**
 * Default categories for new households
 */
const DEFAULT_CATEGORIES = [
  {
    name: "Legal Documents",
    description: "Wills, trusts, power of attorney, and legal agreements",
  },
  {
    name: "Financial Records",
    description: "Bank statements, investments, and tax documents",
  },
  {
    name: "Medical Records",
    description: "Health records, prescriptions, and medical history",
  },
  {
    name: "Insurance Policies",
    description: "Life, health, home, and auto insurance documents",
  },
  {
    name: "Property Deeds",
    description: "Real estate titles, deeds, and property documents",
  },
  {
    name: "Personal Documents",
    description: "Birth certificates, passports, and IDs",
  },
  {
    name: "Family Photos",
    description: "Important family photographs and memories",
  },
  { name: "Other", description: "Miscellaneous documents" },
];

/**
 * Initialize default categories for a household
 * Creates standard categories if none exist
 *
 * Also counts any existing documents that match the default category names,
 * ensuring the documentCount counters are accurate from the start.
 *
 * SECURITY: Requires active subscription and Heritage tier for tags/collections feature
 */
export const initializeDefaultCategories = mutation({
  args: {
    householdId: v.id("households"),
  },
  returns: v.number(), // Returns count of categories created
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require active subscription and Heritage tier
    await requireActiveSubscription(ctx, args.householdId);
    await requireFeatureAccess(ctx, args.householdId, "vault_tags_collections");

    // Check if categories already exist
    const existing = await ctx.db
      .query("vaultCategories")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    if (existing.length > 0) {
      // Categories already exist, don't overwrite
      return 0;
    }

    // Get existing documents to count category assignments
    const documents = await ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Build a map of category name -> document count
    const categoryCountMap = new Map<string, number>();
    for (const doc of documents) {
      for (const categoryName of doc.categories) {
        categoryCountMap.set(categoryName, (categoryCountMap.get(categoryName) ?? 0) + 1);
      }
    }

    // Create default categories with accurate document counts
    let created = 0;
    for (const category of DEFAULT_CATEGORIES) {
      const documentCount = categoryCountMap.get(category.name) ?? 0;
      await ctx.db.insert("vaultCategories", {
        householdId: args.householdId,
        name: category.name,
        description: category.description,
        documentCount,
      });
      created++;
    }

    return created;
  },
});

// ============================================================================
// STORAGE MIGRATION & MAINTENANCE
// ============================================================================

/**
 * Recalculate storage usage and document count for a household
 *
 * Use this to:
 * 1. Initialize storageUsedBytes/vaultDocumentCount for existing households (migration)
 * 2. Fix any counter drift due to bugs or failed transactions
 *
 * This performs a full table scan, so use sparingly.
 */
export const recalculateStorageUsage = mutation({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    previousBytes: v.number(),
    calculatedBytes: v.number(),
    previousDocumentCount: v.number(),
    documentCount: v.number(),
  }),
  handler: async (ctx, args) => {
    // Require admin access to recalculate storage
    await requireHouseholdAdmin(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Calculate actual storage usage and count from documents
    const documents = await ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const calculatedBytes = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const previousBytes = household.storageUsedBytes ?? 0;
    const previousDocumentCount = household.vaultDocumentCount ?? 0;

    // Update both counters
    await ctx.db.patch(args.householdId, {
      storageUsedBytes: calculatedBytes,
      vaultDocumentCount: documents.length,
    });

    return {
      previousBytes,
      calculatedBytes,
      previousDocumentCount,
      documentCount: documents.length,
    };
  },
});

/**
 * Recalculate category document counts for a household
 *
 * Use this to:
 * 1. Initialize documentCount for existing categories (migration)
 * 2. Fix any counter drift due to bugs or failed transactions
 *
 * This performs a full table scan, so use sparingly.
 */
export const recalculateCategoryCounts = mutation({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    categoriesUpdated: v.number(),
    results: v.array(
      v.object({
        name: v.string(),
        previousCount: v.number(),
        calculatedCount: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    // Require admin access to recalculate
    await requireHouseholdAdmin(ctx, args.householdId);

    // Get all categories
    const categories = await ctx.db
      .query("vaultCategories")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Get all documents
    const documents = await ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Count documents per category
    const results: {
      name: string;
      previousCount: number;
      calculatedCount: number;
    }[] = [];

    for (const category of categories) {
      const calculatedCount = documents.filter((doc) =>
        doc.categories.includes(category.name),
      ).length;
      const previousCount = category.documentCount ?? 0;

      // Update the counter
      await ctx.db.patch(category._id, {
        documentCount: calculatedCount,
      });

      results.push({
        name: category.name,
        previousCount,
        calculatedCount,
      });
    }

    return {
      categoriesUpdated: categories.length,
      results,
    };
  },
});

// ============================================================================
// INTERNAL QUERIES (for use by actions)
// ============================================================================

/**
 * Internal query to check storage quota for actions
 * Used by vaultActions.generateUploadUrl to verify quota before providing upload URL
 *
 * Uses pre-computed `storageUsedBytes` counter for O(1) performance.
 *
 * SECURITY NOTE: This query does NOT verify household membership.
 * Callers MUST call requireHouseholdAccessInternal BEFORE calling this query
 * to verify the user has access to the household.
 *
 * The query intentionally returns quota info without auth to support
 * the pattern: check auth -> check quota -> proceed (used in vaultActions).
 */
export const checkStorageQuotaInternal = internalQuery({
  args: {
    householdId: v.id("households"),
    additionalBytes: v.number(),
  },
  returns: v.object({
    allowed: v.boolean(),
    currentBytes: v.number(),
    maxBytes: v.number(),
    remainingBytes: v.number(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get household and check subscription status
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      return {
        allowed: false,
        currentBytes: 0,
        maxBytes: 0,
        remainingBytes: 0,
        error: "Household not found",
      };
    }

    // Check subscription status
    if (household.subscriptionStatus !== "active") {
      return {
        allowed: false,
        currentBytes: 0,
        maxBytes: 0,
        remainingBytes: 0,
        error: `Subscription is ${household.subscriptionStatus}. Please update your subscription to continue.`,
      };
    }

    // Use tierOverride if set, otherwise fall back to subscriptionTier
    const effectiveTier = household.tierOverride ?? household.subscriptionTier;
    const limits = PLAN_LIMITS[effectiveTier];

    // Use pre-computed counter (defaults to 0 for backwards compatibility)
    const currentBytes = household.storageUsedBytes ?? 0;
    const remainingBytes = Math.max(0, limits.storageBytesMax - currentBytes);

    // Check if additional bytes would exceed limit
    if (currentBytes + args.additionalBytes > limits.storageBytesMax) {
      return {
        allowed: false,
        currentBytes,
        maxBytes: limits.storageBytesMax,
        remainingBytes,
        error: `Storage limit exceeded. Used: ${formatBytesAsGB(
          currentBytes,
        )}GB of ${formatBytesAsGB(limits.storageBytesMax)}GB. Upgrade your plan for more storage.`,
      };
    }

    return {
      allowed: true,
      currentBytes,
      maxBytes: limits.storageBytesMax,
      remainingBytes,
    };
  },
});
