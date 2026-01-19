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

// Re-export for backwards compatibility
export {
  FEATURE_SLUGS,
  FEATURE_TIERS,
  SUBSCRIPTION_TIERS,
  TIER_DISPLAY,
  type FeatureSlug,
  type SubscriptionTier,
};

// Re-export hooks from the client-only module for backwards compatibility
// Note: These should only be imported in client components
export {
  useEffectiveFeatureAccess,
  useEffectiveMultipleFeatureAccess,
  useEffectiveSubscription,
  useEffectiveTierAccess,
} from "./feature-access-hooks";

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
 * Valid feature slugs for runtime validation
 */
const VALID_FEATURE_SLUGS = new Set(Object.values(FEATURE_SLUGS));

/**
 * Check if user has access to a specific feature (server-side)
 *
 * IMPORTANT: This is for server-side use in API routes and Server Components.
 * Always pair with backend validation in Convex mutations for defense in depth.
 *
 * @example Server-side (API route)
 * ```ts
 * const { has } = await auth();
 * const canAccessTags = checkFeatureAccess(has, FEATURES.VAULT_TAGS_COLLECTIONS);
 * if (!canAccessTags) {
 *   return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
 * }
 * ```
 *
 * @example Server Component
 * ```ts
 * const { has } = await auth();
 * if (!checkFeatureAccess(has, FEATURES.FINANCIAL_TRENDS)) {
 *   return <UpgradePrompt feature={FEATURES.FINANCIAL_TRENDS} />;
 * }
 * ```
 */
export function checkFeatureAccess(
  has: ((params: { feature: string }) => boolean) | undefined,
  feature: FeatureSlug,
): boolean {
  if (!has) return false;

  // Runtime validation to prevent injection
  if (!VALID_FEATURE_SLUGS.has(feature)) {
    console.error(`[feature-access] Invalid feature slug: ${feature}`);
    return false;
  }

  return has({ feature });
}

/**
 * Check if user has access to any of the given features (server-side)
 *
 * @example
 * ```ts
 * const { has } = await auth();
 * const hasAnyVaultFeature = checkAnyFeatureAccess(has, [
 *   FEATURES.VAULT_DOCUMENT_STORAGE,
 *   FEATURES.VAULT_PHOTO_VIDEO,
 * ]);
 * ```
 */
export function checkAnyFeatureAccess(
  has: ((params: { feature: string }) => boolean) | undefined,
  features: FeatureSlug[],
): boolean {
  if (!has) return false;
  return features.some((feature) => has({ feature }));
}

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

// ============================================================================
// CLERK PLAN CHECKING (Server-side plan validation)
// ============================================================================

/**
 * Check if user has any active subscription plan
 *
 * Works with both server-side `has` from auth() and client-side `has` from useAuth()
 *
 * @example Server-side (middleware, layout):
 * ```ts
 * const { has } = await auth();
 * const hasActivePlan = checkHasActivePlan(has);
 * ```
 *
 * @example Client-side (hooks, components):
 * ```ts
 * const { has } = useAuth();
 * const hasActivePlan = checkHasActivePlan(has);
 * ```
 */
export function checkHasActivePlan(
  has: ((params: { plan: string }) => boolean) | undefined,
): boolean {
  if (!has) return false;
  return SUBSCRIPTION_TIERS.some((plan) => has({ plan }));
}

/**
 * Get the user's current plan tier
 *
 * Returns the highest tier the user has access to, or null if no plan.
 * Founders is checked first as it's equivalent to Legacy but is a distinct plan.
 */
export function getCurrentPlanTier(
  has: ((params: { plan: string }) => boolean) | undefined,
): SubscriptionTier | null {
  if (!has) return null;

  // Check in descending order (highest tier first)
  // Founders is equivalent to Legacy but shown as distinct plan
  if (has({ plan: "founders" })) return "founders";
  if (has({ plan: "legacy" })) return "legacy";
  if (has({ plan: "heritage" })) return "heritage";
  if (has({ plan: "foundations" })) return "foundations";

  return null;
}
