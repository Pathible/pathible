import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { requireHouseholdAccess } from "./auth";
import { requireActiveEstate, requireExecutorAccess } from "./estateHelpers";
import { logActivity } from "./shared/activity";

/**
 * Estate Documents - Document management overlay for estate administration
 *
 * Provides estate-specific categorization, verification tracking, and court
 * submission status on top of existing vault documents. Also handles secure
 * document sharing with time-limited, download-limited links.
 */

// ============================================================================
// VALIDATORS
// ============================================================================

const estateCategoryValidator = v.union(
  v.literal("will"),
  v.literal("trust"),
  v.literal("death_certificate"),
  v.literal("insurance_claim"),
  v.literal("deed"),
  v.literal("tax_return"),
  v.literal("bank_statement"),
  v.literal("court_filing"),
  v.literal("correspondence"),
  v.literal("beneficiary_designation"),
  v.literal("other"),
);

const verificationStatusValidator = v.union(
  v.literal("unverified"),
  v.literal("verified"),
  v.literal("needs_update"),
);

const estateDocumentReturnValidator = v.object({
  _id: v.id("estateDocuments"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  estateActivationId: v.id("estateActivations"),
  vaultDocumentId: v.id("vaultDocuments"),
  estateCategory: estateCategoryValidator,
  submittedTo: v.optional(v.string()),
  submittedAt: v.optional(v.number()),
  sharedWithAttorney: v.optional(v.boolean()),
  verificationStatus: verificationStatusValidator,
  notes: v.optional(v.string()),
  updatedAt: v.number(),
  // Joined vault document fields
  vaultDocumentName: v.string(),
  vaultDocumentFileType: v.string(),
  vaultDocumentFileSize: v.number(),
});

const shareStatusValidator = v.union(
  v.literal("active"),
  v.literal("expired"),
  v.literal("revoked"),
  v.literal("exhausted"),
);

const documentShareReturnValidator = v.object({
  _id: v.id("documentShares"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  estateActivationId: v.id("estateActivations"),
  vaultDocumentId: v.id("vaultDocuments"),
  sharedBy: v.id("profiles"),
  recipientName: v.string(),
  recipientEmail: v.string(),
  recipientRole: v.optional(v.string()),
  expiresAt: v.number(),
  maxDownloads: v.number(),
  downloadCount: v.number(),
  status: shareStatusValidator,
  lastAccessedAt: v.optional(v.number()),
  revokedAt: v.optional(v.number()),
  revokedBy: v.optional(v.id("profiles")),
  createdAt: v.number(),
  // Joined vault document name
  vaultDocumentName: v.string(),
});

const shareByTokenReturnValidator = v.object({
  documentName: v.string(),
  recipientName: v.string(),
  expiresAt: v.number(),
  status: shareStatusValidator,
  downloadCount: v.number(),
  maxDownloads: v.number(),
});

const accessLogReturnValidator = v.object({
  _id: v.id("documentShareAccessLog"),
  _creationTime: v.number(),
  documentShareId: v.id("documentShares"),
  accessedAt: v.number(),
  action: v.union(v.literal("viewed"), v.literal("downloaded")),
});

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_NOTES_LENGTH = 2000;
const MAX_SUBMITTED_TO_LENGTH = 255;
const MAX_RECIPIENT_NAME_LENGTH = 255;
const MAX_RECIPIENT_EMAIL_LENGTH = 255;
const MAX_RECIPIENT_ROLE_LENGTH = 100;
const MAX_ACTIVE_SHARES_PER_ESTATE = 100;
const DEFAULT_MAX_DOWNLOADS = 10;
const DEFAULT_EXPIRY_HOURS = 168; // 7 days
const MAX_EXPIRY_HOURS = 720; // 30 days
const TOKEN_LENGTH = 43; // base64url of 32 bytes

// ============================================================================
// DOCUMENT QUERIES
// ============================================================================

/**
 * List estate documents for an activation, optionally filtered by category.
 * Joins with vault document data. Skips orphaned references where vault doc was deleted.
 */
export const listEstateDocuments = query({
  args: {
    householdId: v.id("households"),
    category: v.optional(estateCategoryValidator),
  },
  returns: v.array(estateDocumentReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return [];
    }

    const categoryFilter = args.category;
    const docs = categoryFilter
      ? await ctx.db
          .query("estateDocuments")
          .withIndex("by_estate_and_category", (q) =>
            q.eq("estateActivationId", activationId).eq("estateCategory", categoryFilter),
          )
          .collect()
      : await ctx.db
          .query("estateDocuments")
          .withIndex("by_estate", (q) => q.eq("estateActivationId", activationId))
          .collect();

    // Join with vault documents, skip orphaned refs
    const results: (typeof estateDocumentReturnValidator.type)[] = [];
    for (const doc of docs) {
      const vaultDoc = await ctx.db.get(doc.vaultDocumentId);
      if (!vaultDoc) continue;

      results.push({
        ...doc,
        vaultDocumentName: vaultDoc.name,
        vaultDocumentFileType: vaultDoc.fileType,
        vaultDocumentFileSize: vaultDoc.fileSize,
      });
    }

    results.sort((a, b) => b._creationTime - a._creationTime);

    return results;
  },
});

/**
 * Get a single estate document by ID with joined vault data.
 */
export const getEstateDocument = query({
  args: { estateDocumentId: v.id("estateDocuments") },
  returns: v.union(estateDocumentReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.estateDocumentId);
    if (!doc) return null;

    await requireHouseholdAccess(ctx, doc.householdId);

    const vaultDoc = await ctx.db.get(doc.vaultDocumentId);
    if (!vaultDoc) return null;

    return {
      ...doc,
      vaultDocumentName: vaultDoc.name,
      vaultDocumentFileType: vaultDoc.fileType,
      vaultDocumentFileSize: vaultDoc.fileSize,
    };
  },
});

/**
 * Get document statistics for an estate activation.
 */
export const getEstateDocumentStats = query({
  args: { householdId: v.id("households") },
  returns: v.object({
    total: v.number(),
    byCategory: v.array(
      v.object({
        category: estateCategoryValidator,
        count: v.number(),
      }),
    ),
    byVerification: v.array(
      v.object({
        status: verificationStatusValidator,
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return { total: 0, byCategory: [], byVerification: [] };
    }

    const docs = await ctx.db
      .query("estateDocuments")
      .withIndex("by_estate", (q) => q.eq("estateActivationId", activationId))
      .collect();

    const total = docs.length;

    const categoryMap = new Map<string, number>();
    const verificationMap = new Map<string, number>();
    for (const doc of docs) {
      categoryMap.set(doc.estateCategory, (categoryMap.get(doc.estateCategory) ?? 0) + 1);
      verificationMap.set(
        doc.verificationStatus,
        (verificationMap.get(doc.verificationStatus) ?? 0) + 1,
      );
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category: category as typeof estateCategoryValidator.type,
      count,
    }));

    const byVerification = Array.from(verificationMap.entries()).map(([status, count]) => ({
      status: status as typeof verificationStatusValidator.type,
      count,
    }));

    return { total, byCategory, byVerification };
  },
});

// ============================================================================
// DOCUMENT MUTATIONS
// ============================================================================

/**
 * Categorize a vault document for estate use (create or update overlay).
 */
export const categorizeDocument = mutation({
  args: {
    vaultDocumentId: v.id("vaultDocuments"),
    householdId: v.id("households"),
    estateCategory: estateCategoryValidator,
    notes: v.optional(v.string()),
  },
  returns: v.id("estateDocuments"),
  handler: async (ctx, args) => {
    const { profile } = await requireExecutorAccess(ctx, args.householdId);
    const activation = await requireActiveEstate(ctx, args.householdId);

    // Verify vault document exists and belongs to this household
    const vaultDoc = await ctx.db.get(args.vaultDocumentId);
    if (!vaultDoc || vaultDoc.householdId !== args.householdId) {
      throw new Error("Document not found in this household");
    }

    if (args.notes && args.notes.length > MAX_NOTES_LENGTH) {
      throw new Error(`Notes are too long (max ${MAX_NOTES_LENGTH} characters)`);
    }

    // Check if an overlay already exists for this vault doc in this activation
    const existing = await ctx.db
      .query("estateDocuments")
      .withIndex("by_vault_document", (q) => q.eq("vaultDocumentId", args.vaultDocumentId))
      .collect();

    const existingForActivation = existing.find((d) => d.estateActivationId === activation._id);

    const now = Date.now();

    if (existingForActivation) {
      // Update existing overlay
      await ctx.db.patch(existingForActivation._id, {
        estateCategory: args.estateCategory,
        notes: args.notes?.trim() || undefined,
        updatedAt: now,
      });

      await logActivity(ctx, {
        householdId: args.householdId,
        userId: profile._id,
        module: "estate",
        actionType: "estate_document_shared",
        entityType: "estate_document",
        entityId: existingForActivation._id,
        description: `Updated estate category for "${vaultDoc.name}" to ${args.estateCategory}`,
      });

      return existingForActivation._id;
    }

    // Create new overlay
    const docId = await ctx.db.insert("estateDocuments", {
      householdId: args.householdId,
      estateActivationId: activation._id,
      vaultDocumentId: args.vaultDocumentId,
      estateCategory: args.estateCategory,
      verificationStatus: "unverified",
      notes: args.notes?.trim() || undefined,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_document_shared",
      entityType: "estate_document",
      entityId: docId,
      description: `Categorized "${vaultDoc.name}" as ${args.estateCategory} for estate`,
    });

    return docId;
  },
});

/**
 * Mark a document as submitted to an entity (court, institution, etc.).
 */
export const markDocumentSubmitted = mutation({
  args: {
    estateDocumentId: v.id("estateDocuments"),
    submittedTo: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.estateDocumentId);
    if (!doc) {
      throw new Error("Estate document not found");
    }

    const { profile } = await requireExecutorAccess(ctx, doc.householdId);
    await requireActiveEstate(ctx, doc.householdId);

    const submittedTo = args.submittedTo.trim();
    if (!submittedTo) {
      throw new Error("Submitted to is required");
    }
    if (submittedTo.length > MAX_SUBMITTED_TO_LENGTH) {
      throw new Error(`Submitted to is too long (max ${MAX_SUBMITTED_TO_LENGTH} characters)`);
    }

    const now = Date.now();
    await ctx.db.patch(args.estateDocumentId, {
      submittedTo,
      submittedAt: now,
      updatedAt: now,
    });

    const vaultDoc = await ctx.db.get(doc.vaultDocumentId);
    const docName = vaultDoc?.name ?? "Unknown document";

    await logActivity(ctx, {
      householdId: doc.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_document_shared",
      entityType: "estate_document",
      entityId: args.estateDocumentId,
      description: `Marked "${docName}" as submitted to ${submittedTo}`,
    });

    return null;
  },
});

/**
 * Update verification status of an estate document.
 */
export const verifyDocument = mutation({
  args: {
    estateDocumentId: v.id("estateDocuments"),
    verificationStatus: verificationStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.estateDocumentId);
    if (!doc) {
      throw new Error("Estate document not found");
    }

    const { profile } = await requireExecutorAccess(ctx, doc.householdId);
    await requireActiveEstate(ctx, doc.householdId);

    await ctx.db.patch(args.estateDocumentId, {
      verificationStatus: args.verificationStatus,
      updatedAt: Date.now(),
    });

    const vaultDoc = await ctx.db.get(doc.vaultDocumentId);
    const docName = vaultDoc?.name ?? "Unknown document";

    await logActivity(ctx, {
      householdId: doc.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_document_shared",
      entityType: "estate_document",
      entityId: args.estateDocumentId,
      description: `Set verification status of "${docName}" to ${args.verificationStatus}`,
    });

    return null;
  },
});

// ============================================================================
// DOCUMENT SHARING QUERIES
// ============================================================================

/**
 * List document shares for an estate activation, optionally filtered by status.
 */
export const listDocumentShares = query({
  args: {
    householdId: v.id("households"),
    status: v.optional(shareStatusValidator),
  },
  returns: v.array(documentShareReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return [];
    }

    const statusFilter = args.status;
    const shares = statusFilter
      ? await ctx.db
          .query("documentShares")
          .withIndex("by_estate_and_status", (q) =>
            q.eq("estateActivationId", activationId).eq("status", statusFilter),
          )
          .collect()
      : await ctx.db
          .query("documentShares")
          .withIndex("by_estate", (q) => q.eq("estateActivationId", activationId))
          .collect();

    // Join with vault document names
    const results: (typeof documentShareReturnValidator.type)[] = [];
    for (const share of shares) {
      const vaultDoc = await ctx.db.get(share.vaultDocumentId);
      if (!vaultDoc) continue;

      // Exclude shareToken from response for security
      results.push({
        _id: share._id,
        _creationTime: share._creationTime,
        householdId: share.householdId,
        estateActivationId: share.estateActivationId,
        vaultDocumentId: share.vaultDocumentId,
        sharedBy: share.sharedBy,
        recipientName: share.recipientName,
        recipientEmail: share.recipientEmail,
        recipientRole: share.recipientRole,
        expiresAt: share.expiresAt,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
        status: share.status,
        lastAccessedAt: share.lastAccessedAt,
        revokedAt: share.revokedAt,
        revokedBy: share.revokedBy,
        createdAt: share.createdAt,
        vaultDocumentName: vaultDoc.name,
      });
    }

    results.sort((a, b) => b.createdAt - a.createdAt);

    return results;
  },
});

/**
 * Get minimal share metadata by token. Public query (no auth required).
 * Returns only document name, expiry, and status — no sensitive data.
 */
export const getShareByToken = query({
  args: { token: v.string() },
  returns: v.union(shareByTokenReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("documentShares")
      .withIndex("by_token", (q) => q.eq("shareToken", args.token))
      .unique();

    if (!share) return null;

    const vaultDoc = await ctx.db.get(share.vaultDocumentId);
    if (!vaultDoc) return null;

    return {
      documentName: vaultDoc.name,
      recipientName: share.recipientName,
      expiresAt: share.expiresAt,
      status: share.status,
      downloadCount: share.downloadCount,
      maxDownloads: share.maxDownloads,
    };
  },
});

/**
 * Get the access log for a document share.
 */
export const getShareAccessLog = query({
  args: { shareId: v.id("documentShares") },
  returns: v.array(accessLogReturnValidator),
  handler: async (ctx, args) => {
    const share = await ctx.db.get(args.shareId);
    if (!share) return [];

    await requireHouseholdAccess(ctx, share.householdId);

    const logs = await ctx.db
      .query("documentShareAccessLog")
      .withIndex("by_share", (q) => q.eq("documentShareId", args.shareId))
      .collect();

    logs.sort((a, b) => b.accessedAt - a.accessedAt);

    return logs;
  },
});

// ============================================================================
// DOCUMENT SHARING MUTATIONS
// ============================================================================

/**
 * Create a secure document share link.
 * Generates a strong random token for time-limited, download-limited access.
 */
export const createDocumentShare = mutation({
  args: {
    vaultDocumentId: v.id("vaultDocuments"),
    householdId: v.id("households"),
    recipientName: v.string(),
    recipientEmail: v.string(),
    recipientRole: v.optional(v.string()),
    expiresInHours: v.optional(v.number()),
    maxDownloads: v.optional(v.number()),
  },
  returns: v.object({
    shareId: v.id("documentShares"),
    shareToken: v.string(),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireExecutorAccess(ctx, args.householdId);
    const activation = await requireActiveEstate(ctx, args.householdId);

    // Verify vault document exists and belongs to this household
    const vaultDoc = await ctx.db.get(args.vaultDocumentId);
    if (!vaultDoc || vaultDoc.householdId !== args.householdId) {
      throw new Error("Document not found in this household");
    }

    // Validate inputs
    const recipientName = args.recipientName.trim();
    if (!recipientName) {
      throw new Error("Recipient name is required");
    }
    if (recipientName.length > MAX_RECIPIENT_NAME_LENGTH) {
      throw new Error(`Recipient name is too long (max ${MAX_RECIPIENT_NAME_LENGTH} characters)`);
    }

    const recipientEmail = args.recipientEmail.trim().toLowerCase();
    if (!recipientEmail || !recipientEmail.includes("@")) {
      throw new Error("A valid recipient email is required");
    }
    if (recipientEmail.length > MAX_RECIPIENT_EMAIL_LENGTH) {
      throw new Error(`Recipient email is too long (max ${MAX_RECIPIENT_EMAIL_LENGTH} characters)`);
    }

    if (args.recipientRole && args.recipientRole.length > MAX_RECIPIENT_ROLE_LENGTH) {
      throw new Error(`Recipient role is too long (max ${MAX_RECIPIENT_ROLE_LENGTH} characters)`);
    }

    const expiresInHours = args.expiresInHours ?? DEFAULT_EXPIRY_HOURS;
    if (expiresInHours < 1 || expiresInHours > MAX_EXPIRY_HOURS) {
      throw new Error(`Expiry must be between 1 hour and ${MAX_EXPIRY_HOURS} hours`);
    }

    const maxDownloads = args.maxDownloads ?? DEFAULT_MAX_DOWNLOADS;
    if (maxDownloads < 1 || maxDownloads > 100) {
      throw new Error("Max downloads must be between 1 and 100");
    }

    // Check active share limit per estate
    const activeShares = await ctx.db
      .query("documentShares")
      .withIndex("by_estate_and_status", (q) =>
        q.eq("estateActivationId", activation._id).eq("status", "active"),
      )
      .collect();

    if (activeShares.length >= MAX_ACTIVE_SHARES_PER_ESTATE) {
      throw new Error(
        `Maximum of ${MAX_ACTIVE_SHARES_PER_ESTATE} active shares per estate. Revoke existing shares first.`,
      );
    }

    // Generate strong random token (256-bit)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const shareToken = btoa(String.fromCharCode(...tokenBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
      .slice(0, TOKEN_LENGTH);

    const now = Date.now();
    const expiresAt = now + expiresInHours * 60 * 60 * 1000;

    const shareId = await ctx.db.insert("documentShares", {
      householdId: args.householdId,
      estateActivationId: activation._id,
      vaultDocumentId: args.vaultDocumentId,
      sharedBy: profile._id,
      recipientName,
      recipientEmail,
      recipientRole: args.recipientRole?.trim() || undefined,
      shareToken,
      expiresAt,
      maxDownloads,
      downloadCount: 0,
      status: "active",
      createdAt: now,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_document_shared",
      entityType: "estate_document_share",
      entityId: shareId,
      description: `Shared "${vaultDoc.name}" with ${recipientName} (${recipientEmail})`,
    });

    return { shareId, shareToken };
  },
});

/**
 * Revoke a document share.
 */
export const revokeDocumentShare = mutation({
  args: { shareId: v.id("documentShares") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const share = await ctx.db.get(args.shareId);
    if (!share) {
      throw new Error("Document share not found");
    }

    const { profile } = await requireExecutorAccess(ctx, share.householdId);

    if (share.status !== "active") {
      throw new Error("Only active shares can be revoked");
    }

    const now = Date.now();
    await ctx.db.patch(args.shareId, {
      status: "revoked",
      revokedAt: now,
      revokedBy: profile._id,
    });

    const vaultDoc = await ctx.db.get(share.vaultDocumentId);
    const docName = vaultDoc?.name ?? "Unknown document";

    await logActivity(ctx, {
      householdId: share.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_document_shared",
      entityType: "estate_document_share",
      entityId: args.shareId,
      description: `Revoked share of "${docName}" to ${share.recipientName}`,
    });

    return null;
  },
});

/**
 * Log access to a shared document and update counters.
 * Increments downloadCount and checks exhaustion.
 */
export const logShareAccess = mutation({
  args: {
    shareToken: v.string(),
    action: v.union(v.literal("viewed"), v.literal("downloaded")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("documentShares")
      .withIndex("by_token", (q) => q.eq("shareToken", args.shareToken))
      .unique();

    if (!share) {
      throw new Error("Share not found");
    }

    if (share.status !== "active") {
      throw new Error("Share is no longer active");
    }

    const now = Date.now();

    // Check expiry
    if (now > share.expiresAt) {
      await ctx.db.patch(share._id, { status: "expired" });
      throw new Error("Share has expired");
    }

    // Log the access
    await ctx.db.insert("documentShareAccessLog", {
      documentShareId: share._id,
      accessedAt: now,
      action: args.action,
    });

    // Update counters
    const updates: Record<string, unknown> = { lastAccessedAt: now };

    if (args.action === "downloaded") {
      const newCount = share.downloadCount + 1;
      updates.downloadCount = newCount;

      if (newCount >= share.maxDownloads) {
        updates.status = "exhausted";
      }
    }

    await ctx.db.patch(share._id, updates);

    return null;
  },
});

// ============================================================================
// INTERNAL FUNCTIONS (for API routes and crons)
// ============================================================================

/**
 * Get the B2 file name for a shared document by token.
 * Used by the public share API route to generate download URLs.
 * Returns null if share is invalid, expired, revoked, or exhausted.
 */
export const getShareDocumentB2Info = internalQuery({
  args: { token: v.string() },
  returns: v.union(
    v.object({
      b2FileName: v.string(),
      documentName: v.string(),
      fileType: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("documentShares")
      .withIndex("by_token", (q) => q.eq("shareToken", args.token))
      .unique();

    if (!share) return null;
    if (share.status !== "active") return null;
    if (Date.now() > share.expiresAt) return null;
    if (share.downloadCount >= share.maxDownloads) return null;

    const vaultDoc = await ctx.db.get(share.vaultDocumentId);
    if (!vaultDoc) return null;

    return {
      b2FileName: vaultDoc.b2FileName,
      documentName: vaultDoc.name,
      fileType: vaultDoc.fileType,
    };
  },
});

/**
 * Expire all active shares that have passed their expiresAt time.
 * Called by daily cron job.
 */
export const expireDocumentShares = internalMutation({
  args: {},
  returns: v.object({ expiredCount: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const activeShares = await ctx.db
      .query("documentShares")
      .withIndex("by_estate_and_status")
      .collect();

    let expiredCount = 0;
    for (const share of activeShares) {
      if (share.status === "active" && share.expiresAt < now) {
        await ctx.db.patch(share._id, { status: "expired" });
        expiredCount++;
      }
    }

    return { expiredCount };
  },
});

/**
 * Clean up old document share access log entries (older than 1 year).
 * Called by weekly cron job to prevent unbounded table growth.
 */
export const cleanupShareAccessLogs = internalMutation({
  args: {},
  returns: v.object({ deletedCount: v.number() }),
  handler: async (ctx) => {
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const oldLogs = await ctx.db.query("documentShareAccessLog").withIndex("by_share").collect();

    let deletedCount = 0;
    for (const log of oldLogs) {
      if (log.accessedAt < oneYearAgo) {
        await ctx.db.delete(log._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});
