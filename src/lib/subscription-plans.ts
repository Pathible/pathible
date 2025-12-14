/**
 * Subscription Plan Constants
 *
 * Single source of truth for plan identifiers used across the app.
 * Use these constants to avoid hardcoding plan names in multiple places.
 */

/**
 * Available subscription plan tiers
 */
export const PLAN_TIERS = ["foundations", "heritage", "legacy"] as const;

/**
 * Type for valid plan tier names
 */
export type PlanTier = (typeof PLAN_TIERS)[number];

/**
 * Display labels for each plan tier
 */
export const PLAN_LABELS: Record<PlanTier, string> = {
  foundations: "Foundations",
  heritage: "Heritage",
  legacy: "Legacy",
};

/**
 * Plan descriptions for UI display
 */
export const PLAN_DESCRIPTIONS: Record<PlanTier, string> = {
  foundations: "Essential features for getting started",
  heritage: "Advanced features for growing families",
  legacy: "Premium features for comprehensive legacy planning",
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
  return PLAN_TIERS.some((plan) => has({ plan }));
}

/**
 * Get the user's current plan tier
 *
 * Returns the highest tier the user has access to, or null if no plan
 */
export function getCurrentPlanTier(
  has: ((params: { plan: string }) => boolean) | undefined,
): PlanTier | null {
  if (!has) return null;

  // Check in descending order (highest tier first)
  if (has({ plan: "legacy" })) return "legacy";
  if (has({ plan: "heritage" })) return "heritage";
  if (has({ plan: "foundations" })) return "foundations";

  return null;
}
