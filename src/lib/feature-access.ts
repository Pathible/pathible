/**
 * Feature Access Control Utilities
 *
 * This file contains server-safe utilities and constants for feature access control.
 * For client-side hooks, import from "@/lib/feature-access-hooks" instead.
 *
 * @see src/convex/shared/subscriptionTiers.ts for tier definitions
 * @see src/convex/auth.ts getEffectiveSubscription query
 */

import {
  FEATURE_DISPLAY,
  FEATURE_SLUGS,
  FEATURE_TIERS,
  type FeatureSlug,
  getFeatureMetadata as getFeatureMetadataFromSource,
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
  TIER_DISPLAY,
} from "@/convex/shared/subscriptionTiers";

// Re-export hooks from the client-only module for backwards compatibility
// Note: These should only be imported in client components
export {
  useEffectiveFeatureAccess,
  useEffectiveMultipleFeatureAccess,
  useEffectiveSubscription,
  useEffectiveTierAccess,
} from "./feature-access-hooks";
// Re-export for backwards compatibility
export {
  FEATURE_SLUGS,
  FEATURE_TIERS,
  type FeatureSlug,
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
  TIER_DISPLAY,
};

/**
 * Feature slugs alias for backwards compatibility
 * @see FEATURE_SLUGS
 */
export const FEATURES = FEATURE_SLUGS;

/**
 * Display labels for each plan tier
 */
export const PLAN_LABELS: Record<SubscriptionTier, string> = {
  foundations: TIER_DISPLAY.foundations.label,
  heritage: TIER_DISPLAY.heritage.label,
  legacy: TIER_DISPLAY.legacy.label,
  founders: TIER_DISPLAY.founders.label,
};

/**
 * Feature metadata for UI display
 * Maps feature slugs to human-readable names and descriptions
 */
export const FEATURE_METADATA: Record<
  FeatureSlug,
  { name: string; description: string; requiredPlan: string }
> = Object.fromEntries(
  Object.values(FEATURE_SLUGS).map((slug) => {
    const display = FEATURE_DISPLAY[slug];
    const requiredTier = FEATURE_TIERS[slug];
    return [
      slug,
      {
        name: display.name,
        description: display.description,
        requiredPlan: TIER_DISPLAY[requiredTier].label,
      },
    ];
  }),
) as Record<FeatureSlug, { name: string; description: string; requiredPlan: string }>;

/**
 * Get the required plan for upgrading to a feature
 */
export function getRequiredPlanForFeature(feature: FeatureSlug): string {
  return FEATURE_METADATA[feature]?.requiredPlan ?? "Unknown";
}

/**
 * Get full feature metadata including required tier
 * @see getFeatureMetadata from @/convex/shared/subscriptionTiers
 */
export const getFeatureMetadata = getFeatureMetadataFromSource;
