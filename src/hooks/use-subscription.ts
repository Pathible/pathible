"use client";

import type { SubscriptionTier } from "@/convex/shared/subscriptionTiers";
import { useEffectiveSubscription } from "@/lib/feature-access-hooks";

export type SubscriptionPlan = SubscriptionTier | null;

/**
 * Hook to check user's subscription status.
 *
 * Uses Convex as the source of truth (via useEffectiveSubscription).
 * Maintains the same return shape for backwards compatibility.
 */
export function useSubscription() {
  const { isLoading, effectiveTier, subscriptionStatus } = useEffectiveSubscription();

  const isLoaded = !isLoading;
  const plan = effectiveTier as SubscriptionPlan;
  const hasAnyPlan = effectiveTier !== null && subscriptionStatus === "active";

  return {
    isLoaded,
    plan,
    hasFoundations: hasAnyPlan && effectiveTier === "foundations",
    hasHeritage:
      hasAnyPlan &&
      (effectiveTier === "heritage" || effectiveTier === "legacy" || effectiveTier === "founders"),
    hasLegacy: hasAnyPlan && (effectiveTier === "legacy" || effectiveTier === "founders"),
    hasFounders: hasAnyPlan && effectiveTier === "founders",
    hasAnyPlan,
  };
}
