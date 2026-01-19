"use client";

import { useAuth } from "@clerk/nextjs";
import {
  checkHasActivePlan,
  getCurrentPlanTier,
  type SubscriptionTier,
} from "@/lib/feature-access";

export type SubscriptionPlan = SubscriptionTier | null;

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
      hasFounders: false,
      hasAnyPlan: false,
    };
  }

  // Use shared utility functions
  const plan = getCurrentPlanTier(has);
  const hasAnyPlan = checkHasActivePlan(has);

  // Individual plan checks for convenience
  const hasFoundations = has?.({ plan: "foundations" }) ?? false;
  const hasHeritage = has?.({ plan: "heritage" }) ?? false;
  const hasLegacy = has?.({ plan: "legacy" }) ?? false;
  const hasFounders = has?.({ plan: "founders" }) ?? false;

  return {
    isLoaded: true,
    plan,
    hasFoundations,
    hasHeritage,
    hasLegacy,
    hasFounders,
    hasAnyPlan,
  };
}
