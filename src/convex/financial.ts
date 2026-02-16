import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireActiveSubscription, requireAuth, requireHouseholdAccess } from "./auth";
import { logActivity } from "./shared/activity";
import { STRING_LIMITS, validateOptionalString, validateRequiredString } from "./shared/validators";

/**
 * Financial Intelligence - Financial Account & Asset Management
 *
 * This module provides comprehensive financial tracking for households including:
 * - Financial accounts (checking, savings, investment, retirement, crypto)
 * - Properties and real estate
 * - Insurance policies
 * - Net worth calculation
 * - Activity logging
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

const accountTypeValidator = v.union(
  v.literal("checking"),
  v.literal("savings"),
  v.literal("investment"),
  v.literal("retirement"),
  v.literal("crypto"),
  v.literal("other"),
);

const propertyTypeValidator = v.union(
  v.literal("primary_residence"),
  v.literal("secondary_residence"),
  v.literal("rental"),
  v.literal("land"),
  v.literal("commercial"),
  v.literal("other"),
);

const insuranceTypeValidator = v.union(
  v.literal("life"),
  v.literal("health"),
  v.literal("home"),
  v.literal("auto"),
  v.literal("disability"),
  v.literal("long_term_care"),
  v.literal("umbrella"),
  v.literal("other"),
);

const premiumFrequencyValidator = v.union(
  v.literal("monthly"),
  v.literal("quarterly"),
  v.literal("semi_annual"),
  v.literal("annual"),
);

const suggestionCategoryValidator = v.union(
  v.literal("document"),
  v.literal("planning"),
  v.literal("financial"),
  v.literal("legal"),
  v.literal("legacy"),
  v.literal("other"),
);

const suggestionPriorityValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

const suggestionStatusValidator = v.union(
  v.literal("pending"),
  v.literal("dismissed"),
  v.literal("completed"),
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates that a number is not NaN or Infinity
 * parseFloat can return NaN for invalid input, which passes v.number() validation
 */
function validateNumber(value: number | undefined, fieldName: string): number | undefined {
  if (value === undefined) return undefined;
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return value;
}

// Return type validators
const accountReturnValidator = v.object({
  _id: v.id("financialAccounts"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  name: v.string(),
  type: accountTypeValidator,
  institution: v.string(),
  accountNumberLast4: v.optional(v.string()),
  balance: v.optional(v.number()),
  currency: v.string(),
  lastUpdated: v.optional(v.number()),
  updatedAt: v.number(),
});

const propertyReturnValidator = v.object({
  _id: v.id("properties"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  name: v.string(),
  type: propertyTypeValidator,
  address: v.optional(v.string()),
  estimatedValue: v.optional(v.number()),
  purchaseDate: v.optional(v.number()),
  notes: v.optional(v.string()),
  updatedAt: v.number(),
});

const insurancePolicyReturnValidator = v.object({
  _id: v.id("insurancePolicies"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  type: insuranceTypeValidator,
  provider: v.string(),
  policyNumberLast4: v.optional(v.string()),
  coverageAmount: v.optional(v.number()),
  premiumAmount: v.optional(v.number()),
  premiumFrequency: v.optional(premiumFrequencyValidator),
  beneficiaries: v.optional(v.string()),
  expirationDate: v.optional(v.number()),
  updatedAt: v.number(),
});

const suggestionReturnValidator = v.object({
  _id: v.id("userSuggestions"),
  _creationTime: v.number(),
  userId: v.id("profiles"),
  householdId: v.id("households"),
  suggestionId: v.id("smartSuggestions"),
  status: suggestionStatusValidator,
  dismissedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  // Enriched with suggestion details
  title: v.string(),
  description: v.string(),
  category: suggestionCategoryValidator,
  priority: suggestionPriorityValidator,
  icon: v.optional(v.string()),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get financial overview statistics for a household
 * Calculates totals by category, account counts, and recent activity
 */
export const getStats = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    totalAccounts: v.number(),
    totalProperties: v.number(),
    totalPolicies: v.number(),
    accountsByType: v.record(v.string(), v.number()),
    propertiesByType: v.record(v.string(), v.number()),
    policiesByType: v.record(v.string(), v.number()),
    totalAccountBalance: v.number(),
    totalPropertyValue: v.number(),
    totalCoverageAmount: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    // Get all financial accounts
    const accounts = await ctx.db
      .query("financialAccounts")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Get all properties
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Get all insurance policies
    const policies = await ctx.db
      .query("insurancePolicies")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Calculate totals by type
    const accountsByType: Record<string, number> = {};
    let totalAccountBalance = 0;

    for (const account of accounts) {
      accountsByType[account.type] = (accountsByType[account.type] || 0) + 1;
      if (account.balance) {
        totalAccountBalance += account.balance;
      }
    }

    const propertiesByType: Record<string, number> = {};
    let totalPropertyValue = 0;

    for (const property of properties) {
      propertiesByType[property.type] = (propertiesByType[property.type] || 0) + 1;
      if (property.estimatedValue) {
        totalPropertyValue += property.estimatedValue;
      }
    }

    const policiesByType: Record<string, number> = {};
    let totalCoverageAmount = 0;

    for (const policy of policies) {
      policiesByType[policy.type] = (policiesByType[policy.type] || 0) + 1;
      if (policy.coverageAmount) {
        totalCoverageAmount += policy.coverageAmount;
      }
    }

    return {
      totalAccounts: accounts.length,
      totalProperties: properties.length,
      totalPolicies: policies.length,
      accountsByType,
      propertiesByType,
      policiesByType,
      totalAccountBalance,
      totalPropertyValue,
      totalCoverageAmount,
    };
  },
});

/**
 * List all financial accounts for a household
 * Returns accounts ordered by creation time (newest first)
 *
 * Note: Type filtering is done in-memory after the query. This is an acceptable
 * trade-off because: (1) households typically have few accounts (<50), (2) the
 * type filter is optional and rarely used, (3) adding compound indexes for every
 * optional filter would increase schema complexity without significant benefit.
 */
export const listAccounts = query({
  args: {
    householdId: v.id("households"),
    type: v.optional(accountTypeValidator),
  },
  returns: v.array(accountReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const accounts = await ctx.db
      .query("financialAccounts")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .order("desc")
      .collect();

    // Filter by type if provided (in-memory filtering - see function docs)
    if (args.type) {
      return accounts.filter((account) => account.type === args.type);
    }

    return accounts;
  },
});

/**
 * List all properties for a household
 * Returns properties ordered by creation time (newest first)
 *
 * Note: Type filtering is done in-memory after the query. This is an acceptable
 * trade-off because: (1) households typically have few properties (<20), (2) the
 * type filter is optional and rarely used, (3) adding compound indexes for every
 * optional filter would increase schema complexity without significant benefit.
 */
export const listProperties = query({
  args: {
    householdId: v.id("households"),
    type: v.optional(propertyTypeValidator),
  },
  returns: v.array(propertyReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .order("desc")
      .collect();

    // Filter by type if provided (in-memory filtering - see function docs)
    if (args.type) {
      return properties.filter((property) => property.type === args.type);
    }

    return properties;
  },
});

/**
 * List all insurance policies for a household
 * Returns policies ordered by creation time (newest first)
 *
 * Note: Type filtering is done in-memory after the query. This is an acceptable
 * trade-off because: (1) households typically have few policies (<20), (2) the
 * type filter is optional and rarely used, (3) adding compound indexes for every
 * optional filter would increase schema complexity without significant benefit.
 */
export const listInsurancePolicies = query({
  args: {
    householdId: v.id("households"),
    type: v.optional(insuranceTypeValidator),
  },
  returns: v.array(insurancePolicyReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const policies = await ctx.db
      .query("insurancePolicies")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .order("desc")
      .collect();

    // Filter by type if provided (in-memory filtering - see function docs)
    if (args.type) {
      return policies.filter((policy) => policy.type === args.type);
    }

    return policies;
  },
});

/**
 * Calculate net worth for a household
 * Net worth = (sum of account balances + sum of property values)
 * Note: This is a simplified calculation. Liabilities could be added in the future.
 */
export const getNetWorth = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    netWorth: v.number(),
    totalAssets: v.number(),
    totalLiabilities: v.number(),
    breakdown: v.object({
      accounts: v.number(),
      properties: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    // Get all financial accounts
    const accounts = await ctx.db
      .query("financialAccounts")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Get all properties
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Calculate total account balance
    const accountsTotal = accounts.reduce((sum, account) => {
      return sum + (account.balance || 0);
    }, 0);

    // Calculate total property value
    const propertiesTotal = properties.reduce((sum, property) => {
      return sum + (property.estimatedValue || 0);
    }, 0);

    const totalAssets = accountsTotal + propertiesTotal;
    const totalLiabilities = 0; // Future: Add liabilities tracking

    return {
      netWorth: totalAssets - totalLiabilities,
      totalAssets,
      totalLiabilities,
      breakdown: {
        accounts: accountsTotal,
        properties: propertiesTotal,
      },
    };
  },
});

/**
 * Get active smart suggestions for the current user
 * Returns pending suggestions with enriched details from smartSuggestions
 */
export const getSuggestions = query({
  args: {
    householdId: v.id("households"),
    category: v.optional(suggestionCategoryValidator),
  },
  returns: v.array(suggestionReturnValidator),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // Use by_user_and_status index for efficient user-specific queries
    // This is more efficient than by_household_and_status since we're
    // querying for a specific user's pending suggestions
    const userSuggestions = await ctx.db
      .query("userSuggestions")
      .withIndex("by_user_and_status", (q) => q.eq("userId", profile._id).eq("status", "pending"))
      .collect();

    // Filter by household for security (user may belong to multiple households)
    const filteredSuggestions = userSuggestions.filter(
      (suggestion) => suggestion.householdId === args.householdId,
    );

    // Enrich with suggestion details
    const enrichedSuggestions = await Promise.all(
      filteredSuggestions.map(async (userSuggestion) => {
        const suggestion = await ctx.db.get(userSuggestion.suggestionId);

        if (!suggestion || !suggestion.isActive) {
          return null;
        }

        // Apply category filter if provided
        if (args.category && suggestion.category !== args.category) {
          return null;
        }

        return {
          ...userSuggestion,
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          priority: suggestion.priority,
          icon: suggestion.icon,
        };
      }),
    );

    // Filter out null values and return
    return enrichedSuggestions.filter(
      (suggestion): suggestion is NonNullable<typeof suggestion> => suggestion !== null,
    );
  },
});

// ============================================================================
// MUTATIONS - FINANCIAL ACCOUNTS
// ============================================================================

/**
 * Create a new financial account
 *
 * SECURITY: Requires active subscription
 */
export const createAccount = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
    type: accountTypeValidator,
    institution: v.string(),
    accountNumberLast4: v.optional(v.string()),
    balance: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  returns: v.id("financialAccounts"),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, args.householdId);

    // Validate inputs
    const name = validateRequiredString(args.name, "Account name", STRING_LIMITS.name);
    const institution = validateRequiredString(
      args.institution,
      "Institution name",
      STRING_LIMITS.name,
    );

    if (args.accountNumberLast4 && args.accountNumberLast4.length !== 4) {
      throw new Error("Account number must be exactly 4 digits");
    }

    // Validate numeric inputs
    const balance = validateNumber(args.balance, "Balance");

    // Create account
    const accountId = await ctx.db.insert("financialAccounts", {
      householdId: args.householdId,
      name,
      type: args.type,
      institution,
      accountNumberLast4: args.accountNumberLast4,
      balance,
      currency: args.currency || "USD",
      lastUpdated: balance !== undefined ? Date.now() : undefined,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "asset_created",
      entityType: "financial_account",
      entityId: accountId,
      description: `Added financial account: ${args.name}`,
    });

    return accountId;
  },
});

/**
 * Update an existing financial account
 *
 * SECURITY: Requires active subscription
 */
export const updateAccount = mutation({
  args: {
    accountId: v.id("financialAccounts"),
    name: v.optional(v.string()),
    type: v.optional(accountTypeValidator),
    institution: v.optional(v.string()),
    accountNumberLast4: v.optional(v.string()),
    balance: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  returns: v.id("financialAccounts"),
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    await requireHouseholdAccess(ctx, account.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, account.householdId);

    // Build update object
    const updates: Partial<Doc<"financialAccounts">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      const validated = validateOptionalString(args.name, "Account name", STRING_LIMITS.name);
      if (validated === undefined) {
        throw new Error("Account name cannot be empty");
      }
      updates.name = validated;
    }

    if (args.type !== undefined) {
      updates.type = args.type;
    }

    if (args.institution !== undefined) {
      const validated = validateOptionalString(
        args.institution,
        "Institution name",
        STRING_LIMITS.name,
      );
      if (validated === undefined) {
        throw new Error("Institution name cannot be empty");
      }
      updates.institution = validated;
    }

    if (args.accountNumberLast4 !== undefined) {
      if (args.accountNumberLast4 && args.accountNumberLast4.length !== 4) {
        throw new Error("Account number must be exactly 4 digits");
      }
      updates.accountNumberLast4 = args.accountNumberLast4;
    }

    if (args.balance !== undefined) {
      updates.balance = validateNumber(args.balance, "Balance");
      updates.lastUpdated = Date.now();
    }

    if (args.currency !== undefined) {
      updates.currency = args.currency;
    }

    // Update account
    await ctx.db.patch(args.accountId, updates);

    await logActivity(ctx, {
      householdId: account.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "asset_updated",
      entityType: "financial_account",
      entityId: args.accountId,
      description: `Updated financial account: ${updates.name || account.name}`,
    });

    return args.accountId;
  },
});

/**
 * Delete a financial account
 *
 * SECURITY: Requires active subscription
 */
export const deleteAccount = mutation({
  args: {
    accountId: v.id("financialAccounts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    await requireHouseholdAccess(ctx, account.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, account.householdId);

    // Delete the account
    await ctx.db.delete(args.accountId);

    await logActivity(ctx, {
      householdId: account.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "asset_deleted",
      entityType: "financial_account",
      entityId: args.accountId,
      description: `Deleted financial account: ${account.name}`,
    });

    return null;
  },
});

// ============================================================================
// MUTATIONS - PROPERTIES
// ============================================================================

/**
 * Create a new property
 *
 * SECURITY: Requires active subscription
 */
export const createProperty = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
    type: propertyTypeValidator,
    address: v.optional(v.string()),
    estimatedValue: v.optional(v.number()),
    purchaseDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  returns: v.id("properties"),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, args.householdId);

    // Validate inputs
    // Property names can be longer (e.g., "123 Main Street, Apartment 4B")
    const name = validateRequiredString(args.name, "Property name", 200);
    const notes = validateOptionalString(args.notes, "Notes", STRING_LIMITS.notes);

    // Validate numeric inputs
    const estimatedValue = validateNumber(args.estimatedValue, "Estimated value");

    // Create property
    const propertyId = await ctx.db.insert("properties", {
      householdId: args.householdId,
      name,
      type: args.type,
      address: args.address?.trim(),
      estimatedValue,
      purchaseDate: args.purchaseDate,
      notes,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "asset_created",
      entityType: "property",
      entityId: propertyId,
      description: `Added property: ${args.name}`,
    });

    return propertyId;
  },
});

/**
 * Update an existing property
 *
 * SECURITY: Requires active subscription
 */
export const updateProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    name: v.optional(v.string()),
    type: v.optional(propertyTypeValidator),
    address: v.optional(v.string()),
    estimatedValue: v.optional(v.number()),
    purchaseDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  returns: v.id("properties"),
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    await requireHouseholdAccess(ctx, property.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, property.householdId);

    // Build update object
    const updates: Partial<Doc<"properties">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      const validated = validateOptionalString(args.name, "Property name", 200);
      if (validated === undefined) {
        throw new Error("Property name cannot be empty");
      }
      updates.name = validated;
    }

    if (args.type !== undefined) {
      updates.type = args.type;
    }

    if (args.address !== undefined) {
      updates.address = args.address?.trim();
    }

    if (args.estimatedValue !== undefined) {
      updates.estimatedValue = validateNumber(args.estimatedValue, "Estimated value");
    }

    if (args.purchaseDate !== undefined) {
      updates.purchaseDate = args.purchaseDate;
    }

    if (args.notes !== undefined) {
      updates.notes = validateOptionalString(args.notes, "Notes", STRING_LIMITS.notes);
    }

    // Update property
    await ctx.db.patch(args.propertyId, updates);

    await logActivity(ctx, {
      householdId: property.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "asset_updated",
      entityType: "property",
      entityId: args.propertyId,
      description: `Updated property: ${updates.name || property.name}`,
    });

    return args.propertyId;
  },
});

/**
 * Delete a property
 *
 * SECURITY: Requires active subscription
 */
export const deleteProperty = mutation({
  args: {
    propertyId: v.id("properties"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    // SECURITY: Verify access first to avoid leaking subscription status
    await requireHouseholdAccess(ctx, property.householdId);
    await requireActiveSubscription(ctx, property.householdId);
    const { profile } = await requireAuth(ctx);

    // Delete the property
    await ctx.db.delete(args.propertyId);

    await logActivity(ctx, {
      householdId: property.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "asset_deleted",
      entityType: "property",
      entityId: args.propertyId,
      description: `Deleted property: ${property.name}`,
    });

    return null;
  },
});

// ============================================================================
// MUTATIONS - INSURANCE POLICIES
// ============================================================================

/**
 * Create a new insurance policy
 *
 * SECURITY: Requires active subscription
 */
export const createInsurancePolicy = mutation({
  args: {
    householdId: v.id("households"),
    type: insuranceTypeValidator,
    provider: v.string(),
    policyNumberLast4: v.optional(v.string()),
    coverageAmount: v.optional(v.number()),
    premiumAmount: v.optional(v.number()),
    premiumFrequency: v.optional(premiumFrequencyValidator),
    beneficiaries: v.optional(v.string()),
    expirationDate: v.optional(v.number()),
  },
  returns: v.id("insurancePolicies"),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, args.householdId);

    // Validate inputs
    const provider = validateRequiredString(args.provider, "Provider name", STRING_LIMITS.name);

    if (args.policyNumberLast4 && args.policyNumberLast4.length !== 4) {
      throw new Error("Policy number must be exactly 4 digits");
    }

    const beneficiaries = validateOptionalString(
      args.beneficiaries,
      "Beneficiaries information",
      STRING_LIMITS.description,
    );

    // Validate numeric inputs
    const coverageAmount = validateNumber(args.coverageAmount, "Coverage amount");
    const premiumAmount = validateNumber(args.premiumAmount, "Premium amount");

    // Create insurance policy
    const policyId = await ctx.db.insert("insurancePolicies", {
      householdId: args.householdId,
      type: args.type,
      provider,
      policyNumberLast4: args.policyNumberLast4,
      coverageAmount,
      premiumAmount,
      premiumFrequency: args.premiumFrequency,
      beneficiaries,
      expirationDate: args.expirationDate,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "policy_created",
      entityType: "insurance_policy",
      entityId: policyId,
      description: `Added ${args.type} insurance policy from ${args.provider}`,
    });

    return policyId;
  },
});

/**
 * Update an existing insurance policy
 *
 * SECURITY: Requires active subscription
 */
export const updateInsurancePolicy = mutation({
  args: {
    policyId: v.id("insurancePolicies"),
    type: v.optional(insuranceTypeValidator),
    provider: v.optional(v.string()),
    policyNumberLast4: v.optional(v.string()),
    coverageAmount: v.optional(v.number()),
    premiumAmount: v.optional(v.number()),
    premiumFrequency: v.optional(premiumFrequencyValidator),
    beneficiaries: v.optional(v.string()),
    expirationDate: v.optional(v.number()),
  },
  returns: v.id("insurancePolicies"),
  handler: async (ctx, args) => {
    const policy = await ctx.db.get(args.policyId);
    if (!policy) {
      throw new Error("Insurance policy not found");
    }

    await requireHouseholdAccess(ctx, policy.householdId);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, policy.householdId);
    const { profile } = await requireAuth(ctx);

    // Build update object
    const updates: Partial<Doc<"insurancePolicies">> = {
      updatedAt: Date.now(),
    };

    if (args.type !== undefined) {
      updates.type = args.type;
    }

    if (args.provider !== undefined) {
      const validated = validateOptionalString(args.provider, "Provider name", STRING_LIMITS.name);
      if (validated === undefined) {
        throw new Error("Provider name cannot be empty");
      }
      updates.provider = validated;
    }

    if (args.policyNumberLast4 !== undefined) {
      if (args.policyNumberLast4 && args.policyNumberLast4.length !== 4) {
        throw new Error("Policy number must be exactly 4 digits");
      }
      updates.policyNumberLast4 = args.policyNumberLast4;
    }

    if (args.coverageAmount !== undefined) {
      updates.coverageAmount = validateNumber(args.coverageAmount, "Coverage amount");
    }

    if (args.premiumAmount !== undefined) {
      updates.premiumAmount = validateNumber(args.premiumAmount, "Premium amount");
    }

    if (args.premiumFrequency !== undefined) {
      updates.premiumFrequency = args.premiumFrequency;
    }

    if (args.beneficiaries !== undefined) {
      updates.beneficiaries = validateOptionalString(
        args.beneficiaries,
        "Beneficiaries information",
        STRING_LIMITS.description,
      );
    }

    if (args.expirationDate !== undefined) {
      updates.expirationDate = args.expirationDate;
    }

    // Update policy
    await ctx.db.patch(args.policyId, updates);

    await logActivity(ctx, {
      householdId: policy.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "policy_updated",
      entityType: "insurance_policy",
      entityId: args.policyId,
      description: `Updated ${updates.type || policy.type} insurance policy`,
    });

    return args.policyId;
  },
});

/**
 * Delete an insurance policy
 *
 * SECURITY: Requires active subscription
 */
export const deleteInsurancePolicy = mutation({
  args: {
    policyId: v.id("insurancePolicies"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const policy = await ctx.db.get(args.policyId);
    if (!policy) {
      throw new Error("Insurance policy not found");
    }

    await requireHouseholdAccess(ctx, policy.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, policy.householdId);

    // Delete the policy
    await ctx.db.delete(args.policyId);

    await logActivity(ctx, {
      householdId: policy.householdId,
      userId: profile._id,
      module: "financial",
      actionType: "policy_deleted",
      entityType: "insurance_policy",
      entityId: args.policyId,
      description: `Deleted ${policy.type} insurance policy from ${policy.provider}`,
    });

    return null;
  },
});

// ============================================================================
// MUTATIONS - SUGGESTIONS
// ============================================================================

/**
 * Dismiss a suggestion
 * Marks the suggestion as dismissed and sets the dismissedAt timestamp
 *
 * SECURITY: Requires active subscription
 */
export const dismissSuggestion = mutation({
  args: {
    suggestionId: v.id("userSuggestions"),
  },
  returns: v.id("userSuggestions"),
  handler: async (ctx, args) => {
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    await requireHouseholdAccess(ctx, suggestion.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, suggestion.householdId);

    // Verify the suggestion belongs to the current user
    if (suggestion.userId !== profile._id) {
      throw new Error("Access denied: This suggestion does not belong to you");
    }

    // Update suggestion status
    await ctx.db.patch(args.suggestionId, {
      status: "dismissed",
      dismissedAt: Date.now(),
    });

    return args.suggestionId;
  },
});

/**
 * Complete a suggestion
 * Marks the suggestion as completed and sets the completedAt timestamp
 *
 * SECURITY: Requires active subscription
 */
export const completeSuggestion = mutation({
  args: {
    suggestionId: v.id("userSuggestions"),
  },
  returns: v.id("userSuggestions"),
  handler: async (ctx, args) => {
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    await requireHouseholdAccess(ctx, suggestion.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription
    await requireActiveSubscription(ctx, suggestion.householdId);

    // Verify the suggestion belongs to the current user
    if (suggestion.userId !== profile._id) {
      throw new Error("Access denied: This suggestion does not belong to you");
    }

    // Update suggestion status
    await ctx.db.patch(args.suggestionId, {
      status: "completed",
      completedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: suggestion.householdId,
      userId: profile._id,
      module: "suggestion",
      actionType: "suggestion_completed",
      entityType: "suggestion",
      entityId: args.suggestionId,
      description: "Completed a smart suggestion",
    });

    return args.suggestionId;
  },
});
