"use client";

import { Clock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURE_METADATA, FEATURES, type FeatureSlug } from "@/lib/feature-access";
import { cn } from "@/lib/utils";

/**
 * Features that are defined but not yet implemented.
 * These will show "Coming Soon" UI instead of the actual feature.
 *
 * Based on FEATURE_GAP_ANALYSIS.md - update this as features are completed.
 */
export const COMING_SOON_FEATURES = new Set<FeatureSlug>([
  // Heritage Vault - Partial/Missing
  FEATURES.VAULT_VOICE_UPLOADS,
  FEATURES.VAULT_GUIDED_ORGANIZATION,

  // Financial Intelligence - Missing
  FEATURES.FINANCIAL_SUMMARIES,
  FEATURES.FINANCIAL_INSIGHTS,
  FEATURES.FINANCIAL_SPENDING_CATEGORIES,
  FEATURES.FINANCIAL_TRENDS,

  // Family Network - Missing
  FEATURES.FAMILY_MESSAGING,
  FEATURES.FAMILY_RELATIONSHIPS,

  // Legacy Builder - Missing
  FEATURES.LEGACY_STORY_TEMPLATES,

  // Wisdom - Missing
  FEATURES.WISDOM_SHARED_PAGES,
]);

/**
 * Check if a feature is marked as "Coming Soon"
 */
export function isComingSoon(feature: FeatureSlug): boolean {
  return COMING_SOON_FEATURES.has(feature);
}

// =============================================================================
// Coming Soon Badge
// =============================================================================

interface ComingSoonBadgeProps {
  /** Optional custom label */
  label?: string;
  /** Size variant */
  size?: "sm" | "default";
  /** Additional className */
  className?: string;
}

/**
 * Small badge to indicate a feature is coming soon.
 * Use on buttons, cards, or next to feature names.
 *
 * @example
 * ```tsx
 * <Button disabled>
 *   Voice Recording <ComingSoonBadge />
 * </Button>
 * ```
 */
export function ComingSoonBadge({
  label = "Coming Soon",
  size = "default",
  className,
}: ComingSoonBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
        "dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
        size === "sm" && "text-[10px] px-1.5 py-0",
        className,
      )}
    >
      <Clock className={cn("mr-1", size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />
      {label}
    </Badge>
  );
}

// =============================================================================
// Coming Soon Overlay
// =============================================================================

interface ComingSoonOverlayProps {
  /** Content to show behind the overlay */
  children: ReactNode;
  /** Feature slug for metadata lookup */
  feature?: FeatureSlug;
  /** Custom title (overrides feature metadata) */
  title?: string;
  /** Custom description (overrides feature metadata) */
  description?: string;
  /** Additional className for the container */
  className?: string;
}

/**
 * Wraps content with a blurred overlay and "Coming Soon" message.
 * Use when you want to show what the feature will look like, but disabled.
 *
 * @example
 * ```tsx
 * <ComingSoonOverlay feature={FEATURES.VAULT_VOICE_UPLOADS}>
 *   <VoiceRecordingUI />
 * </ComingSoonOverlay>
 * ```
 */
export function ComingSoonOverlay({
  children,
  feature,
  title,
  description,
  className,
}: ComingSoonOverlayProps) {
  const metadata = feature ? FEATURE_METADATA[feature] : null;
  const displayTitle = title ?? metadata?.name ?? "Feature";
  const displayDescription =
    description ?? metadata?.description ?? "This feature is under development.";

  return (
    <div className={cn("relative", className)}>
      {/* Blurred content behind */}
      <div className="blur-sm opacity-50 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Overlay with message */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
            <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{displayTitle}</h3>
          <p className="text-muted-foreground text-sm mb-3">{displayDescription}</p>
          <ComingSoonBadge />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Coming Soon Card
// =============================================================================

interface ComingSoonCardProps {
  /** Feature slug for metadata lookup */
  feature: FeatureSlug;
  /** Custom title (overrides feature metadata) */
  title?: string;
  /** Custom description (overrides feature metadata) */
  description?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Standalone card for an unreleased feature.
 * Use in feature grids or dashboards to show planned features.
 *
 * @example
 * ```tsx
 * <ComingSoonCard
 *   feature={FEATURES.FAMILY_MESSAGING}
 *   icon={<MessageCircle className="h-5 w-5" />}
 * />
 * ```
 */
export function ComingSoonCard({
  feature,
  title,
  description,
  icon,
  className,
}: ComingSoonCardProps) {
  const metadata = FEATURE_METADATA[feature];
  const displayTitle = title ?? metadata?.name ?? "Coming Soon";
  const displayDescription =
    description ?? metadata?.description ?? "This feature is under development.";

  return (
    <Card
      className={cn(
        "border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-base">{displayTitle}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {metadata?.requiredPlan} plan
              </CardDescription>
            </div>
          </div>
          <ComingSoonBadge size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{displayDescription}</p>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Coming Soon Button Wrapper
// =============================================================================

interface ComingSoonButtonProps {
  /** The button or clickable element to wrap */
  children: ReactNode;
  /** Feature slug for the tooltip */
  feature?: FeatureSlug;
  /** Additional className */
  className?: string;
}

/**
 * Wraps a button to disable it and add a "Coming Soon" badge.
 *
 * @example
 * ```tsx
 * <ComingSoonButton feature={FEATURES.VAULT_VOICE_UPLOADS}>
 *   <Button>Record Voice Memo</Button>
 * </ComingSoonButton>
 * ```
 */
export function ComingSoonButton({ children, className }: ComingSoonButtonProps) {
  return (
    <div className={cn("relative inline-flex items-center gap-2", className)}>
      <div className="opacity-50 pointer-events-none">{children}</div>
      <ComingSoonBadge size="sm" />
    </div>
  );
}
