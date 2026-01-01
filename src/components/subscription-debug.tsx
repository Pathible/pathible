"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/use-subscription";
import { FEATURE_METADATA, FEATURES, type FeatureSlug } from "@/lib/feature-access";

/**
 * Debug component to display current user's subscription and feature access.
 * Use this to verify Clerk configuration matches your feature definitions.
 *
 * Add to any page temporarily:
 * ```tsx
 * import { SubscriptionDebug } from "@/components/subscription-debug";
 * <SubscriptionDebug />
 * ```
 *
 * NOTE: This component is hidden in production builds.
 */
export function SubscriptionDebug() {
  const { user, isLoaded: userLoaded } = useUser();
  const { has, isLoaded: authLoaded } = useAuth();
  const {
    plan,
    hasFoundations,
    hasHeritage,
    hasLegacy,
    hasFounders,
    hasAnyPlan,
    isLoaded: subLoaded,
  } = useSubscription();

  // Hide in production - this is a development-only debug tool
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const isLoaded = userLoaded && authLoaded && subLoaded;

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

  // Check all features
  const featureResults: Record<string, boolean> = {};
  for (const [_key, slug] of Object.entries(FEATURES)) {
    featureResults[slug] = has?.({ feature: slug }) ?? false;
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
          🔧 Subscription Debug
          <Badge variant="outline" className="text-xs">
            DEV ONLY
          </Badge>
        </CardTitle>
        <CardDescription>Current subscription status and feature access from Clerk</CardDescription>
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
          </div>
        </div>

        {/* Plan Status */}
        <div>
          <h3 className="font-semibold mb-2">Plan Status</h3>
          <div className="text-sm space-y-1 font-mono bg-muted p-3 rounded">
            <p>
              <span className="text-muted-foreground">Current Plan:</span>{" "}
              <Badge variant={plan ? "default" : "destructive"}>{plan ?? "NONE"}</Badge>
            </p>
            <p>
              <span className="text-muted-foreground">hasAnyPlan:</span>{" "}
              {hasAnyPlan ? "✅ true" : "❌ false"}
            </p>
            <p>
              <span className="text-muted-foreground">has(foundations):</span>{" "}
              {hasFoundations ? "✅ true" : "❌ false"}
            </p>
            <p>
              <span className="text-muted-foreground">has(heritage):</span>{" "}
              {hasHeritage ? "✅ true" : "❌ false"}
            </p>
            <p>
              <span className="text-muted-foreground">has(legacy):</span>{" "}
              {hasLegacy ? "✅ true" : "❌ false"}
            </p>
            <p>
              <span className="text-muted-foreground">has(founders):</span>{" "}
              {hasFounders ? "✅ true" : "❌ false"}
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

        {/* Raw has() output */}
        <div>
          <h3 className="font-semibold mb-2">Raw Feature Check Results</h3>
          <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-64">
            {JSON.stringify(featureResults, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
