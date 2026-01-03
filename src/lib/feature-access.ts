/**
 * Feature Access Control Utilities
 *
 * IMPORTANT: This file now uses Convex as the source of truth for subscription tier,
 * NOT Clerk Billing. This allows for tier overrides (promotional pricing).
 *
 * The `useEffectiveSubscription` hook queries Convex for the effective tier,
 * which considers both the actual subscription tier and any override.
 *
 * @see src/convex/shared/subscriptionTiers.ts for tier definitions
 * @see src/convex/auth.ts getEffectiveSubscription query
 */

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FEATURE_DISPLAY,
  FEATURE_SLUGS,
  FEATURE_TIERS,
  type FeatureSlug,
  getFeatureMetadata as getFeatureMetadataFromSource,
  type SubscriptionTier,
  TIER_DISPLAY,
  tierHasAccess,
  tierHasFeatureAccess,
} from "@/convex/shared/subscriptionTiers";

// Re-export for backwards compatibility
export { FEATURE_SLUGS, FEATURE_TIERS, type FeatureSlug };

/**
 * Feature slugs from Clerk Dashboard
 * @deprecated Use FEATURE_SLUGS from @/convex/shared/subscriptionTiers
 *
 * These MUST match the exact slugs configured in Clerk Billing
 */
export const FEATURES = FEATURE_SLUGS;

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
 * Client-side hook for checking feature access
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasAccess, isLoaded } = useFeatureAccess(FEATURES.VAULT_TAGS_COLLECTIONS);
 *
 *   if (!isLoaded) return <Skeleton />;
 *   if (!hasAccess) return <UpgradePrompt feature={FEATURES.VAULT_TAGS_COLLECTIONS} />;
 *
 *   return <TagsCollectionsUI />;
 * }
 * ```
 */
export function useFeatureAccess(feature: FeatureSlug) {
  const { has, isLoaded } = useAuth();

  return {
    isLoaded,
    hasAccess: has?.({ feature }) ?? false,
    featureMetadata: FEATURE_METADATA[feature],
  };
}

/**
 * Client-side hook for checking multiple features
 *
 * @example
 * ```tsx
 * function VaultSection() {
 *   const { features, isLoaded } = useMultipleFeatureAccess([
 *     FEATURES.VAULT_TAGS_COLLECTIONS,
 *     FEATURES.VAULT_VOICE_UPLOADS,
 *   ]);
 *
 *   if (!isLoaded) return <Skeleton />;
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
export function useMultipleFeatureAccess(featureList: FeatureSlug[]) {
  const { has, isLoaded } = useAuth();

  const features = featureList.reduce(
    (acc, feature) => {
      acc[feature] = has?.({ feature }) ?? false;
      return acc;
    },
    {} as Record<FeatureSlug, boolean>,
  );

  return {
    isLoaded,
    features,
    hasAny: Object.values(features).some(Boolean),
    hasAll: Object.values(features).every(Boolean),
  };
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
// CONVEX-BASED HOOKS (Source of Truth for Feature Gating)
// ============================================================================

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
  const subscription = useQuery(api.auth.getEffectiveSubscription);

  return {
    /** True while the query is loading */
    isLoading: subscription === undefined,
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
  const { effectiveTier, isLoading, subscription } = useEffectiveSubscription();

  const hasAccess = effectiveTier ? tierHasAccess(effectiveTier, requiredTier) : false;

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
  const { effectiveTier, isLoading, subscription } = useEffectiveSubscription();

  const requiredTier = FEATURE_TIERS[feature];
  const hasAccess = effectiveTier ? tierHasFeatureAccess(effectiveTier, feature) : false;

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
