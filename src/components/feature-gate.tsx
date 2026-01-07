"use client";

/**
 * FeatureGate Component
 *
 * Client-side feature gating using Convex as the source of truth.
 * This component uses the effective subscription tier from Convex,
 * which considers tier overrides for promotional pricing.
 *
 * IMPORTANT: This replaces the previous Clerk-based implementation.
 * The effective tier is calculated in Convex and considers:
 * 1. The actual subscriptionTier (what they pay for)
 * 2. The tierOverride (promotional upgrades)
 * 3. Override expiration
 *
 * @example
 * ```tsx
 * <FeatureGate feature={FEATURES.VAULT_TAGS_COLLECTIONS}>
 *   <TagsUI />
 * </FeatureGate>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <FeatureGate
 *   feature={FEATURES.LEGACY_LEGAL_DOCUMENTS}
 *   fallback={<CustomUpgradePrompt />}
 * >
 *   <LegalDocumentsUI />
 * </FeatureGate>
 * ```
 */

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  FEATURE_TIERS,
  type FeatureSlug,
  getTiersWithAccess,
  TIER_DISPLAY,
} from "@/convex/shared/subscriptionTiers";
import { FEATURE_METADATA, useEffectiveFeatureAccess } from "@/lib/feature-access";
import { UpgradePrompt } from "./upgrade-prompt";

interface FeatureGateProps {
  /**
   * The feature slug to check access for.
   * Access is determined by the user's effective subscription tier.
   */
  feature: FeatureSlug;

  /**
   * Content to render when user has access to the feature.
   */
  children: ReactNode;

  /**
   * Custom fallback content when user doesn't have access.
   * Defaults to UpgradePrompt component.
   */
  fallback?: ReactNode;

  /**
   * Custom loading content while subscription data is loading.
   * Defaults to a centered spinner.
   */
  loading?: ReactNode;

  /**
   * Whether to show a compact version of the upgrade prompt.
   * Useful for inline feature gates.
   */
  compact?: boolean;

  /**
   * If true, renders nothing instead of fallback when access denied.
   * Useful for hiding optional features entirely.
   */
  hideWhenDenied?: boolean;
}

/**
 * Default loading spinner
 */
function DefaultLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

/**
 * Component that gates content behind a plan-based feature check.
 * Uses Convex effective tier (NOT Clerk) for access control.
 *
 * Access is determined by the feature's required plan tier:
 * - Foundations features: accessible to Foundations, Heritage, Legacy, Founders
 * - Heritage features: accessible to Heritage, Legacy, Founders
 * - Legacy features: accessible to Legacy, Founders
 *
 * The effective tier considers tier overrides for promotional pricing,
 * so a user paying for Foundations can have Legacy access if an override is set.
 *
 * @example Basic usage
 * ```tsx
 * <FeatureGate feature={FEATURES.VAULT_TAGS_COLLECTIONS}>
 *   <TagsCollectionsUI />
 * </FeatureGate>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <FeatureGate
 *   feature={FEATURES.FINANCIAL_TRENDS}
 *   fallback={<p>Upgrade to see trends</p>}
 * >
 *   <TrendsChart />
 * </FeatureGate>
 * ```
 *
 * @example Compact mode for inline elements
 * ```tsx
 * <FeatureGate feature={FEATURES.VAULT_VOICE_RECORDINGS} compact>
 *   <VoiceRecordButton />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  loading,
  compact = false,
  hideWhenDenied = false,
}: FeatureGateProps) {
  const { hasAccess, isLoading, requiredTier } = useEffectiveFeatureAccess(feature);

  // Show loading state
  if (isLoading) {
    return <>{loading ?? <DefaultLoading />}</>;
  }

  // User has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (hideWhenDenied) {
    return null;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback: UpgradePrompt
  const metadata = FEATURE_METADATA[feature];
  const requiredPlanLabel = TIER_DISPLAY[requiredTier].label;

  return (
    <UpgradePrompt
      feature={feature}
      featureName={metadata?.name ?? feature}
      featureDescription={metadata?.description ?? ""}
      requiredPlan={requiredPlanLabel}
      compact={compact}
    />
  );
}

/**
 * HOC to wrap a component with feature gating.
 * Useful when you need to gate an entire component tree.
 *
 * @example
 * ```tsx
 * const GatedTrendsPage = withFeatureGate(TrendsPage, FEATURES.FINANCIAL_TRENDS);
 * ```
 */
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  feature: FeatureSlug,
  fallback?: ReactNode,
) {
  return function GatedComponent(props: P) {
    return (
      <FeatureGate feature={feature} fallback={fallback}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}

/**
 * Hook-based alternative for more control over feature gating.
 * Re-exported from feature-access for convenience.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasAccess, isLoading, requiredTier } = useFeatureGate(FEATURES.VAULT_TAGS);
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!hasAccess) {
 *     return <MyCustomUpgrade tier={requiredTier} />;
 *   }
 *   return <FeatureUI />;
 * }
 * ```
 */
export function useFeatureGate(feature: FeatureSlug) {
  return useEffectiveFeatureAccess(feature);
}

// Re-export for convenience
export { FEATURE_TIERS, getTiersWithAccess };
