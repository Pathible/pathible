import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireHouseholdAccess } from "./auth";
import { requireActiveEstate, requireExecutorAccess } from "./estateHelpers";
import { logActivity } from "./shared/activity";

/**
 * Estate Distributions - Track asset distribution to beneficiaries
 *
 * Records what was distributed, to whom, when, and via what method.
 * Atomically updates asset status to "distributed" when recording a distribution.
 */

// ============================================================================
// VALIDATORS
// ============================================================================

const distributionMethodValidator = v.union(
  v.literal("direct_transfer"),
  v.literal("wire_transfer"),
  v.literal("check"),
  v.literal("title_transfer"),
  v.literal("in_kind"),
  v.literal("other"),
);

const distributionReturnValidator = v.object({
  _id: v.id("estateDistributions"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  activationId: v.id("estateActivations"),
  assetId: v.id("estateAssets"),
  beneficiaryName: v.string(),
  beneficiaryRelationship: v.optional(v.string()),
  description: v.optional(v.string()),
  value: v.optional(v.number()),
  distributionDate: v.number(),
  method: distributionMethodValidator,
  receiptDocId: v.optional(v.id("vaultDocuments")),
  notes: v.optional(v.string()),
  distributedBy: v.id("profiles"),
  updatedAt: v.number(),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all distributions for an estate activation.
 * Sorted by distribution date, most recent first.
 */
export const listDistributions = query({
  args: {
    householdId: v.id("households"),
    assetId: v.optional(v.id("estateAssets")),
  },
  returns: v.array(distributionReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return [];
    }

    const assetFilter = args.assetId;

    // Verify asset belongs to this household before querying by asset index
    // (prevents cross-household data access via attacker-supplied assetId)
    if (assetFilter) {
      const asset = await ctx.db.get(assetFilter);
      if (!asset || asset.householdId !== args.householdId) {
        return [];
      }
    }

    const distributions = assetFilter
      ? await ctx.db
          .query("estateDistributions")
          .withIndex("by_asset", (q) => q.eq("assetId", assetFilter))
          .collect()
      : await ctx.db
          .query("estateDistributions")
          .withIndex("by_activation", (q) => q.eq("activationId", activationId))
          .collect();

    distributions.sort((a, b) => b.distributionDate - a.distributionDate);

    return distributions;
  },
});

/**
 * Get a single distribution by ID.
 */
export const getDistribution = query({
  args: { distributionId: v.id("estateDistributions") },
  returns: v.union(distributionReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const distribution = await ctx.db.get(args.distributionId);
    if (!distribution) return null;

    await requireHouseholdAccess(ctx, distribution.householdId);
    return distribution;
  },
});

/**
 * Get distribution statistics for the dashboard.
 * Includes total distributions, total value, and grouped by beneficiary.
 */
export const getDistributionStats = query({
  args: { householdId: v.id("households") },
  returns: v.object({
    total: v.number(),
    totalValue: v.number(),
    byBeneficiary: v.array(
      v.object({
        beneficiaryName: v.string(),
        count: v.number(),
        totalValue: v.number(),
      }),
    ),
    byMethod: v.array(
      v.object({
        method: distributionMethodValidator,
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return { total: 0, totalValue: 0, byBeneficiary: [], byMethod: [] };
    }

    const distributions = await ctx.db
      .query("estateDistributions")
      .withIndex("by_activation", (q) => q.eq("activationId", activationId))
      .collect();

    const total = distributions.length;
    const totalValue = distributions.reduce((sum, d) => sum + (d.value ?? 0), 0);

    // Group by beneficiary
    const beneficiaryMap = new Map<string, { count: number; totalValue: number }>();
    for (const dist of distributions) {
      const entry = beneficiaryMap.get(dist.beneficiaryName) ?? { count: 0, totalValue: 0 };
      entry.count++;
      entry.totalValue += dist.value ?? 0;
      beneficiaryMap.set(dist.beneficiaryName, entry);
    }
    const byBeneficiary = Array.from(beneficiaryMap.entries())
      .map(([beneficiaryName, stats]) => ({ beneficiaryName, ...stats }))
      .sort((a, b) => b.totalValue - a.totalValue);

    // Group by method
    const methodMap = new Map<string, number>();
    for (const dist of distributions) {
      methodMap.set(dist.method, (methodMap.get(dist.method) ?? 0) + 1);
    }
    const byMethod = Array.from(methodMap.entries()).map(([method, count]) => ({
      method: method as (typeof distributions)[number]["method"],
      count,
    }));

    return { total, totalValue, byBeneficiary, byMethod };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Record a new distribution.
 * Atomically creates the distribution record and updates the asset status to "distributed".
 */
export const recordDistribution = mutation({
  args: {
    householdId: v.id("households"),
    assetId: v.id("estateAssets"),
    beneficiaryName: v.string(),
    beneficiaryRelationship: v.optional(v.string()),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    distributionDate: v.number(),
    method: distributionMethodValidator,
    receiptDocId: v.optional(v.id("vaultDocuments")),
    notes: v.optional(v.string()),
  },
  returns: v.id("estateDistributions"),
  handler: async (ctx, args) => {
    const { profile } = await requireExecutorAccess(ctx, args.householdId);
    const activation = await requireActiveEstate(ctx, args.householdId);

    const beneficiaryName = args.beneficiaryName.trim();
    if (!beneficiaryName) {
      throw new Error("Beneficiary name is required");
    }
    if (beneficiaryName.length > 255) {
      throw new Error("Beneficiary name is too long (max 255 characters)");
    }

    // Verify asset belongs to this activation
    const asset = await ctx.db.get(args.assetId);
    if (!asset || asset.activationId !== activation._id) {
      throw new Error("Asset not found in this estate activation");
    }

    const now = Date.now();

    // Create distribution record
    const distributionId = await ctx.db.insert("estateDistributions", {
      householdId: args.householdId,
      activationId: activation._id,
      assetId: args.assetId,
      beneficiaryName,
      beneficiaryRelationship: args.beneficiaryRelationship?.trim() || undefined,
      description: args.description?.trim() || undefined,
      value: args.value,
      distributionDate: args.distributionDate,
      method: args.method,
      receiptDocId: args.receiptDocId,
      notes: args.notes?.trim() || undefined,
      distributedBy: profile._id,
      updatedAt: now,
    });

    // Atomically update asset status to "distributed" and log status change
    if (asset.status !== "distributed") {
      await ctx.db.insert("estateAssetStatusChanges", {
        assetId: args.assetId,
        householdId: args.householdId,
        previousStatus: asset.status,
        newStatus: "distributed",
        changedBy: profile._id,
        notes: `Distributed to ${beneficiaryName}`,
        changedAt: now,
      });

      await ctx.db.patch(args.assetId, {
        status: "distributed",
        updatedAt: now,
      });
    }

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_distribution_recorded",
      entityType: "estate_distribution",
      entityId: distributionId,
      description: `Distributed ${asset.name} to ${beneficiaryName}`,
    });

    return distributionId;
  },
});

/**
 * Update an existing distribution record.
 */
export const updateDistribution = mutation({
  args: {
    distributionId: v.id("estateDistributions"),
    beneficiaryName: v.optional(v.string()),
    beneficiaryRelationship: v.optional(v.string()),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    distributionDate: v.optional(v.number()),
    method: v.optional(distributionMethodValidator),
    receiptDocId: v.optional(v.id("vaultDocuments")),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const distribution = await ctx.db.get(args.distributionId);
    if (!distribution) {
      throw new Error("Distribution not found");
    }

    const { profile } = await requireExecutorAccess(ctx, distribution.householdId);
    await requireActiveEstate(ctx, distribution.householdId);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.beneficiaryName !== undefined) {
      const name = args.beneficiaryName.trim();
      if (!name) throw new Error("Beneficiary name cannot be empty");
      if (name.length > 255) throw new Error("Beneficiary name is too long (max 255 characters)");
      updates.beneficiaryName = name;
    }
    if (args.beneficiaryRelationship !== undefined) {
      updates.beneficiaryRelationship = args.beneficiaryRelationship.trim() || undefined;
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim() || undefined;
    }
    if (args.value !== undefined) {
      updates.value = args.value;
    }
    if (args.distributionDate !== undefined) {
      updates.distributionDate = args.distributionDate;
    }
    if (args.method !== undefined) {
      updates.method = args.method;
    }
    if (args.receiptDocId !== undefined) {
      updates.receiptDocId = args.receiptDocId;
    }
    if (args.notes !== undefined) {
      updates.notes = args.notes.trim() || undefined;
    }

    await ctx.db.patch(args.distributionId, updates);

    await logActivity(ctx, {
      householdId: distribution.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_distribution_recorded",
      entityType: "estate_distribution",
      entityId: args.distributionId,
      description: `Updated distribution record for ${args.beneficiaryName?.trim() || distribution.beneficiaryName}`,
    });

    return null;
  },
});

/**
 * Delete a distribution record.
 * Does NOT revert the asset status - that must be done separately via updateAssetStatus.
 */
export const deleteDistribution = mutation({
  args: {
    distributionId: v.id("estateDistributions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const distribution = await ctx.db.get(args.distributionId);
    if (!distribution) {
      throw new Error("Distribution not found");
    }

    const { profile } = await requireExecutorAccess(ctx, distribution.householdId);
    await requireActiveEstate(ctx, distribution.householdId);

    const beneficiaryName = distribution.beneficiaryName;

    await ctx.db.delete(args.distributionId);

    await logActivity(ctx, {
      householdId: distribution.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_distribution_recorded",
      entityType: "estate_distribution",
      entityId: args.distributionId,
      description: `Deleted distribution record for ${beneficiaryName}`,
    });

    return null;
  },
});
