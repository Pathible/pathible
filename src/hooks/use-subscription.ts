"use client";

import { useAuth } from "@clerk/nextjs";
import {
  checkHasActivePlan,
  getCurrentPlanTier,
  PLAN_DESCRIPTIONS,
  PLAN_LABELS,
  PLAN_TIERS,
  type PlanTier,
} from "@/lib/subscription-plans";

export type SubscriptionPlan = PlanTier | null;

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

/**
 * Plan tier labels for display
 * Re-exported from shared utility for backwards compatibility
 */
export const planLabels = PLAN_LABELS;

/**
 * Plan tier descriptions
 * Re-exported from shared utility for backwards compatibility
 */
export const planDescriptions = PLAN_DESCRIPTIONS;

/**
 * Available plan tiers
 * Re-exported from shared utility
 */
export const planTiers = PLAN_TIERS;
