"use client";

import { useUser } from "@clerk/nextjs";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tierHasAccess } from "@/convex/shared/subscriptionTiers";
import { FEATURE_METADATA, FEATURE_TIERS, FEATURES, type FeatureSlug } from "@/lib/feature-access";
import { useEffectiveSubscription } from "@/lib/feature-access-hooks";

/**
 * Debug component to display current user's subscription and feature access.
 * Uses Convex as source of truth (not Clerk billing).
 *
 * NOTE: This component is hidden in production builds.
 */
export function SubscriptionDebug() {
  const { user, isLoaded: userLoaded } = useUser();
  const {
    isLoading,
    effectiveTier,
    subscriptionTier,
    subscriptionStatus,
    hasOverride,
    householdId,
  } = useEffectiveSubscription();

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const isLoaded = userLoaded && !isLoading;

  if (!isLoaded) {
    return (
      <Card className="border-dashed border-yellow-500">
        <CardHeader>
          <CardTitle>Subscription Debug</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check all features using effective tier
  const featureResults: Record<string, boolean> = {};
  for (const [_key, slug] of Object.entries(FEATURES)) {
    const requiredTier = FEATURE_TIERS[slug as FeatureSlug];
    featureResults[slug] = effectiveTier ? tierHasAccess(effectiveTier, requiredTier) : false;
  }

  // Group features by category
  const categories = {
    "Heritage Vault": Object.entries(FEATURES).filter(([k]) => k.startsWith("VAULT_")),
    "Financial Intelligence": Object.entries(FEATURES).filter(([k]) => k.startsWith("FINANCIAL_")),
    "Family Network": Object.entries(FEATURES).filter(([k]) => k.startsWith("FAMILY_")),
    "Legacy Builder": Object.entries(FEATURES).filter(([k]) => k.startsWith("LEGACY_")),
    "Wisdom & Education": Object.entries(FEATURES).filter(([k]) => k.startsWith("WISDOM_")),
    Support: Object.entries(FEATURES).filter(([k]) => k.includes("SUPPORT")),
    "Early Access": Object.entries(FEATURES).filter(([k]) => k.startsWith("EARLY_")),
  };

  return (
    <Card className="border-dashed border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Subscription Debug
          <Badge variant="outline" className="text-xs">
            DEV ONLY
          </Badge>
        </CardTitle>
        <CardDescription>Current subscription status from Convex (source of truth)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div>
          <h3 className="font-semibold mb-2">User Info</h3>
          <div className="text-sm space-y-1 font-mono bg-muted p-3 rounded">
            <p>
              <span className="text-muted-foreground">User ID:</span> {user?.id ?? "N/A"}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {user?.primaryEmailAddress?.emailAddress ?? "N/A"}
            </p>
            <p>
              <span className="text-muted-foreground">Household:</span> {householdId ?? "N/A"}
            </p>
          </div>
        </div>

        {/* Plan Status */}
        <div>
          <h3 className="font-semibold mb-2">Plan Status (Convex)</h3>
          <div className="text-sm space-y-1 font-mono bg-muted p-3 rounded">
            <p>
              <span className="text-muted-foreground">Effective Tier:</span>{" "}
              <Badge variant={effectiveTier ? "default" : "destructive"}>
                {effectiveTier ?? "NONE"}
              </Badge>
            </p>
            <p>
              <span className="text-muted-foreground">Actual Tier:</span>{" "}
              {subscriptionTier ?? "NONE"}
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span> {subscriptionStatus ?? "NONE"}
            </p>
            <p>
              <span className="text-muted-foreground">Has Override:</span>{" "}
              {hasOverride ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Feature Access by Category */}
        <div>
          <h3 className="font-semibold mb-2">Feature Access</h3>
          <div className="space-y-4">
            {Object.entries(categories).map(([category, features]) => (
              <div key={category} className="bg-muted p-3 rounded">
                <h4 className="text-sm font-medium mb-2">{category}</h4>
                <div className="grid gap-1">
                  {features.map(([_key, slug]) => {
                    const hasAccess = featureResults[slug];
                    const metadata = FEATURE_METADATA[slug as FeatureSlug];
                    return (
                      <div
                        key={slug}
                        className="flex items-center justify-between text-xs font-mono"
                      >
                        <span className="flex items-center gap-2">
                          {hasAccess ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <code>{slug}</code>
                        </span>
                        <span className="text-muted-foreground">{metadata?.requiredPlan}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
