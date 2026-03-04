import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireHouseholdAccess } from "./auth";
import { requireActiveEstate, requireExecutorAccess } from "./estateHelpers";
import { logActivity } from "./shared/activity";

/**
 * Estate Assets - Inventory and status tracking for estate administration
 *
 * Provides CRUD operations for estate assets and a status pipeline:
 * identified → verified → institution_contacted → in_transfer → closed → distributed
 */

// ============================================================================
// VALIDATORS
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

const assetReturnValidator = v.object({
  _id: v.id("estateAssets"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  activationId: v.id("estateActivations"),
  name: v.string(),
  description: v.optional(v.string()),
  category: assetCategoryValidator,
  status: assetStatusValidator,
  estimatedValue: v.optional(v.number()),
  institution: v.optional(v.string()),
  accountNumber: v.optional(v.string()),
  beneficiary: v.optional(v.string()),
  notes: v.optional(v.string()),
  sourceType: v.optional(v.string()),
  sourceId: v.optional(v.string()),
  createdBy: v.id("profiles"),
  updatedAt: v.number(),
});

const statusChangeReturnValidator = v.object({
  _id: v.id("estateAssetStatusChanges"),
  _creationTime: v.number(),
  assetId: v.id("estateAssets"),
  householdId: v.id("households"),
  previousStatus: assetStatusValidator,
  newStatus: assetStatusValidator,
  changedBy: v.id("profiles"),
  notes: v.optional(v.string()),
  changedAt: v.number(),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all assets for an estate activation.
 *
 * When both status and category filters are provided, one filter uses an index
 * and the other is applied in-memory. This is an acceptable trade-off because:
 * (1) estates typically have a small asset working set (<100 items),
 * (2) combined filtering is a rare UI interaction,
 * (3) adding a three-field compound index for every filter combination would
 *     increase schema complexity without significant benefit.
 * This matches the pattern used in financial.ts for account/property/policy listing.
 */
export const listAssets = query({
  args: {
    householdId: v.id("households"),
    category: v.optional(assetCategoryValidator),
    status: v.optional(assetStatusValidator),
  },
  returns: v.array(assetReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return [];
    }

    const statusFilter = args.status;
    const categoryFilter = args.category;

    // Use the most selective index available; apply remaining filter in-memory
    let assets = statusFilter
      ? await ctx.db
          .query("estateAssets")
          .withIndex("by_activation_and_status", (q) =>
            q.eq("activationId", activationId).eq("status", statusFilter),
          )
          .collect()
      : categoryFilter
        ? await ctx.db
            .query("estateAssets")
            .withIndex("by_activation_and_category", (q) =>
              q.eq("activationId", activationId).eq("category", categoryFilter),
            )
            .collect()
        : await ctx.db
            .query("estateAssets")
            .withIndex("by_activation", (q) => q.eq("activationId", activationId))
            .collect();

    // Apply secondary filter in-memory when both filters are provided
    if (statusFilter && categoryFilter) {
      assets = assets.filter((a) => a.category === categoryFilter);
    }

    assets.sort((a, b) => b._creationTime - a._creationTime);

    return assets;
  },
});

/**
 * Get a single asset by ID.
 */
export const getAsset = query({
  args: { assetId: v.id("estateAssets") },
  returns: v.union(assetReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) return null;

    await requireHouseholdAccess(ctx, asset.householdId);
    return asset;
  },
});

/**
 * Get the status change history for an asset.
 */
export const getAssetStatusHistory = query({
  args: { assetId: v.id("estateAssets") },
  returns: v.array(statusChangeReturnValidator),
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) return [];

    await requireHouseholdAccess(ctx, asset.householdId);

    const changes = await ctx.db
      .query("estateAssetStatusChanges")
      .withIndex("by_asset", (q) => q.eq("assetId", args.assetId))
      .collect();

    changes.sort((a, b) => b.changedAt - a.changedAt);

    return changes;
  },
});

/**
 * Get asset statistics for the dashboard.
 * Returns counts by status and category, plus total estimated value.
 */
export const getAssetStats = query({
  args: { householdId: v.id("households") },
  returns: v.object({
    total: v.number(),
    totalEstimatedValue: v.number(),
    byStatus: v.array(
      v.object({
        status: assetStatusValidator,
        count: v.number(),
      }),
    ),
    byCategory: v.array(
      v.object({
        category: assetCategoryValidator,
        count: v.number(),
        estimatedValue: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const household = await ctx.db.get(args.householdId);
    const activationId = household?.estateActivationId;
    if (!activationId) {
      return { total: 0, totalEstimatedValue: 0, byStatus: [], byCategory: [] };
    }

    const assets = await ctx.db
      .query("estateAssets")
      .withIndex("by_activation", (q) => q.eq("activationId", activationId))
      .collect();

    const total = assets.length;
    const totalEstimatedValue = assets.reduce((sum, a) => sum + (a.estimatedValue ?? 0), 0);

    // Group by status
    const statusMap = new Map<string, number>();
    for (const asset of assets) {
      statusMap.set(asset.status, (statusMap.get(asset.status) ?? 0) + 1);
    }
    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status as (typeof assets)[number]["status"],
      count,
    }));

    // Group by category
    const categoryMap = new Map<string, { count: number; estimatedValue: number }>();
    for (const asset of assets) {
      const entry = categoryMap.get(asset.category) ?? { count: 0, estimatedValue: 0 };
      entry.count++;
      entry.estimatedValue += asset.estimatedValue ?? 0;
      categoryMap.set(asset.category, entry);
    }
    const byCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category: category as (typeof assets)[number]["category"],
      ...stats,
    }));

    return { total, totalEstimatedValue, byStatus, byCategory };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new estate asset.
 */
export const createAsset = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
    description: v.optional(v.string()),
    category: assetCategoryValidator,
    estimatedValue: v.optional(v.number()),
    institution: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    beneficiary: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("estateAssets"),
  handler: async (ctx, args) => {
    const { profile } = await requireExecutorAccess(ctx, args.householdId);
    const activation = await requireActiveEstate(ctx, args.householdId);

    const name = args.name.trim();
    if (!name) {
      throw new Error("Asset name is required");
    }
    if (name.length > 255) {
      throw new Error("Asset name is too long (max 255 characters)");
    }

    const now = Date.now();
    const assetId = await ctx.db.insert("estateAssets", {
      householdId: args.householdId,
      activationId: activation._id,
      name,
      description: args.description?.trim() || undefined,
      category: args.category,
      status: "identified",
      estimatedValue: args.estimatedValue,
      institution: args.institution?.trim() || undefined,
      accountNumber: args.accountNumber?.trim() || undefined,
      beneficiary: args.beneficiary?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      createdBy: profile._id,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_asset_status_updated",
      entityType: "estate_asset",
      entityId: assetId,
      description: `Added estate asset: ${name}`,
    });

    return assetId;
  },
});

/**
 * Update an estate asset's details (not status — use updateAssetStatus for that).
 */
export const updateAsset = mutation({
  args: {
    assetId: v.id("estateAssets"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(assetCategoryValidator),
    estimatedValue: v.optional(v.number()),
    institution: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    beneficiary: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    const { profile } = await requireExecutorAccess(ctx, asset.householdId);
    await requireActiveEstate(ctx, asset.householdId);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) {
        throw new Error("Asset name cannot be empty");
      }
      if (name.length > 255) {
        throw new Error("Asset name is too long (max 255 characters)");
      }
      updates.name = name;
    }

    if (args.description !== undefined) {
      updates.description = args.description.trim() || undefined;
    }
    if (args.category !== undefined) {
      updates.category = args.category;
    }
    if (args.estimatedValue !== undefined) {
      updates.estimatedValue = args.estimatedValue;
    }
    if (args.institution !== undefined) {
      updates.institution = args.institution.trim() || undefined;
    }
    if (args.accountNumber !== undefined) {
      updates.accountNumber = args.accountNumber.trim() || undefined;
    }
    if (args.beneficiary !== undefined) {
      updates.beneficiary = args.beneficiary.trim() || undefined;
    }
    if (args.notes !== undefined) {
      updates.notes = args.notes.trim() || undefined;
    }

    await ctx.db.patch(args.assetId, updates);

    await logActivity(ctx, {
      householdId: asset.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_asset_status_updated",
      entityType: "estate_asset",
      entityId: args.assetId,
      description: `Updated estate asset: ${args.name?.trim() || asset.name}`,
    });

    return null;
  },
});

/**
 * Update an asset's status in the pipeline.
 * Atomically updates the asset status and inserts a status change record.
 */
export const updateAssetStatus = mutation({
  args: {
    assetId: v.id("estateAssets"),
    newStatus: assetStatusValidator,
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    const { profile } = await requireExecutorAccess(ctx, asset.householdId);
    await requireActiveEstate(ctx, asset.householdId);

    if (asset.status === args.newStatus) {
      throw new Error("Asset is already in this status");
    }

    const now = Date.now();

    // Insert status change record
    await ctx.db.insert("estateAssetStatusChanges", {
      assetId: args.assetId,
      householdId: asset.householdId,
      previousStatus: asset.status,
      newStatus: args.newStatus,
      changedBy: profile._id,
      notes: args.notes?.trim() || undefined,
      changedAt: now,
    });

    // Update asset status
    await ctx.db.patch(args.assetId, {
      status: args.newStatus,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: asset.householdId,
      userId: profile._id,
      module: "estate",
      actionType: "estate_asset_status_updated",
      entityType: "estate_asset_status_change",
      entityId: args.assetId,
      description: `Changed ${asset.name} status: ${asset.status} → ${args.newStatus}`,
    });

    return null;
  },
});

/**
 * Seed assets from existing household financial data (internal, batched).
 * Called when estate mode activates to pre-populate the asset inventory.
 *
 * Limits to 25 assets per source type (~75 total inserts max) to stay well
 * within Convex mutation write limits, leaving headroom for activity logging.
 */
const SEED_BATCH_SIZE = 25;

export const seedAssetsFromHouseholdData = internalMutation({
  args: {
    activationId: v.id("estateActivations"),
    householdId: v.id("households"),
    activatedBy: v.id("profiles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if assets already exist for this activation
    const existing = await ctx.db
      .query("estateAssets")
      .withIndex("by_activation", (q) => q.eq("activationId", args.activationId))
      .first();

    if (existing) {
      return null;
    }

    try {
      const now = Date.now();

      // Import financial accounts (capped at SEED_BATCH_SIZE)
      const accounts = await ctx.db
        .query("financialAccounts")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .take(SEED_BATCH_SIZE);

      for (const account of accounts) {
        await ctx.db.insert("estateAssets", {
          householdId: args.householdId,
          activationId: args.activationId,
          name: account.name,
          description: `${account.type} account`,
          category: account.type === "retirement" ? "retirement_account" : "financial_account",
          status: "identified",
          estimatedValue: account.balance ?? undefined,
          institution: account.institution,
          accountNumber: account.accountNumberLast4
            ? `****${account.accountNumberLast4}`
            : undefined,
          sourceType: "financialAccounts",
          sourceId: account._id,
          createdBy: args.activatedBy,
          updatedAt: now,
        });
      }

      // Import properties (capped at SEED_BATCH_SIZE)
      const properties = await ctx.db
        .query("properties")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .take(SEED_BATCH_SIZE);

      for (const property of properties) {
        await ctx.db.insert("estateAssets", {
          householdId: args.householdId,
          activationId: args.activationId,
          name: property.name,
          description: property.address ?? undefined,
          category: "real_estate",
          status: "identified",
          estimatedValue: property.estimatedValue ?? undefined,
          sourceType: "properties",
          sourceId: property._id,
          createdBy: args.activatedBy,
          updatedAt: now,
        });
      }

      // Import insurance policies (capped at SEED_BATCH_SIZE)
      const policies = await ctx.db
        .query("insurancePolicies")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .take(SEED_BATCH_SIZE);

      for (const policy of policies) {
        await ctx.db.insert("estateAssets", {
          householdId: args.householdId,
          activationId: args.activationId,
          name: `${policy.provider} ${policy.type} insurance`,
          description: `${policy.type} insurance policy`,
          category: "insurance_policy",
          status: "identified",
          estimatedValue: policy.coverageAmount ?? undefined,
          institution: policy.provider,
          accountNumber: policy.policyNumberLast4 ? `****${policy.policyNumberLast4}` : undefined,
          sourceType: "insurancePolicies",
          sourceId: policy._id,
          createdBy: args.activatedBy,
          updatedAt: now,
        });
      }
    } catch (_error) {
      // Notify the executor that asset import failed so they can add assets manually
      await ctx.db.insert("notifications", {
        userId: args.activatedBy,
        householdId: args.householdId,
        type: "estate_update",
        title: "Asset Import Issue",
        message:
          "Some existing financial data could not be automatically imported as estate assets. You can add assets manually from the assets page.",
        link: "/estate",
        isRead: false,
      });
    }

    return null;
  },
});
