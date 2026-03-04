import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAuth, requireFeatureAccess, requireHouseholdAccess } from "./auth";
import { requireActiveEstate, requireExecutorAccess } from "./estateHelpers";
import { estateChecklistTemplates } from "./seeds/estateChecklistTemplates";
import { logActivity } from "./shared/activity";

/**
 * Estate Administration - Activation & Lifecycle
 *
 * This module handles estate activation with safety mechanisms:
 * - 48-hour cooldown before locks take effect
 * - Contest mechanism for owner/steward to challenge activation
 * - Grace period for subscription enforcement
 * - Activity logging for full audit trail
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const COOLDOWN_MS = 48 * 60 * 60 * 1000; // 48 hours
const GRACE_PERIOD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
const MAX_NAME_LENGTH = 255;
const MAX_NOTES_LENGTH = 2000;
const MAX_REASON_LENGTH = 1000;

// ============================================================================
// VALIDATORS
// ============================================================================

const estateActivationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("active"),
  v.literal("contested"),
  v.literal("completed"),
  v.literal("cancelled"),
);

const activationReturnValidator = v.object({
  _id: v.id("estateActivations"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  activatedBy: v.id("profiles"),
  deceasedName: v.string(),
  deceasedProfileId: v.optional(v.id("profiles")),
  dateOfDeath: v.optional(v.number()),
  status: estateActivationStatusValidator,
  deathCertificateDocId: v.optional(v.id("vaultDocuments")),
  cooldownEndsAt: v.number(),
  contestedBy: v.optional(v.id("profiles")),
  contestedAt: v.optional(v.number()),
  activatedAt: v.number(),
  completedAt: v.optional(v.number()),
  cancelledAt: v.optional(v.number()),
  cancelReason: v.optional(v.string()),
  notes: v.optional(v.string()),
  cooldownJobId: v.optional(v.id("_scheduled_functions")),
  updatedAt: v.number(),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the current estate activation for a household.
 * Returns null if no activation exists.
 */
export const getActivation = query({
  args: { householdId: v.id("households") },
  returns: v.union(activationReturnValidator, v.null()),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    if (!household?.estateActivationId) {
      return null;
    }

    const activation = await ctx.db.get(household.estateActivationId);
    return activation ?? null;
  },
});

/**
 * Get whether the current user is designated as an executor.
 *
 * Checks both householdMemberships (role === "executor") and
 * keyContacts (role === "executor") for the pre-activation card.
 */
export const getExecutorDesignation = query({
  args: { householdId: v.id("households") },
  returns: v.object({
    isExecutor: v.boolean(),
    isMembershipExecutor: v.boolean(),
    isKeyContactExecutor: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    const membership = await requireHouseholdAccess(ctx, args.householdId);

    const isMembershipExecutor = membership.role === "executor";

    // Check if user is listed as an executor in key contacts
    const keyContacts = await ctx.db
      .query("keyContacts")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const isKeyContactExecutor = keyContacts.some(
      (contact) =>
        contact.role === "executor" &&
        contact.email &&
        profile.email &&
        contact.email.toLowerCase() === profile.email.toLowerCase(),
    );

    return {
      isExecutor: isMembershipExecutor || isKeyContactExecutor,
      isMembershipExecutor,
      isKeyContactExecutor,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Activate estate administration.
 *
 * Creates an activation with status "pending" and a 48-hour cooldown.
 * Does NOT set estateMode: true yet -- that happens after cooldown completes.
 * Sends notifications to ALL household members.
 * Schedules completeCooldown via ctx.scheduler.runAfter(48h).
 */
export const activateEstate = mutation({
  args: {
    householdId: v.id("households"),
    deceasedName: v.string(),
    deceasedProfileId: v.optional(v.id("profiles")),
    dateOfDeath: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  returns: v.id("estateActivations"),
  handler: async (ctx, args) => {
    // Require executor role + Legacy tier
    // TODO: Consider requiring step-up authentication (re-enter password / MFA)
    // for this sensitive, hard-to-reverse action. Clerk supports step-up auth
    // via session.verify() on the client before calling this mutation.
    const { profile } = await requireExecutorAccess(ctx, args.householdId);
    await requireFeatureAccess(ctx, args.householdId, "estate_administration");

    // Validate deceased name
    const deceasedName = args.deceasedName.trim();
    if (!deceasedName) {
      throw new Error("Deceased name is required");
    }
    if (deceasedName.length > MAX_NAME_LENGTH) {
      throw new Error(`Deceased name is too long (max ${MAX_NAME_LENGTH} characters)`);
    }

    if (args.notes && args.notes.length > MAX_NOTES_LENGTH) {
      throw new Error(`Notes are too long (max ${MAX_NOTES_LENGTH} characters)`);
    }

    // Check for existing active/pending/contested activation using compound index
    const pendingActivation = await ctx.db
      .query("estateActivations")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "pending"),
      )
      .first();
    const activeActivation = await ctx.db
      .query("estateActivations")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "active"),
      )
      .first();
    const contestedActivation = await ctx.db
      .query("estateActivations")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "contested"),
      )
      .first();

    if (pendingActivation || activeActivation || contestedActivation) {
      throw new Error("An estate activation is already in progress for this household");
    }

    const now = Date.now();

    // Rate limit: prevent activation spam after cancellation (24-hour cooldown)
    const cancelledActivations = await ctx.db
      .query("estateActivations")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "cancelled"),
      )
      .collect();
    const recentCancel = cancelledActivations.find(
      (a) => a.cancelledAt && now - a.cancelledAt < 24 * 60 * 60 * 1000,
    );
    if (recentCancel) {
      throw new Error("Please wait 24 hours after cancellation before activating again");
    }

    const cooldownEndsAt = now + COOLDOWN_MS;

    // Create the activation record
    const activationId = await ctx.db.insert("estateActivations", {
      householdId: args.householdId,
      activatedBy: profile._id,
      deceasedName,
      deceasedProfileId: args.deceasedProfileId,
      dateOfDeath: args.dateOfDeath,
      status: "pending",
      cooldownEndsAt,
      activatedAt: now,
      notes: args.notes?.trim() || undefined,
      updatedAt: now,
    });

    // Link activation to household (but don't set estateMode yet)
    await ctx.db.patch(args.householdId, {
      estateActivationId: activationId,
      updatedAt: now,
    });

    // Schedule cooldown completion and store the job ID
    const cooldownJobId = await ctx.scheduler.runAfter(
      COOLDOWN_MS,
      internal.estate.completeCooldown,
      { estateActivationId: activationId },
    );
    await ctx.db.patch(activationId, { cooldownJobId });

    // Notify ALL household members
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "active"),
      )
      .collect();

    for (const membership of memberships) {
      if (membership.userId === profile._id) continue; // Don't notify the activator

      await ctx.db.insert("notifications", {
        userId: membership.userId,
        householdId: args.householdId,
        type: "estate_activation",
        title: "Estate Administration Initiated",
        message: `${profile.firstName} ${profile.lastName} has initiated estate administration for ${deceasedName}. A 48-hour review period is in effect. If this was done in error, household owners or stewards can contest this action from the Estate page before the review period ends.`,
        link: "/estate",
        isRead: false,
      });
    }

    // Log activity
    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_activated",
      entityType: "estate_activation",
      entityId: activationId,
      description: `Initiated estate administration for ${deceasedName}`,
    });

    return activationId;
  },
});

/**
 * Contest an estate activation.
 *
 * Only owner or steward can contest. Sets status to "contested" and
 * freezes the cooldown. Sends notification to the executor.
 */
export const contestActivation = mutation({
  args: { estateActivationId: v.id("estateActivations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const activation = await ctx.db.get(args.estateActivationId);
    if (!activation) {
      throw new Error("Estate activation not found");
    }

    if (activation.status !== "pending") {
      throw new Error("Only pending activations can be contested");
    }

    const { profile } = await requireAuth(ctx);
    const membership = await requireHouseholdAccess(ctx, activation.householdId);

    // Only owner or steward can contest
    if (membership.role !== "owner" && membership.role !== "steward") {
      throw new Error("Only household owners or stewards can contest an estate activation");
    }

    const now = Date.now();

    // Cancel the pending cooldown job
    if (activation.cooldownJobId) {
      await ctx.scheduler.cancel(activation.cooldownJobId);
    }

    // Set status to contested
    await ctx.db.patch(args.estateActivationId, {
      status: "contested",
      contestedBy: profile._id,
      contestedAt: now,
      cooldownJobId: undefined,
      updatedAt: now,
    });

    // Notify the executor who activated
    await ctx.db.insert("notifications", {
      userId: activation.activatedBy,
      householdId: activation.householdId,
      type: "estate_contested",
      title: "Estate Activation Contested",
      message: `${profile.firstName} ${profile.lastName} has contested the estate activation. An administrator will review this.`,
      link: "/estate",
      isRead: false,
    });

    // Log activity
    await logActivity(ctx, {
      householdId: activation.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_contested",
      entityType: "estate_activation",
      entityId: args.estateActivationId,
      description: `Contested estate activation for ${activation.deceasedName}`,
    });

    return null;
  },
});

/**
 * Resolve a contested estate activation.
 *
 * **Platform admin only** — uses requireAdmin() to verify the caller has the
 * "admin" role in the userRoles table. This is intentionally NOT household-level
 * admin (owner/steward) to prevent an executor who is also a steward from
 * resolving their own contest. Only a platform administrator can adjudicate.
 *
 * Either approves (resumes activation with a fresh 48-hour cooldown) or cancels.
 */
export const resolveContest = mutation({
  args: {
    estateActivationId: v.id("estateActivations"),
    resolution: v.union(v.literal("approve"), v.literal("cancel")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const activation = await ctx.db.get(args.estateActivationId);
    if (!activation) {
      throw new Error("Estate activation not found");
    }

    if (activation.status !== "contested") {
      throw new Error("Only contested activations can be resolved");
    }

    // Platform admin only — NOT household admin (see JSDoc above)
    const { profile } = await requireAuth(ctx);

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
      .unique();

    if (!userRole || userRole.role !== "admin") {
      throw new Error("Platform admin access required to resolve contested activations");
    }

    const now = Date.now();

    if (args.resolution === "approve") {
      // Resume activation: set back to pending and schedule cooldown
      const newCooldownEndsAt = now + COOLDOWN_MS;

      // Re-schedule cooldown completion and store the job ID
      const newCooldownJobId = await ctx.scheduler.runAfter(
        COOLDOWN_MS,
        internal.estate.completeCooldown,
        { estateActivationId: args.estateActivationId },
      );

      await ctx.db.patch(args.estateActivationId, {
        status: "pending",
        cooldownEndsAt: newCooldownEndsAt,
        cooldownJobId: newCooldownJobId,
        updatedAt: now,
      });
    } else {
      // Cancel the activation
      await ctx.db.patch(args.estateActivationId, {
        status: "cancelled",
        cancelledAt: now,
        cancelReason: "Cancelled after contest resolution by administrator",
        updatedAt: now,
      });

      // Clear household link
      await ctx.db.patch(activation.householdId, {
        estateActivationId: undefined,
        updatedAt: now,
      });
    }

    // Notify both parties
    const notifyUserIds: Id<"profiles">[] = [activation.activatedBy];
    if (activation.contestedBy) {
      notifyUserIds.push(activation.contestedBy);
    }

    for (const userId of notifyUserIds) {
      if (userId === profile._id) continue;

      await ctx.db.insert("notifications", {
        userId,
        householdId: activation.householdId,
        type: "estate_update",
        title:
          args.resolution === "approve"
            ? "Estate Activation Approved"
            : "Estate Activation Cancelled",
        message:
          args.resolution === "approve"
            ? "The contested estate activation has been approved. The 48-hour review period has been restarted."
            : "The contested estate activation has been cancelled by an administrator.",
        link: "/estate",
        isRead: false,
      });
    }

    // Log activity — include admin identity and resolution for audit trail
    await logActivity(ctx, {
      householdId: activation.householdId,
      userId: profile._id,
      module: "estate",
      actionType: args.resolution === "approve" ? "estate_activated" : "estate_cancelled",
      entityType: "estate_activation",
      entityId: args.estateActivationId,
      description: `Platform admin ${profile.firstName} ${profile.lastName} (${profile._id}) resolved contested estate activation for ${activation.deceasedName}: ${args.resolution}`,
    });

    return null;
  },
});

/**
 * Complete cooldown (internal scheduled mutation).
 *
 * If not contested, sets status to "active", enables estateMode on household,
 * and sets the 90-day subscription grace period.
 */
export const completeCooldown = internalMutation({
  args: { estateActivationId: v.id("estateActivations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const activation = await ctx.db.get(args.estateActivationId);
    if (!activation) {
      return null;
    }

    // Only complete if still pending (not contested or cancelled)
    if (activation.status !== "pending") {
      return null;
    }

    // Verify cooldown has actually elapsed
    if (Date.now() < activation.cooldownEndsAt) {
      return null;
    }

    const now = Date.now();

    // Set activation to active
    await ctx.db.patch(args.estateActivationId, {
      status: "active",
      updatedAt: now,
    });

    // Enable estate mode on household with grace period
    await ctx.db.patch(activation.householdId, {
      estateMode: true,
      estateActivationId: args.estateActivationId,
      estateGraceUntil: now + GRACE_PERIOD_MS,
      updatedAt: now,
    });

    // Notify all household members that estate mode is now active
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", activation.householdId).eq("status", "active"),
      )
      .collect();

    for (const membership of memberships) {
      await ctx.db.insert("notifications", {
        userId: membership.userId,
        householdId: activation.householdId,
        type: "estate_update",
        title: "Estate Administration Active",
        message: `Estate administration for ${activation.deceasedName} is now active. Planning features are now view-only.`,
        link: "/estate",
        isRead: false,
      });
    }

    // Seed checklist items and import assets from household data
    await ctx.scheduler.runAfter(0, internal.estate.seedChecklistItems, {
      activationId: args.estateActivationId,
      householdId: activation.householdId,
    });
    await ctx.scheduler.runAfter(0, internal.estateAssets.seedAssetsFromHouseholdData, {
      activationId: args.estateActivationId,
      householdId: activation.householdId,
      activatedBy: activation.activatedBy,
    });

    // Log activity
    await logActivity(ctx, {
      householdId: activation.householdId,
      userId: activation.activatedBy,
      module: "estate",
      actionType: "estate_cooldown_complete",
      entityType: "estate_activation",
      entityId: args.estateActivationId,
      description: `Estate administration cooldown completed for ${activation.deceasedName}. Estate mode is now active.`,
    });

    return null;
  },
});

/**
 * Upload/link a death certificate to the estate activation.
 */
export const uploadDeathCertificate = mutation({
  args: {
    estateActivationId: v.id("estateActivations"),
    documentId: v.id("vaultDocuments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const activation = await ctx.db.get(args.estateActivationId);
    if (!activation) {
      throw new Error("Estate activation not found");
    }

    if (activation.status === "cancelled" || activation.status === "completed") {
      throw new Error("Cannot modify a completed or cancelled estate activation");
    }

    const { profile } = await requireExecutorAccess(ctx, activation.householdId);

    // Verify the document exists and belongs to the same household
    const document = await ctx.db.get(args.documentId);
    if (!document || document.householdId !== activation.householdId) {
      throw new Error("Document not found in this household");
    }

    await ctx.db.patch(args.estateActivationId, {
      deathCertificateDocId: args.documentId,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: activation.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_document_shared",
      entityType: "estate_document",
      entityId: args.estateActivationId,
      description: "Linked death certificate to estate activation",
    });

    return null;
  },
});

/**
 * Cancel estate administration.
 *
 * Reason is required. Sets estateMode to false but preserves all data (soft cancel).
 * Logs activity immutably.
 */
export const cancelEstate = mutation({
  args: {
    estateActivationId: v.id("estateActivations"),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const activation = await ctx.db.get(args.estateActivationId);
    if (!activation) {
      throw new Error("Estate activation not found");
    }

    if (activation.status === "cancelled" || activation.status === "completed") {
      throw new Error("Estate activation is already cancelled or completed");
    }

    const { profile } = await requireExecutorAccess(ctx, activation.householdId);

    const reason = args.reason.trim();
    if (!reason) {
      throw new Error("A reason is required when cancelling estate administration");
    }
    if (reason.length > MAX_REASON_LENGTH) {
      throw new Error(`Reason is too long (max ${MAX_REASON_LENGTH} characters)`);
    }

    const now = Date.now();

    // Cancel any pending cooldown job
    if (activation.cooldownJobId) {
      await ctx.scheduler.cancel(activation.cooldownJobId);
    }

    // Cancel the activation
    await ctx.db.patch(args.estateActivationId, {
      status: "cancelled",
      cancelledAt: now,
      cancelReason: reason,
      cooldownJobId: undefined,
      updatedAt: now,
    });

    // Disable estate mode on household
    await ctx.db.patch(activation.householdId, {
      estateMode: false,
      estateGraceUntil: undefined,
      updatedAt: now,
    });

    // Log activity
    await logActivity(ctx, {
      householdId: activation.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_cancelled",
      entityType: "estate_activation",
      entityId: args.estateActivationId,
      description: `Cancelled estate administration for ${activation.deceasedName}. Reason: ${reason}`,
    });

    return null;
  },
});

/**
 * Complete estate administration.
 *
 * Marks the activation as completed and disables estate mode.
 * All estate data is preserved and viewable as a read-only archive.
 */
export const completeEstate = mutation({
  args: { estateActivationId: v.id("estateActivations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const activation = await ctx.db.get(args.estateActivationId);
    if (!activation) {
      throw new Error("Estate activation not found");
    }

    if (activation.status !== "active") {
      throw new Error("Only active estate activations can be completed");
    }

    const { profile } = await requireExecutorAccess(ctx, activation.householdId);

    const now = Date.now();

    // Mark activation as completed
    await ctx.db.patch(args.estateActivationId, {
      status: "completed",
      completedAt: now,
      updatedAt: now,
    });

    // Disable estate mode, planning features unlocked
    await ctx.db.patch(activation.householdId, {
      estateMode: false,
      estateGraceUntil: undefined,
      updatedAt: now,
    });

    // Notify all household members
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", activation.householdId).eq("status", "active"),
      )
      .collect();

    for (const membership of memberships) {
      if (membership.userId === profile._id) continue;

      await ctx.db.insert("notifications", {
        userId: membership.userId,
        householdId: activation.householdId,
        type: "estate_update",
        title: "Estate Administration Complete",
        message: `Estate administration for ${activation.deceasedName} has been completed. Planning features have been restored.`,
        link: "/estate",
        isRead: false,
      });
    }

    // Log activity
    await logActivity(ctx, {
      householdId: activation.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_completed",
      entityType: "estate_activation",
      entityId: args.estateActivationId,
      description: `Completed estate administration for ${activation.deceasedName}`,
    });

    return null;
  },
});

/**
 * Override estate mode (owner-only emergency escape).
 *
 * Allows a living household owner to force-cancel estate mode,
 * e.g. if estate was activated mistakenly or fraudulently.
 * This is a destructive action with a required reason and full audit trail.
 */
export const overrideEstateMode = mutation({
  args: {
    householdId: v.id("households"),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    const membership = await requireHouseholdAccess(ctx, args.householdId);

    // Owner-only
    if (membership.role !== "owner") {
      throw new Error("Only the household owner can override estate mode");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    if (household.estateMode !== true) {
      throw new Error("Household is not in estate mode");
    }

    const reason = args.reason.trim();
    if (!reason) {
      throw new Error("A reason is required for overriding estate mode");
    }
    if (reason.length > MAX_REASON_LENGTH) {
      throw new Error(`Reason is too long (max ${MAX_REASON_LENGTH} characters)`);
    }

    const now = Date.now();

    // Cancel the activation if one exists
    if (household.estateActivationId) {
      const activation = await ctx.db.get(household.estateActivationId);
      if (activation && activation.status !== "cancelled" && activation.status !== "completed") {
        // Cancel any pending cooldown job
        if (activation.cooldownJobId) {
          await ctx.scheduler.cancel(activation.cooldownJobId);
        }

        await ctx.db.patch(household.estateActivationId, {
          status: "cancelled",
          cancelledAt: now,
          cancelReason: `Owner override: ${reason}`,
          cooldownJobId: undefined,
          updatedAt: now,
        });
      }
    }

    // Disable estate mode
    await ctx.db.patch(args.householdId, {
      estateMode: false,
      estateGraceUntil: undefined,
      updatedAt: now,
    });

    // Log activity
    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_cancelled",
      entityType: "estate_activation",
      entityId: household.estateActivationId ?? args.householdId,
      description: `Owner override: forcefully cancelled estate mode. Reason: ${reason}`,
    });

    return null;
  },
});

// ============================================================================
// CHECKLIST - Guided task list for executors
// ============================================================================

const checklistCategoryValidator = v.union(
  v.literal("first_things_first"),
  v.literal("legal_and_financial"),
  v.literal("property_and_assets"),
  v.literal("notifications"),
  v.literal("ongoing"),
  v.literal("when_ready"),
  v.literal("custom"),
);

const checklistItemReturnValidator = v.object({
  _id: v.id("estateChecklistItems"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  activationId: v.id("estateActivations"),
  title: v.string(),
  description: v.optional(v.string()),
  category: checklistCategoryValidator,
  sortOrder: v.number(),
  isCompleted: v.boolean(),
  completedAt: v.optional(v.number()),
  completedBy: v.optional(v.id("profiles")),
  notes: v.optional(v.string()),
  isCustom: v.boolean(),
  createdBy: v.optional(v.id("profiles")),
  dueDate: v.optional(v.number()),
  updatedAt: v.number(),
});

/**
 * Get all checklist items for an estate activation.
 * Items are returned grouped by category, sorted by sortOrder.
 */
export const getChecklist = query({
  args: { householdId: v.id("households") },
  returns: v.array(checklistItemReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return [];
    }

    const items = await ctx.db
      .query("estateChecklistItems")
      .withIndex("by_activation", (q) => q.eq("activationId", activationId))
      .collect();

    items.sort((a, b) => {
      if (a.category !== b.category) {
        return getCategoryOrder(a.category) - getCategoryOrder(b.category);
      }
      return a.sortOrder - b.sortOrder;
    });

    return items;
  },
});

/**
 * Get checklist statistics for the dashboard.
 * Includes total, completed, and per-category progress.
 * Also computes whether "when_ready" items should be visible
 * (50%+ of first_things_first must be complete).
 */
export const getChecklistStats = query({
  args: { householdId: v.id("households") },
  returns: v.object({
    total: v.number(),
    completed: v.number(),
    showWhenReady: v.boolean(),
    byCategory: v.array(
      v.object({
        category: checklistCategoryValidator,
        total: v.number(),
        completed: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const statsActivationId = household?.estateActivationId;
    if (!statsActivationId) {
      return { total: 0, completed: 0, showWhenReady: false, byCategory: [] };
    }

    const items = await ctx.db
      .query("estateChecklistItems")
      .withIndex("by_activation", (q) => q.eq("activationId", statsActivationId))
      .collect();

    const total = items.length;
    const completed = items.filter((i) => i.isCompleted).length;

    // Progressive disclosure: show "when_ready" when 50%+ of first_things_first are complete
    const firstThings = items.filter((i) => i.category === "first_things_first");
    const firstThingsCompleted = firstThings.filter((i) => i.isCompleted).length;
    const showWhenReady =
      firstThings.length > 0 && firstThingsCompleted / firstThings.length >= 0.5;

    // Group by category
    const categoryMap = new Map<string, { total: number; completed: number }>();
    for (const item of items) {
      const entry = categoryMap.get(item.category) ?? { total: 0, completed: 0 };
      entry.total++;
      if (item.isCompleted) entry.completed++;
      categoryMap.set(item.category, entry);
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category: category as (typeof items)[number]["category"],
        ...stats,
      }))
      .sort((a, b) => getCategoryOrder(a.category) - getCategoryOrder(b.category));

    return { total, completed, showWhenReady, byCategory };
  },
});

/**
 * Update a checklist item (toggle completion, add notes, set due date).
 */
export const updateChecklistItem = mutation({
  args: {
    itemId: v.id("estateChecklistItems"),
    isCompleted: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Checklist item not found");
    }

    const { profile } = await requireExecutorAccess(ctx, item.householdId);
    await requireActiveEstate(ctx, item.householdId);

    const now = Date.now();
    const updates: Record<string, unknown> = { updatedAt: now };

    if (args.isCompleted !== undefined) {
      updates.isCompleted = args.isCompleted;
      if (args.isCompleted) {
        updates.completedAt = now;
        updates.completedBy = profile._id;
      } else {
        updates.completedAt = undefined;
        updates.completedBy = undefined;
      }
    }

    if (args.notes !== undefined) {
      const trimmedNotes = args.notes.trim();
      if (trimmedNotes.length > 1000) {
        throw new Error("Notes are too long (max 1000 characters)");
      }
      updates.notes = trimmedNotes || undefined;
    }

    if (args.dueDate !== undefined) {
      updates.dueDate = args.dueDate;
    }

    await ctx.db.patch(args.itemId, updates);

    // Log completion/uncomplete actions
    if (args.isCompleted !== undefined) {
      await logActivity(ctx, {
        householdId: item.householdId,
        userId: profile._id,
        module: "estate",
        actionType: "estate_task_completed",
        entityType: "estate_checklist_item",
        entityId: args.itemId,
        description: args.isCompleted
          ? `Completed checklist item: ${item.title}`
          : `Unchecked checklist item: ${item.title}`,
      });
    }

    return null;
  },
});

/**
 * Add a custom checklist item.
 */
export const addCustomChecklistItem = mutation({
  args: {
    householdId: v.id("households"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  returns: v.id("estateChecklistItems"),
  handler: async (ctx, args) => {
    const { profile } = await requireExecutorAccess(ctx, args.householdId);
    const activation = await requireActiveEstate(ctx, args.householdId);

    const title = args.title.trim();
    if (!title) {
      throw new Error("Task title is required");
    }
    if (title.length > 200) {
      throw new Error("Task title is too long (max 200 characters)");
    }

    const description = args.description?.trim();
    if (description && description.length > 1000) {
      throw new Error("Description is too long (max 1000 characters)");
    }

    // Find the highest sortOrder in the custom category
    const existingCustom = await ctx.db
      .query("estateChecklistItems")
      .withIndex("by_activation_and_category", (q) =>
        q.eq("activationId", activation._id).eq("category", "custom"),
      )
      .collect();

    const maxSort = existingCustom.reduce((max, item) => Math.max(max, item.sortOrder), 0);

    const now = Date.now();
    const itemId = await ctx.db.insert("estateChecklistItems", {
      householdId: args.householdId,
      activationId: activation._id,
      title,
      description: description || undefined,
      category: "custom",
      sortOrder: maxSort + 100,
      isCompleted: false,
      isCustom: true,
      createdBy: profile._id,
      dueDate: args.dueDate,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_task_completed",
      entityType: "estate_checklist_item",
      entityId: itemId,
      description: `Added custom checklist item: ${title}`,
    });

    return itemId;
  },
});

/**
 * Seed checklist items from templates (internal, called after cooldown completes).
 * On failure, notifies the executor rather than failing silently.
 */
export const seedChecklistItems = internalMutation({
  args: {
    activationId: v.id("estateActivations"),
    householdId: v.id("households"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if items already exist for this activation
    const existing = await ctx.db
      .query("estateChecklistItems")
      .withIndex("by_activation", (q) => q.eq("activationId", args.activationId))
      .first();

    if (existing) {
      return null;
    }

    try {
      const now = Date.now();

      for (const template of estateChecklistTemplates) {
        await ctx.db.insert("estateChecklistItems", {
          householdId: args.householdId,
          activationId: args.activationId,
          title: template.title,
          description: template.description,
          category: template.category,
          sortOrder: template.sortOrder,
          isCompleted: false,
          isCustom: false,
          updatedAt: now,
        });
      }
    } catch (_error) {
      // Notify the executor that seeding failed so they can add items manually
      const activation = await ctx.db.get(args.activationId);
      if (activation) {
        await ctx.db.insert("notifications", {
          userId: activation.activatedBy,
          householdId: args.householdId,
          type: "estate_update",
          title: "Checklist Setup Issue",
          message:
            "The estate checklist could not be automatically populated. You can add items manually from the checklist page.",
          link: "/estate/checklist",
          isRead: false,
        });
      }
    }

    return null;
  },
});

// ============================================================================
// HELPERS
// ============================================================================

const CATEGORY_ORDER: Record<string, number> = {
  first_things_first: 0,
  legal_and_financial: 1,
  property_and_assets: 2,
  notifications: 3,
  ongoing: 4,
  when_ready: 5,
  custom: 6,
};

function getCategoryOrder(category: string): number {
  return CATEGORY_ORDER[category] ?? 99;
}

// ============================================================================
// EXPORT - Composite query for estate summary export
// ============================================================================

const assetCategoryValidator = v.union(
  v.literal("financial_account"),
  v.literal("real_estate"),
  v.literal("vehicle"),
  v.literal("insurance_policy"),
  v.literal("retirement_account"),
  v.literal("business_interest"),
  v.literal("personal_property"),
  v.literal("digital_asset"),
  v.literal("other"),
);

const assetStatusValidator = v.union(
  v.literal("identified"),
  v.literal("verified"),
  v.literal("institution_contacted"),
  v.literal("in_transfer"),
  v.literal("closed"),
  v.literal("distributed"),
);

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

const distributionMethodValidator = v.union(
  v.literal("direct_transfer"),
  v.literal("wire_transfer"),
  v.literal("check"),
  v.literal("title_transfer"),
  v.literal("in_kind"),
  v.literal("other"),
);

const estateSummaryReturnValidator = v.object({
  activation: v.object({
    _id: v.id("estateActivations"),
    deceasedName: v.string(),
    dateOfDeath: v.optional(v.number()),
    status: estateActivationStatusValidator,
    activatedAt: v.number(),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
  executorName: v.string(),
  checklistItems: v.array(
    v.object({
      title: v.string(),
      category: checklistCategoryValidator,
      isCompleted: v.boolean(),
      completedAt: v.optional(v.number()),
      notes: v.optional(v.string()),
      dueDate: v.optional(v.number()),
    }),
  ),
  assets: v.array(
    v.object({
      name: v.string(),
      category: assetCategoryValidator,
      status: assetStatusValidator,
      estimatedValue: v.optional(v.number()),
      institution: v.optional(v.string()),
      beneficiary: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  ),
  communications: v.array(
    v.object({
      recipientName: v.string(),
      recipientOrganization: v.optional(v.string()),
      method: communicationMethodValidator,
      subject: v.string(),
      summary: v.string(),
      category: communicationCategoryValidator,
      communicationDate: v.number(),
      followUpDate: v.optional(v.number()),
      followUpCompleted: v.optional(v.boolean()),
    }),
  ),
  distributions: v.array(
    v.object({
      beneficiaryName: v.string(),
      beneficiaryRelationship: v.optional(v.string()),
      description: v.optional(v.string()),
      value: v.optional(v.number()),
      distributionDate: v.number(),
      method: distributionMethodValidator,
      notes: v.optional(v.string()),
    }),
  ),
  generatedAt: v.number(),
});

/**
 * Get a comprehensive estate summary for export.
 * Gathers all estate data (activation, checklist, assets, communications, distributions)
 * into a single response for PDF/CSV generation on the client.
 */
export const getEstateSummary = query({
  args: { householdId: v.id("households") },
  returns: v.union(estateSummaryReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    if (!household?.estateActivationId) {
      return null;
    }

    const activation = await ctx.db.get(household.estateActivationId);
    if (!activation) {
      return null;
    }

    // Get executor name
    const executorProfile = await ctx.db.get(activation.activatedBy);
    const executorName = executorProfile
      ? `${executorProfile.firstName} ${executorProfile.lastName}`
      : `${profile.firstName} ${profile.lastName}`;

    // Gather checklist items
    const checklistItems = await ctx.db
      .query("estateChecklistItems")
      .withIndex("by_activation", (q) => q.eq("activationId", activation._id))
      .collect();

    checklistItems.sort((a, b) => {
      if (a.category !== b.category) {
        return getCategoryOrder(a.category) - getCategoryOrder(b.category);
      }
      return a.sortOrder - b.sortOrder;
    });

    // Gather assets
    const assets = await ctx.db
      .query("estateAssets")
      .withIndex("by_activation", (q) => q.eq("activationId", activation._id))
      .collect();

    assets.sort((a, b) => b._creationTime - a._creationTime);

    // Gather communications
    const communications = await ctx.db
      .query("estateCommunications")
      .withIndex("by_activation", (q) => q.eq("activationId", activation._id))
      .collect();

    communications.sort((a, b) => b.communicationDate - a.communicationDate);

    // Gather distributions
    const distributions = await ctx.db
      .query("estateDistributions")
      .withIndex("by_activation", (q) => q.eq("activationId", activation._id))
      .collect();

    distributions.sort((a, b) => b.distributionDate - a.distributionDate);

    return {
      activation: {
        _id: activation._id,
        deceasedName: activation.deceasedName,
        dateOfDeath: activation.dateOfDeath,
        status: activation.status,
        activatedAt: activation.activatedAt,
        completedAt: activation.completedAt,
        notes: activation.notes,
      },
      executorName,
      checklistItems: checklistItems.map((item) => ({
        title: item.title,
        category: item.category,
        isCompleted: item.isCompleted,
        completedAt: item.completedAt,
        notes: item.notes,
        dueDate: item.dueDate,
      })),
      assets: assets.map((asset) => ({
        name: asset.name,
        category: asset.category,
        status: asset.status,
        estimatedValue: asset.estimatedValue,
        institution: asset.institution,
        beneficiary: asset.beneficiary,
        notes: asset.notes,
      })),
      communications: communications.map((comm) => ({
        recipientName: comm.recipientName,
        recipientOrganization: comm.recipientOrganization,
        method: comm.method,
        subject: comm.subject,
        summary: comm.summary,
        category: comm.category,
        communicationDate: comm.communicationDate,
        followUpDate: comm.followUpDate,
        followUpCompleted: comm.followUpCompleted,
      })),
      distributions: distributions.map((dist) => ({
        beneficiaryName: dist.beneficiaryName,
        beneficiaryRelationship: dist.beneficiaryRelationship,
        description: dist.description,
        value: dist.value,
        distributionDate: dist.distributionDate,
        method: dist.method,
        notes: dist.notes,
      })),
      generatedAt: Date.now(),
    };
  },
});
