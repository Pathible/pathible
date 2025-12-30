"use client";

import { Protect } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { FEATURE_METADATA, type FeatureSlug } from "@/lib/feature-access";
import { UpgradePrompt } from "./upgrade-prompt";

interface FeatureGateProps {
  /**
   * The feature slug to check access for.
   * Must match a feature configured in Clerk Dashboard.
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
   * Whether to show a compact version of the upgrade prompt.
   * Useful for inline feature gates.
   */
  compact?: boolean;
}

/**
 * Component that gates content behind a feature check.
 * Uses Clerk's Protect component with feature-based access control.
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
export function FeatureGate({ feature, children, fallback, compact = false }: FeatureGateProps) {
  const metadata = FEATURE_METADATA[feature];

  const defaultFallback = (
    <UpgradePrompt
      feature={feature}
      featureName={metadata?.name ?? feature}
      featureDescription={metadata?.description ?? ""}
      requiredPlan={metadata?.requiredPlan ?? "Unknown"}
      compact={compact}
    />
  );

  return (
    <Protect feature={feature} fallback={fallback ?? defaultFallback}>
      {children}
    </Protect>
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
