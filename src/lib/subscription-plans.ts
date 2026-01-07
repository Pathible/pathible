/**
 * Subscription Plan Constants
 *
 * Re-exports subscription tier utilities from the single source of truth.
 * Provides backwards-compatible exports for existing code.
 *
 * @see src/convex/shared/subscription-tiers.ts for the source of truth
 */

import {
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
  TIER_DISPLAY,
  TIER_LEVELS,
} from "@/convex/shared/subscriptionTiers";

// Re-export for backwards compatibility
export { SUBSCRIPTION_TIERS, TIER_LEVELS, type SubscriptionTier };

/**
 * Available subscription plan tiers
 * @deprecated Use SUBSCRIPTION_TIERS from @/convex/shared/subscriptionTiers
 */
export const PLAN_TIERS = SUBSCRIPTION_TIERS;

/**
 * Type for valid plan tier names
 * @deprecated Use SubscriptionTier from @/convex/shared/subscriptionTiers
 */
export type PlanTier = SubscriptionTier;

/**
 * Display labels for each plan tier
 * Derived from TIER_DISPLAY for backwards compatibility
 */
export const PLAN_LABELS: Record<SubscriptionTier, string> = {
  foundations: TIER_DISPLAY.foundations.label,
  heritage: TIER_DISPLAY.heritage.label,
  legacy: TIER_DISPLAY.legacy.label,
  founders: TIER_DISPLAY.founders.label,
};

/**
 * Plan descriptions for UI display
 * Derived from TIER_DISPLAY for backwards compatibility
 */
export const PLAN_DESCRIPTIONS: Record<SubscriptionTier, string> = {
  foundations: TIER_DISPLAY.foundations.shortDescription,
  heritage: TIER_DISPLAY.heritage.shortDescription,
  legacy: TIER_DISPLAY.legacy.shortDescription,
  founders: TIER_DISPLAY.founders.shortDescription,
};

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
