/**
 * Subscription Tiers - Single Source of Truth
 *
 * This module defines ALL subscription-related constants, types, and utilities.
 * It serves as the authoritative source for:
 * - Tier definitions and hierarchy
 * - Feature-to-tier mappings
 * - Plan limits (storage, members, units)
 * - Display metadata for UI
 *
 * IMPORTANT: All feature slugs MUST match exactly what's configured in Clerk Dashboard.
 * See /api/debug/clerk-billing to verify the current Clerk configuration.
 */

// ============================================================================
// TIER DEFINITIONS
// ============================================================================

/**
 * Available subscription tiers in order from lowest to highest
 */
export const SUBSCRIPTION_TIERS = ["foundations", "heritage", "legacy", "founders"] as const;

/**
 * Type for valid subscription tier names
 */
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

/**
 * Numeric hierarchy for tier comparison (higher = more features)
 *
 * Founders tier: Special launch offer (first 7 days of 2025).
 * Matches Legacy features forever, with priority support instead of concierge.
 */
export const TIER_LEVELS: Record<SubscriptionTier, number> = {
  foundations: 1,
  heritage: 2,
  legacy: 3,
  founders: 3, // Same level as Legacy - full feature access
} as const;

/**
 * Check if a user's tier grants access to a required tier
 *
 * @param userTier - The user's current subscription tier
 * @param requiredTier - The minimum tier required for access
 * @returns true if user has sufficient tier level
 *
 * @example
 * tierHasAccess("heritage", "foundations") // true
 * tierHasAccess("foundations", "heritage") // false
 * tierHasAccess("founders", "legacy") // true (founders = legacy level)
 */
export function tierHasAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_LEVELS[userTier] >= TIER_LEVELS[requiredTier];
}

/**
 * Get all tiers that have access to a feature requiring the given tier
 *
 * @param requiredTier - The minimum tier required for the feature
 * @returns Array of tier slugs that have access
 *
 * @example
 * getTiersWithAccess("heritage") // ["heritage", "legacy", "founders"]
 * getTiersWithAccess("foundations") // ["foundations", "heritage", "legacy", "founders"]
 */
export function getTiersWithAccess(requiredTier: SubscriptionTier): SubscriptionTier[] {
  const requiredLevel = TIER_LEVELS[requiredTier];
  return SUBSCRIPTION_TIERS.filter((tier) => TIER_LEVELS[tier] >= requiredLevel);
}

// ============================================================================
// EFFECTIVE TIER (with override support)
// ============================================================================

/**
 * Household subscription data needed to compute effective tier
 */
export interface HouseholdSubscriptionData {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: "active" | "inactive" | "cancelled" | "past_due";
  tierOverride?: SubscriptionTier | null;
  tierOverrideExpiresAt?: number | null;
}

/**
 * Get the effective subscription tier for a household
 *
 * This is the SINGLE SOURCE OF TRUTH for determining what tier a household
 * should be treated as. It considers:
 * 1. The tier override (if set and not expired)
 * 2. Falls back to the actual subscription tier
 *
 * IMPORTANT: This function should be used by BOTH server-side (Convex) and
 * client-side code to ensure consistent access control.
 *
 * @param household - Household data with subscription info
 * @returns The effective tier the household should be treated as
 *
 * @example
 * // User pays for foundations ($9.99) but has legacy override (promo)
 * const household = {
 *   subscriptionTier: "foundations",
 *   subscriptionStatus: "active",
 *   tierOverride: "legacy",
 *   tierOverrideExpiresAt: null, // permanent
 * };
 * getEffectiveTier(household) // "legacy"
 *
 * @example
 * // Override has expired
 * const household = {
 *   subscriptionTier: "foundations",
 *   subscriptionStatus: "active",
 *   tierOverride: "legacy",
 *   tierOverrideExpiresAt: Date.now() - 1000, // expired
 * };
 * getEffectiveTier(household) // "foundations"
 */
export function getEffectiveTier(household: HouseholdSubscriptionData): SubscriptionTier {
  // Check if there's a valid, non-expired override
  if (household.tierOverride) {
    const now = Date.now();
    const isExpired =
      household.tierOverrideExpiresAt !== null &&
      household.tierOverrideExpiresAt !== undefined &&
      household.tierOverrideExpiresAt <= now;

    if (!isExpired) {
      return household.tierOverride;
    }
  }

  // Fall back to actual subscription tier
  return household.subscriptionTier;
}

/**
 * Check if a household's effective tier grants access to a required tier
 *
 * Combines getEffectiveTier() and tierHasAccess() for convenience.
 *
 * @example
 * effectiveTierHasAccess(household, "heritage") // true if effective tier >= heritage
 */
export function effectiveTierHasAccess(
  household: HouseholdSubscriptionData,
  requiredTier: SubscriptionTier,
): boolean {
  const effectiveTier = getEffectiveTier(household);
  return tierHasAccess(effectiveTier, requiredTier);
}

/**
 * Check if a household's effective tier grants access to a specific feature
 *
 * Combines getEffectiveTier() and tierHasFeatureAccess() for convenience.
 *
 * @example
 * effectiveTierHasFeatureAccess(household, "vault_tags_collections") // true if effective tier has this feature
 */
export function effectiveTierHasFeatureAccess(
  household: HouseholdSubscriptionData,
  feature: FeatureSlug,
): boolean {
  const effectiveTier = getEffectiveTier(household);
  return tierHasFeatureAccess(effectiveTier, feature);
}

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

/**
 * Feature slug constants
 *
 * Use these constants instead of hardcoding strings.
 * Organized by feature category for easier navigation.
 */
export const FEATURE_SLUGS = {
  // Heritage Vault
  VAULT_DOCUMENT_STORAGE: "vault_document_storage",
  VAULT_PHOTO_VIDEO: "vault_photo_video",
  VAULT_FOLDERS: "vault_folders",
  VAULT_TAGS_COLLECTIONS: "vault_tags_collections",
  VAULT_VOICE_UPLOADS: "vault_voice_uploads",
  VAULT_GUIDED_ORGANIZATION: "vault_guided_organization",

  // Financial Intelligence
  FINANCIAL_OVERVIEW: "financial_overview",
  FINANCIAL_SUMMARIES: "financial_summaries",
  FINANCIAL_INSIGHTS: "financial_insights",
  FINANCIAL_SPENDING_CATEGORIES: "financial_spending_categories",
  FINANCIAL_TRENDS: "financial_trends",

  // Family Network
  FAMILY_MEMBERS: "family_members",
  FAMILY_PROFILES: "family_profiles",
  FAMILY_MESSAGING: "family_messaging",
  FAMILY_RELATIONSHIPS: "family_relationships",

  // Legacy Builder
  LEGACY_QUESTIONNAIRES: "legacy_questionnaires",
  LEGACY_STORY_TEMPLATES: "legacy_story_templates",
  LEGACY_LEGAL_DOCUMENTS: "legacy_legal_documents",

  // Wisdom & Education
  WISDOM_ENTRIES: "wisdom_entries",
  WISDOM_SHARED_PAGES: "wisdom_shared_pages",

  // Support
  STANDARD_SUPPORT: "standard_support",
  SUPPORT_PRIORITY: "support_priority",
  SUPPORT_CONCIERGE: "support_concierge",

  // Early Access
  EARLY_ACCESS_FEATURES: "early_access_features",
} as const;

/**
 * Type for valid feature slugs
 */
export type FeatureSlug = (typeof FEATURE_SLUGS)[keyof typeof FEATURE_SLUGS];

/**
 * Feature-to-minimum-tier mapping
 *
 * Defines which subscription tier is required for each feature.
 * Used by requireFeatureAccess() for server-side enforcement.
 */
export const FEATURE_TIERS: Record<FeatureSlug, SubscriptionTier> = {
  // Heritage Vault
  vault_document_storage: "foundations",
  vault_photo_video: "foundations",
  vault_folders: "foundations",
  vault_tags_collections: "heritage",
  vault_voice_uploads: "heritage",
  vault_guided_organization: "heritage",

  // Financial Intelligence
  financial_overview: "foundations",
  financial_summaries: "heritage",
  financial_insights: "heritage",
  financial_spending_categories: "legacy",
  financial_trends: "legacy",

  // Family Network
  family_members: "foundations",
  family_profiles: "heritage",
  family_messaging: "heritage",
  family_relationships: "legacy",

  // Legacy Builder - Premium only
  legacy_questionnaires: "legacy",
  legacy_story_templates: "legacy",
  legacy_legal_documents: "legacy",

  // Wisdom
  wisdom_entries: "heritage",
  wisdom_shared_pages: "legacy",

  // Support
  standard_support: "foundations",
  support_priority: "heritage",
  support_concierge: "legacy",

  // Early Access
  early_access_features: "heritage",
} as const;

/**
 * Get the required tier for a feature
 *
 * @param feature - The feature slug to check
 * @returns The minimum subscription tier required, or null if feature unknown
 */
export function getRequiredTier(feature: FeatureSlug): SubscriptionTier | null {
  return FEATURE_TIERS[feature] ?? null;
}

/**
 * Check if a tier has access to a specific feature
 *
 * @param userTier - The user's current subscription tier
 * @param feature - The feature slug to check
 * @returns true if user's tier grants access to the feature
 */
export function tierHasFeatureAccess(userTier: SubscriptionTier, feature: FeatureSlug): boolean {
  const requiredTier = getRequiredTier(feature);
  if (!requiredTier) return false;
  return tierHasAccess(userTier, requiredTier);
}

// ============================================================================
// PLAN LIMITS
// ============================================================================

/**
 * Sentinel value for unlimited resources
 */
export const UNLIMITED = Number.MAX_SAFE_INTEGER;

/**
 * Plan limits by tier
 *
 * These limits are enforced server-side in Convex mutations.
 * Must match the limits defined in Clerk Dashboard and UI.
 */
export const PLAN_LIMITS: Record<
  SubscriptionTier,
  {
    storageBytesMax: number;
    familyMembersMax: number;
    familyUnitsMax: number;
  }
> = {
  foundations: {
    storageBytesMax: 5 * 1024 * 1024 * 1024, // 5GB
    familyMembersMax: 1, // 1 viewer
    familyUnitsMax: 1, // Primary family only
  },
  heritage: {
    storageBytesMax: 25 * 1024 * 1024 * 1024, // 25GB
    familyMembersMax: 3, // 3 members
    familyUnitsMax: 3, // Up to 3 family units
  },
  legacy: {
    storageBytesMax: UNLIMITED, // Unlimited
    familyMembersMax: UNLIMITED, // Unlimited
    familyUnitsMax: UNLIMITED, // Unlimited
  },
  founders: {
    // Same as Legacy - exclusive launch offer
    storageBytesMax: UNLIMITED, // Unlimited
    familyMembersMax: UNLIMITED, // Unlimited
    familyUnitsMax: UNLIMITED, // Unlimited
  },
} as const;

/**
 * Get limits for a specific tier
 */
export function getPlanLimits(tier: SubscriptionTier) {
  return PLAN_LIMITS[tier];
}

// ============================================================================
// UI DISPLAY METADATA
// ============================================================================

/**
 * Display metadata for each tier
 *
 * Used for UI labels, descriptions, and styling.
 */
export const TIER_DISPLAY: Record<
  SubscriptionTier,
  {
    label: string;
    description: string;
    shortDescription: string;
    priceMonthly: number | null;
    priceLabel: string;
  }
> = {
  foundations: {
    label: "Foundations",
    description: "Essential features for getting started with family legacy planning",
    shortDescription: "Essential features for getting started",
    priceMonthly: 9.99,
    priceLabel: "$9.99/mo",
  },
  heritage: {
    label: "Heritage",
    description: "Advanced features for growing families with expanded storage and collaboration",
    shortDescription: "Advanced features for growing families",
    priceMonthly: 19.99,
    priceLabel: "$19.99/mo",
  },
  legacy: {
    label: "Legacy",
    description: "Premium features for comprehensive legacy planning with unlimited resources",
    shortDescription: "Premium features for comprehensive legacy planning",
    priceMonthly: 39.99,
    priceLabel: "$39.99/mo",
  },
  founders: {
    label: "Founders",
    description: "Exclusive launch offer with Legacy features forever and priority support",
    shortDescription: "Exclusive launch offer with Legacy features forever",
    priceMonthly: null,
    priceLabel: "Invite Only",
  },
} as const;

/**
 * Get display label for a tier
 */
export function getTierLabel(tier: SubscriptionTier): string {
  return TIER_DISPLAY[tier].label;
}

/**
 * Get display description for a tier
 */
export function getTierDescription(tier: SubscriptionTier): string {
  return TIER_DISPLAY[tier].description;
}

/**
 * Feature metadata for UI display
 *
 * Maps feature slugs to human-readable names and descriptions.
 * The requiredTier is derived from FEATURE_TIERS.
 */
export const FEATURE_DISPLAY: Record<
  FeatureSlug,
  {
    name: string;
    description: string;
  }
> = {
  // Heritage Vault
  vault_document_storage: {
    name: "Secure Document Storage",
    description: "Store important documents with bank-level encryption",
  },
  vault_photo_video: {
    name: "Photo & Video Uploads",
    description: "Preserve family memories with photo and video storage",
  },
  vault_folders: {
    name: "Folder Organization",
    description: "Create folders to organize your documents",
  },
  vault_tags_collections: {
    name: "Tags & Collections",
    description: "Organize with tags and curated collections",
  },
  vault_voice_uploads: {
    name: "Voice Recordings",
    description: "Record oral histories and voice memos",
  },
  vault_guided_organization: {
    name: "Guided Organization",
    description: "Step-by-step wizards for document management",
  },

  // Financial Intelligence
  financial_overview: {
    name: "Financial Overview",
    description: "See all your linked accounts in one place",
  },
  financial_summaries: {
    name: "Account Summaries",
    description: "Detailed summaries for each financial account",
  },
  financial_insights: {
    name: "Financial Insights",
    description: "AI-powered insights about your financial health",
  },
  financial_spending_categories: {
    name: "Spending Categories",
    description: "Automatic categorization of your spending",
  },
  financial_trends: {
    name: "Trend Analysis",
    description: "View spending and saving trends over time",
  },

  // Family Network
  family_members: {
    name: "Family Members",
    description: "Add family members to your household",
  },
  family_profiles: {
    name: "Member Profiles",
    description: "Rich profiles for each family member",
  },
  family_messaging: {
    name: "Family Messaging",
    description: "Private messaging within your household",
  },
  family_relationships: {
    name: "Relationship Mapping",
    description: "Interactive family tree with relationship visualization",
  },

  // Legacy Builder
  legacy_questionnaires: {
    name: "Guided Questionnaires",
    description: "Thoughtful prompts to document your life story",
  },
  legacy_story_templates: {
    name: "Story Templates",
    description: "Pre-built templates for common legacy topics",
  },
  legacy_legal_documents: {
    name: "Legal Document Templates",
    description: "Estate planning document templates with state-specific guidance",
  },

  // Wisdom
  wisdom_entries: {
    name: "Wisdom Entries",
    description: "Document family values, lessons, and life advice",
  },
  wisdom_shared_pages: {
    name: "Shared Wisdom Pages",
    description: "Collaborative pages for family wisdom",
  },

  // Support
  standard_support: {
    name: "Standard Support",
    description: "Email support with 48-hour response time",
  },
  support_priority: {
    name: "Priority Support",
    description: "24-hour response time with live chat",
  },
  support_concierge: {
    name: "Concierge Support",
    description: "Personal support rep with same-day response",
  },

  // Early Access
  early_access_features: {
    name: "Early Feature Access",
    description: "Get new features before general release",
  },
} as const;

/**
 * Get feature metadata with required tier included
 */
export function getFeatureMetadata(feature: FeatureSlug) {
  const display = FEATURE_DISPLAY[feature];
  const requiredTier = FEATURE_TIERS[feature];
  return {
    ...display,
    requiredTier,
    requiredPlan: TIER_DISPLAY[requiredTier].label,
  };
}
