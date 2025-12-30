"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeatureSlug } from "@/lib/feature-access";

interface UpgradePromptProps {
  /**
   * The feature slug (for data-testid)
   */
  feature: FeatureSlug;

  /**
   * Display name of the feature
   */
  featureName: string;

  /**
   * Description of what the feature does
   */
  featureDescription: string;

  /**
   * The plan required to access this feature
   */
  requiredPlan: string;

  /**
   * Whether to show a compact inline version
   */
  compact?: boolean;
}

/**
 * Displays an upgrade prompt when a user doesn't have access to a feature.
 * Shown as the fallback in FeatureGate component.
 *
 * @example Full card version (default)
 * ```tsx
 * <UpgradePrompt
 *   feature="vault_tags_collections"
 *   featureName="Tags & Collections"
 *   featureDescription="Organize with tags and curated collections"
 *   requiredPlan="Heritage"
 * />
 * ```
 *
 * @example Compact inline version
 * ```tsx
 * <UpgradePrompt
 *   feature="vault_voice_recordings"
 *   featureName="Voice Recordings"
 *   featureDescription="Record oral histories"
 *   requiredPlan="Heritage"
 *   compact
 * />
 * ```
 */
export function UpgradePrompt({
  feature,
  featureName,
  featureDescription,
  requiredPlan,
  compact = false,
}: UpgradePromptProps) {
  if (compact) {
    return (
      <div
        data-testid="upgrade-prompt"
        data-feature={feature}
        className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/25 bg-muted/50 px-3 py-2"
      >
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {featureName} requires {requiredPlan}
        </span>
        <Link href="/select-plan?change=true">
          <Button variant="link" size="sm" className="h-auto p-0 text-sm">
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card
      data-testid="upgrade-prompt"
      data-feature={feature}
      className="mx-auto max-w-md border-dashed"
    >
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{featureName}</CardTitle>
        <CardDescription>{featureDescription}</CardDescription>
      </CardHeader>

      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          This feature is available on the{" "}
          <span className="font-semibold text-foreground">{requiredPlan}</span> plan and above.
        </p>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Link href="/select-plan?change=true">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to {requiredPlan}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

/**
 * A simpler banner version for page-level feature gating
 */
export function UpgradeBanner({
  feature,
  featureName,
  requiredPlan,
}: {
  feature: FeatureSlug;
  featureName: string;
  requiredPlan: string;
}) {
  return (
    <div
      data-testid="upgrade-banner"
      data-feature={feature}
      className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{featureName}</p>
          <p className="text-sm text-muted-foreground">Available on {requiredPlan} plan</p>
        </div>
      </div>
      <Link href="/select-plan?change=true">
        <Button variant="outline" size="sm">
          Upgrade
        </Button>
      </Link>
    </div>
  );
}
