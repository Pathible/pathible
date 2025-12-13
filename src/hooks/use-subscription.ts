"use client";

import { useAuth } from "@clerk/nextjs";

export type SubscriptionPlan = "foundations" | "heritage" | "legacy" | null;

/**
 * Hook to check user's subscription status using Clerk Billing
 *
 * Uses Clerk's `has()` method to check for active subscription plans.
 * This is the recommended way to check subscription status client-side.
 *
 * @example
 * ```tsx
 * const { plan, hasAnyPlan, isLoaded } = useSubscription();
 *
 * if (!isLoaded) return <Loading />;
 * if (!hasAnyPlan) return <NoPlanMessage />;
 *
 * return <div>Your plan: {plan}</div>;
 * ```
 */
export function useSubscription() {
  const { has, isLoaded } = useAuth();

  if (!isLoaded) {
    return {
      isLoaded: false,
      plan: null as SubscriptionPlan,
      hasFoundations: false,
      hasHeritage: false,
      hasLegacy: false,
      hasAnyPlan: false,
    };
  }

  // Check each plan tier
  // Plans are hierarchical: legacy > heritage > foundations
  const hasFoundations = has?.({ plan: "foundations" }) ?? false;
  const hasHeritage = has?.({ plan: "heritage" }) ?? false;
  const hasLegacy = has?.({ plan: "legacy" }) ?? false;

  // Determine the user's current plan (highest tier they have)
  let plan: SubscriptionPlan = null;
  if (hasLegacy) {
    plan = "legacy";
  } else if (hasHeritage) {
    plan = "heritage";
  } else if (hasFoundations) {
    plan = "foundations";
  }

  return {
    isLoaded: true,
    plan,
    hasFoundations,
    hasHeritage,
    hasLegacy,
    hasAnyPlan: hasFoundations || hasHeritage || hasLegacy,
  };
}

/**
 * Plan tier labels for display
 */
export const planLabels: Record<string, string> = {
  foundations: "Foundations",
  heritage: "Heritage",
  legacy: "Legacy",
};

/**
 * Plan tier descriptions
 */
export const planDescriptions: Record<string, string> = {
  foundations: "Essential features for getting started",
  heritage: "Advanced features for growing families",
  legacy: "Premium features for comprehensive legacy planning",
};
