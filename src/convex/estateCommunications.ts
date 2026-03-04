import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireHouseholdAccess } from "./auth";
import { requireActiveEstate, requireExecutorAccess } from "./estateHelpers";
import { logActivity } from "./shared/activity";

/**
 * Estate Communications - Log of notifications and communications
 *
 * Tracks who has been contacted, when, via what method, and follow-up status.
 * Provides a complete audit trail of all estate-related communications.
 */

// ============================================================================
// VALIDATORS
// ============================================================================

const communicationMethodValidator = v.union(
  v.literal("phone"),
  v.literal("email"),
  v.literal("mail"),
  v.literal("in_person"),
  v.literal("online_portal"),
  v.literal("fax"),
  v.literal("other"),
);

const communicationCategoryValidator = v.union(
  v.literal("financial_institution"),
  v.literal("government_agency"),
  v.literal("insurance_company"),
  v.literal("legal"),
  v.literal("beneficiary"),
  v.literal("utility"),
  v.literal("employer"),
  v.literal("other"),
);

const communicationReturnValidator = v.object({
  _id: v.id("estateCommunications"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  activationId: v.id("estateActivations"),
  recipientName: v.string(),
  recipientOrganization: v.optional(v.string()),
  recipientEmail: v.optional(v.string()),
  recipientPhone: v.optional(v.string()),
  method: communicationMethodValidator,
  subject: v.string(),
  summary: v.string(),
  category: communicationCategoryValidator,
  relatedAssetId: v.optional(v.id("estateAssets")),
  followUpDate: v.optional(v.number()),
  followUpNotes: v.optional(v.string()),
  followUpCompleted: v.optional(v.boolean()),
  followUpCompletedAt: v.optional(v.number()),
  attachmentDocIds: v.optional(v.array(v.id("vaultDocuments"))),
  loggedBy: v.id("profiles"),
  communicationDate: v.number(),
  updatedAt: v.number(),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all communications for an estate activation.
 * Sorted by communication date, most recent first.
 */
export const listCommunications = query({
  args: {
    householdId: v.id("households"),
    category: v.optional(communicationCategoryValidator),
  },
  returns: v.array(communicationReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return [];
    }

    const categoryFilter = args.category;

    const communications = categoryFilter
      ? await ctx.db
          .query("estateCommunications")
          .withIndex("by_activation_and_category", (q) =>
            q.eq("activationId", activationId).eq("category", categoryFilter),
          )
          .collect()
      : await ctx.db
          .query("estateCommunications")
          .withIndex("by_activation", (q) => q.eq("activationId", activationId))
          .collect();

    communications.sort((a, b) => b.communicationDate - a.communicationDate);

    return communications;
  },
});

/**
 * Get a single communication by ID.
 */
export const getCommunication = query({
  args: { communicationId: v.id("estateCommunications") },
  returns: v.union(communicationReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const communication = await ctx.db.get(args.communicationId);
    if (!communication) return null;

    await requireHouseholdAccess(ctx, communication.householdId);
    return communication;
  },
});

/**
 * Get communications with pending follow-ups.
 * Returns only communications that have a follow-up date and are not yet completed.
 */
export const getFollowUps = query({
  args: { householdId: v.id("households") },
  returns: v.array(communicationReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return [];
    }

    const communications = await ctx.db
      .query("estateCommunications")
      .withIndex("by_activation", (q) => q.eq("activationId", activationId))
      .collect();

    const pendingFollowUps = communications.filter((c) => c.followUpDate && !c.followUpCompleted);

    pendingFollowUps.sort((a, b) => (a.followUpDate ?? 0) - (b.followUpDate ?? 0));

    return pendingFollowUps;
  },
});

/**
 * Get communication statistics for the dashboard.
 */
export const getCommunicationStats = query({
  args: { householdId: v.id("households") },
  returns: v.object({
    total: v.number(),
    pendingFollowUps: v.number(),
    overdueFollowUps: v.number(),
    byCategory: v.array(
      v.object({
        category: communicationCategoryValidator,
        count: v.number(),
      }),
    ),
    byMethod: v.array(
      v.object({
        method: communicationMethodValidator,
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return { total: 0, pendingFollowUps: 0, overdueFollowUps: 0, byCategory: [], byMethod: [] };
    }

    const communications = await ctx.db
      .query("estateCommunications")
      .withIndex("by_activation", (q) => q.eq("activationId", activationId))
      .collect();

    const now = Date.now();
    const pendingFollowUps = communications.filter(
      (c) => c.followUpDate && !c.followUpCompleted,
    ).length;
    const overdueFollowUps = communications.filter(
      (c) => c.followUpDate && !c.followUpCompleted && c.followUpDate < now,
    ).length;

    // Group by category
    const categoryMap = new Map<string, number>();
    for (const comm of communications) {
      categoryMap.set(comm.category, (categoryMap.get(comm.category) ?? 0) + 1);
    }
    const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category: category as (typeof communications)[number]["category"],
      count,
    }));

    // Group by method
    const methodMap = new Map<string, number>();
    for (const comm of communications) {
      methodMap.set(comm.method, (methodMap.get(comm.method) ?? 0) + 1);
    }
    const byMethod = Array.from(methodMap.entries()).map(([method, count]) => ({
      method: method as (typeof communications)[number]["method"],
      count,
    }));

    return {
      total: communications.length,
      pendingFollowUps,
      overdueFollowUps,
      byCategory,
      byMethod,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Log a new communication.
 */
export const logCommunication = mutation({
  args: {
    householdId: v.id("households"),
    recipientName: v.string(),
    recipientOrganization: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    method: communicationMethodValidator,
    subject: v.string(),
    summary: v.string(),
    category: communicationCategoryValidator,
    relatedAssetId: v.optional(v.id("estateAssets")),
    followUpDate: v.optional(v.number()),
    followUpNotes: v.optional(v.string()),
    attachmentDocIds: v.optional(v.array(v.id("vaultDocuments"))),
    communicationDate: v.number(),
  },
  returns: v.id("estateCommunications"),
  handler: async (ctx, args) => {
    const { profile } = await requireExecutorAccess(ctx, args.householdId);
    const activation = await requireActiveEstate(ctx, args.householdId);

    const recipientName = args.recipientName.trim();
    if (!recipientName) {
      throw new Error("Recipient name is required");
    }
    if (recipientName.length > 255) {
      throw new Error("Recipient name is too long (max 255 characters)");
    }

    const subject = args.subject.trim();
    if (!subject) {
      throw new Error("Subject is required");
    }
    if (subject.length > 255) {
      throw new Error("Subject is too long (max 255 characters)");
    }

    const summary = args.summary.trim();
    if (!summary) {
      throw new Error("Summary is required");
    }
    if (summary.length > 5000) {
      throw new Error("Summary is too long (max 5000 characters)");
    }

    const now = Date.now();
    const communicationId = await ctx.db.insert("estateCommunications", {
      householdId: args.householdId,
      activationId: activation._id,
      recipientName,
      recipientOrganization: args.recipientOrganization?.trim() || undefined,
      recipientEmail: args.recipientEmail?.trim() || undefined,
      recipientPhone: args.recipientPhone?.trim() || undefined,
      method: args.method,
      subject,
      summary,
      category: args.category,
      relatedAssetId: args.relatedAssetId,
      followUpDate: args.followUpDate,
      followUpNotes: args.followUpNotes?.trim() || undefined,
      attachmentDocIds: args.attachmentDocIds,
      loggedBy: profile._id,
      communicationDate: args.communicationDate,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_notification_sent",
      entityType: "estate_communication",
      entityId: communicationId,
      description: `Logged communication with ${recipientName}: ${subject}`,
    });

    return communicationId;
  },
});

/**
 * Update an existing communication log entry.
 */
export const updateCommunication = mutation({
  args: {
    communicationId: v.id("estateCommunications"),
    recipientName: v.optional(v.string()),
    recipientOrganization: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    method: v.optional(communicationMethodValidator),
    subject: v.optional(v.string()),
    summary: v.optional(v.string()),
    category: v.optional(communicationCategoryValidator),
    relatedAssetId: v.optional(v.id("estateAssets")),
    followUpDate: v.optional(v.number()),
    followUpNotes: v.optional(v.string()),
    attachmentDocIds: v.optional(v.array(v.id("vaultDocuments"))),
    communicationDate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const communication = await ctx.db.get(args.communicationId);
    if (!communication) {
      throw new Error("Communication not found");
    }

    const { profile } = await requireExecutorAccess(ctx, communication.householdId);
    await requireActiveEstate(ctx, communication.householdId);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.recipientName !== undefined) {
      const name = args.recipientName.trim();
      if (!name) throw new Error("Recipient name cannot be empty");
      if (name.length > 255) throw new Error("Recipient name is too long (max 255 characters)");
      updates.recipientName = name;
    }
    if (args.recipientOrganization !== undefined) {
      updates.recipientOrganization = args.recipientOrganization.trim() || undefined;
    }
    if (args.recipientEmail !== undefined) {
      updates.recipientEmail = args.recipientEmail.trim() || undefined;
    }
    if (args.recipientPhone !== undefined) {
      updates.recipientPhone = args.recipientPhone.trim() || undefined;
    }
    if (args.method !== undefined) {
      updates.method = args.method;
    }
    if (args.subject !== undefined) {
      const subject = args.subject.trim();
      if (!subject) throw new Error("Subject cannot be empty");
      if (subject.length > 255) throw new Error("Subject is too long (max 255 characters)");
      updates.subject = subject;
    }
    if (args.summary !== undefined) {
      const summary = args.summary.trim();
      if (!summary) throw new Error("Summary cannot be empty");
      if (summary.length > 5000) throw new Error("Summary is too long (max 5000 characters)");
      updates.summary = summary;
    }
    if (args.category !== undefined) {
      updates.category = args.category;
    }
    if (args.relatedAssetId !== undefined) {
      updates.relatedAssetId = args.relatedAssetId;
    }
    if (args.followUpDate !== undefined) {
      updates.followUpDate = args.followUpDate;
    }
    if (args.followUpNotes !== undefined) {
      updates.followUpNotes = args.followUpNotes.trim() || undefined;
    }
    if (args.attachmentDocIds !== undefined) {
      updates.attachmentDocIds = args.attachmentDocIds;
    }
    if (args.communicationDate !== undefined) {
      updates.communicationDate = args.communicationDate;
    }

    await ctx.db.patch(args.communicationId, updates);

    await logActivity(ctx, {
      householdId: communication.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_notification_sent",
      entityType: "estate_communication",
      entityId: args.communicationId,
      description: `Updated communication log: ${args.subject?.trim() || communication.subject}`,
    });

    return null;
  },
});

/**
 * Mark a follow-up as completed.
 */
export const markFollowUpComplete = mutation({
  args: {
    communicationId: v.id("estateCommunications"),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const communication = await ctx.db.get(args.communicationId);
    if (!communication) {
      throw new Error("Communication not found");
    }

    if (!communication.followUpDate) {
      throw new Error("This communication does not have a follow-up scheduled");
    }

    if (communication.followUpCompleted) {
      throw new Error("Follow-up is already marked as completed");
    }

    const { profile } = await requireExecutorAccess(ctx, communication.householdId);
    await requireActiveEstate(ctx, communication.householdId);

    const now = Date.now();
    await ctx.db.patch(args.communicationId, {
      followUpCompleted: true,
      followUpCompletedAt: now,
      followUpNotes: args.notes?.trim() || communication.followUpNotes,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: communication.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_notification_sent",
      entityType: "estate_communication",
      entityId: args.communicationId,
      description: `Completed follow-up for communication with ${communication.recipientName}`,
    });

    return null;
  },
});
