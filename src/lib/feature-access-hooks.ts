"use client";

/**
 * Client-side Feature Access Hooks
 *
 * These hooks use Convex as the source of truth for subscription tier,
 * NOT Clerk Billing. This allows for tier overrides (promotional pricing).
 *
 * @see src/convex/shared/subscriptionTiers.ts for tier definitions
 * @see src/convex/auth.ts getEffectiveSubscription query
 */

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FEATURE_TIERS,
  type FeatureSlug,
  type SubscriptionTier,
  tierHasAccess,
  tierHasFeatureAccess,
} from "@/convex/shared/subscriptionTiers";
import { FEATURE_METADATA } from "./feature-access";

/**
 * Hook to get the effective subscription tier from Convex
 *
 * This is the CLIENT-SIDE source of truth for subscription access.
 * It queries Convex for the effective tier (considering overrides).
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { effectiveTier, isLoading } = useEffectiveSubscription();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!effectiveTier) return <NotAuthenticated />;
 *
 *   return <div>Your plan: {effectiveTier}</div>;
 * }
 * ```
 */
export function useEffectiveSubscription() {
  // useConvexAuth tells us when Convex has received AND validated the auth token
  // This is more reliable than Clerk's isLoaded which only tracks client-side state
  const { isLoading: isConvexAuthLoading, isAuthenticated } = useConvexAuth();
  const subscription = useQuery(api.auth.getEffectiveSubscription);

  // Consider loading if EITHER:
  // 1. Convex auth is still syncing (JWT not yet validated by Convex)
  // 2. Convex query is still pending
  // This prevents the flash where we show "upgrade" before auth is fully synced
  const isLoading = isConvexAuthLoading || subscription === undefined;

  return {
    /** True while Convex auth or subscription query is loading */
    isLoading,
    /** Whether the user is authenticated with Convex */
    isAuthenticated,
    /** The effective tier (considering overrides), or null if not authenticated */
    effectiveTier: subscription?.effectiveTier ?? null,
    /** The actual subscription tier (what they're paying for) */
    subscriptionTier: subscription?.subscriptionTier ?? null,
    /** Whether there's an active tier override */
    hasOverride: subscription?.hasOverride ?? false,
    /** The subscription status (active, inactive, cancelled, past_due) */
    subscriptionStatus: subscription?.subscriptionStatus ?? null,
    /** The household ID */
    householdId: subscription?.householdId ?? null,
    /** Full subscription data object */
    subscription,
  };
}

/**
 * Hook to check if user has access to a specific tier
 *
 * Uses the effective tier from Convex (NOT Clerk).
 *
 * @example
 * ```tsx
 * function HeritageFeature() {
 *   const { hasAccess, isLoading } = useEffectiveTierAccess("heritage");
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!hasAccess) return <UpgradePrompt requiredTier="heritage" />;
 *
 *   return <HeritageUI />;
 * }
 * ```
 */
export function useEffectiveTierAccess(requiredTier: SubscriptionTier) {
  const { effectiveTier, isLoading, subscription, subscriptionStatus, hasOverride } =
    useEffectiveSubscription();

  const hasAccess =
    (subscriptionStatus === "active" || hasOverride) && effectiveTier
      ? tierHasAccess(effectiveTier, requiredTier)
      : false;

  return {
    isLoading,
    hasAccess,
    effectiveTier,
    requiredTier,
    subscription,
  };
}

/**
 * Hook to check if user has access to a specific feature
 *
 * Uses the effective tier from Convex (NOT Clerk).
 * This is the RECOMMENDED way to check feature access in components.
 *
 * @example
 * ```tsx
 * function TagsSection() {
 *   const { hasAccess, isLoading, requiredTier } = useEffectiveFeatureAccess(
 *     FEATURES.VAULT_TAGS_COLLECTIONS
 *   );
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!hasAccess) return <UpgradePrompt requiredTier={requiredTier} />;
 *
 *   return <TagsUI />;
 * }
 * ```
 */
export function useEffectiveFeatureAccess(feature: FeatureSlug) {
  const { effectiveTier, isLoading, subscription, subscriptionStatus, hasOverride } =
    useEffectiveSubscription();

  const requiredTier = FEATURE_TIERS[feature];
  const hasAccess =
    (subscriptionStatus === "active" || hasOverride) && effectiveTier
      ? tierHasFeatureAccess(effectiveTier, feature)
      : false;

  return {
    isLoading,
    hasAccess,
    effectiveTier,
    requiredTier,
    featureMetadata: FEATURE_METADATA[feature],
    subscription,
  };
}

/**
 * Hook to check multiple features at once
 *
 * Uses the effective tier from Convex (NOT Clerk).
 *
 * @example
 * ```tsx
 * function VaultSection() {
 *   const { features, isLoading, hasAny } = useEffectiveMultipleFeatureAccess([
 *     FEATURES.VAULT_TAGS_COLLECTIONS,
 *     FEATURES.VAULT_VOICE_UPLOADS,
 *   ]);
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <>
 *       {features.vault_tags_collections && <TagsUI />}
 *       {features.vault_voice_uploads && <VoiceUI />}
 *     </>
 *   );
 * }
 * ```
 */
export function useEffectiveMultipleFeatureAccess(featureList: FeatureSlug[]) {
  const { effectiveTier, isLoading, subscription } = useEffectiveSubscription();

  const features = featureList.reduce(
    (acc, feature) => {
      acc[feature] = effectiveTier ? tierHasFeatureAccess(effectiveTier, feature) : false;
      return acc;
    },
    {} as Record<FeatureSlug, boolean>,
  );

  return {
    isLoading,
    features,
    hasAny: Object.values(features).some(Boolean),
    hasAll: Object.values(features).every(Boolean),
    effectiveTier,
    subscription,
  };
}
