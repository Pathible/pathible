import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalQuery, mutation, query } from "./_generated/server";
import {
  checkStorageQuota,
  PLAN_LIMITS,
  requireActiveSubscription,
  requireAuth,
  requireHouseholdAccess,
  requireHouseholdAdmin,
} from "./auth";
import { checkDocumentAccess } from "./vaultHelpers";

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

const accessLevelValidator = v.union(
  v.literal("household"),
  v.literal("admins"),
  v.literal("custom"),
);

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
    const paginatedResult = await query.paginate({ numItems: limit, cursor: args.cursor ?? null });

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
 * Includes document count for each category
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

    // Get all documents to count usage
    const documents = await ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Count documents per category
    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      documentCount: documents.filter((doc) => doc.categories.includes(category.name)).length,
    }));

    return categoriesWithCounts;
  },
});

/**
 * Get statistics for the vault
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
    const membership = await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    const documents = await ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Filter by access
    const accessibleDocs = documents.filter((doc) =>
      checkDocumentAccess(doc, profile._id, membership.role),
    );

    const categories = await ctx.db
      .query("vaultCategories")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Count recent uploads (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentDocs = accessibleDocs.filter((doc) => doc._creationTime >= thirtyDaysAgo);

    return {
      totalDocuments: accessibleDocs.length,
      totalSize: accessibleDocs.reduce((sum, doc) => sum + doc.fileSize, 0),
      totalCategories: categories.length,
      recentUploads: recentDocs.length,
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

    // Validate inputs
    if (!args.name.trim()) {
      throw new Error("Document name is required");
    }

    if (args.name.length > 255) {
      throw new Error("Document name is too long (max 255 characters)");
    }

    if (args.description && args.description.length > 1000) {
      throw new Error("Description is too long (max 1000 characters)");
    }

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
      name: args.name.trim(),
      description: args.description?.trim(),
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

    // Atomically increment storage counter on household
    const household = await ctx.db.get(args.householdId);
    if (household) {
      const currentStorage = household.storageUsedBytes ?? 0;
      await ctx.db.patch(args.householdId, {
        storageUsedBytes: currentStorage + args.fileSize,
      });
    }

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: args.householdId,
      userId: profile._id,
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
    const isAdmin = membership.role === "owner" || membership.role === "steward";
    const isUploader = document.uploadedBy === profile._id;

    if (!isAdmin && !isUploader) {
      throw new Error("Access denied: You do not have permission to edit this document");
    }

    // Build update object
    const updates: Partial<Doc<"vaultDocuments">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Document name cannot be empty");
      }
      if (args.name.length > 255) {
        throw new Error("Document name is too long (max 255 characters)");
      }
      updates.name = args.name.trim();
    }

    if (args.description !== undefined) {
      if (args.description && args.description.length > 1000) {
        throw new Error("Description is too long (max 1000 characters)");
      }
      updates.description = args.description?.trim();
    }

    if (args.categories !== undefined) {
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

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: document.householdId,
      userId: profile._id,
      actionType: "other",
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
    const isAdmin = membership.role === "owner" || membership.role === "steward";
    const isUploader = document.uploadedBy === profile._id;

    if (!isAdmin && !isUploader) {
      throw new Error("Access denied: You do not have permission to delete this document");
    }

    // Note: B2 file deletion must be handled separately via vaultActions.deleteFile
    // This mutation only deletes the database record
    // The client should call both: vault.remove() and vaultActions.deleteFile()

    // Atomically decrement storage counter on household
    const household = await ctx.db.get(document.householdId);
    if (household) {
      const currentStorage = household.storageUsedBytes ?? 0;
      await ctx.db.patch(document.householdId, {
        storageUsedBytes: Math.max(0, currentStorage - document.fileSize),
      });
    }

    // Delete the document record
    await ctx.db.delete(args.documentId);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: document.householdId,
      userId: profile._id,
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
 * SECURITY: Requires active subscription
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

    // Validate inputs
    if (!args.name.trim()) {
      throw new Error("Category name is required");
    }

    if (args.name.length > 50) {
      throw new Error("Category name is too long (max 50 characters)");
    }

    if (args.description && args.description.length > 200) {
      throw new Error("Description is too long (max 200 characters)");
    }

    // Check if category already exists
    const existing = await ctx.db
      .query("vaultCategories")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const duplicate = existing.find(
      (cat) => cat.name.toLowerCase() === args.name.trim().toLowerCase(),
    );

    if (duplicate) {
      throw new Error("A category with this name already exists");
    }

    // Create category
    const categoryId = await ctx.db.insert("vaultCategories", {
      householdId: args.householdId,
      name: args.name.trim(),
      description: args.description?.trim(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: args.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      description: `Created category: ${args.name}`,
    });

    return categoryId;
  },
});

/**
 * Update a category
 * Admins only
 *
 * SECURITY: Requires active subscription
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

    // Build update object
    const updates: Partial<Doc<"vaultCategories">> = {};

    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Category name cannot be empty");
      }
      if (args.name.length > 50) {
        throw new Error("Category name is too long (max 50 characters)");
      }

      // Check for duplicates
      const existing = await ctx.db
        .query("vaultCategories")
        .withIndex("by_household", (q) => q.eq("householdId", category.householdId))
        .collect();

      const duplicate = existing.find(
        (cat) =>
          cat._id !== args.categoryId && cat.name.toLowerCase() === args.name?.trim().toLowerCase(),
      );

      if (duplicate) {
        throw new Error("A category with this name already exists");
      }

      // Update all documents using the old category name
      const documents = await ctx.db
        .query("vaultDocuments")
        .withIndex("by_household", (q) => q.eq("householdId", category.householdId))
        .collect();

      const oldName = category.name;
      const newName = args.name.trim();

      for (const doc of documents) {
        if (doc.categories.includes(oldName)) {
          const updatedCategories = doc.categories.map((cat) => (cat === oldName ? newName : cat));
          await ctx.db.patch(doc._id, { categories: updatedCategories });
        }
      }

      updates.name = newName;
    }

    if (args.description !== undefined) {
      if (args.description && args.description.length > 200) {
        throw new Error("Description is too long (max 200 characters)");
      }
      updates.description = args.description?.trim();
    }

    // Update category
    await ctx.db.patch(args.categoryId, updates);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: category.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      description: `Updated category: ${updates.name || category.name}`,
    });

    return args.categoryId;
  },
});

/**
 * Delete a category
 * Admins only - removes category from all documents
 *
 * SECURITY: Requires active subscription
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

    // Remove category from all documents
    const documents = await ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", category.householdId))
      .collect();

    for (const doc of documents) {
      if (doc.categories.includes(category.name)) {
        const updatedCategories = doc.categories.filter((cat) => cat !== category.name);
        await ctx.db.patch(doc._id, { categories: updatedCategories });
      }
    }

    // Delete category
    await ctx.db.delete(args.categoryId);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: category.householdId,
      userId: profile._id,
      actionType: "other",
      entityType: "other",
      description: `Deleted category: ${category.name}`,
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
 */
export const initializeDefaultCategories = mutation({
  args: {
    householdId: v.id("households"),
  },
  returns: v.number(), // Returns count of categories created
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    // Check if categories already exist
    const existing = await ctx.db
      .query("vaultCategories")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    if (existing.length > 0) {
      // Categories already exist, don't overwrite
      return 0;
    }

    // Create default categories
    let created = 0;
    for (const category of DEFAULT_CATEGORIES) {
      await ctx.db.insert("vaultCategories", {
        householdId: args.householdId,
        name: category.name,
        description: category.description,
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
 * Recalculate storage usage for a household
 *
 * Use this to:
 * 1. Initialize storageUsedBytes for existing households (migration)
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
    documentCount: v.number(),
  }),
  handler: async (ctx, args) => {
    // Require admin access to recalculate storage
    await requireHouseholdAdmin(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Calculate actual storage usage from documents
    const documents = await ctx.db
      .query("vaultDocuments")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const calculatedBytes = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const previousBytes = household.storageUsedBytes ?? 0;

    // Update the counter
    await ctx.db.patch(args.householdId, {
      storageUsedBytes: calculatedBytes,
    });

    return {
      previousBytes,
      calculatedBytes,
      documentCount: documents.length,
    };
  },
});

// ============================================================================
// INTERNAL QUERIES (for use by actions)
// ============================================================================

/** Bytes per gigabyte constant */
const BYTES_PER_GB = 1024 * 1024 * 1024;

/** Sentinel value for unlimited resources */
const UNLIMITED = Number.MAX_SAFE_INTEGER;

/**
 * Format bytes as human-readable GB string
 */
function formatBytesAsGB(bytes: number): string {
  if (bytes === UNLIMITED) return "unlimited";
  return (bytes / BYTES_PER_GB).toFixed(2);
}

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

    const limits = PLAN_LIMITS[household.subscriptionTier];

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
        error: `Storage limit exceeded. Used: ${formatBytesAsGB(currentBytes)}GB of ${formatBytesAsGB(limits.storageBytesMax)}GB. Upgrade your plan for more storage.`,
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
