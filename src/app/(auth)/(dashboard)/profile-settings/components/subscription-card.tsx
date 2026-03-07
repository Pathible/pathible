"use client";

import { ArrowUpRight, CreditCard, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LABELS } from "@/lib/feature-access";
import { useEffectiveSubscription } from "@/lib/feature-access-hooks";

const statusVariants: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  past_due: {
    label: "Past Due",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  },
  cancelled: {
    label: "Canceled",
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
  },
};

/**
 * SubscriptionCard - Subscription management using Convex + Stripe
 *
 * Uses Convex as source of truth for subscription data.
 * "Manage Subscription" redirects to Stripe Customer Portal.
 */
export function SubscriptionCard() {
  const { isLoading, effectiveTier, subscriptionStatus, hasOverride, subscription } =
    useEffectiveSubscription();
  const [isRedirectingToPortal, setIsRedirectingToPortal] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActivePlan = effectiveTier !== null && subscriptionStatus === "active";
  const statusInfo = statusVariants[subscriptionStatus ?? "inactive"] ?? statusVariants.inactive;

  const handleManageSubscription = async () => {
    setIsRedirectingToPortal(true);
    try {
      const response = await fetch("/api/stripe/create-portal", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
    } finally {
      setIsRedirectingToPortal(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan Overview */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              {hasActivePlan && effectiveTier
                ? `${PLAN_LABELS[effectiveTier]} Plan`
                : "No Active Plan"}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
              {hasOverride && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                  Override
                </Badge>
              )}
            </div>
          </div>
          <CreditCard className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Override Info */}
        {hasOverride && subscription && (
          <div className="space-y-2 rounded-lg border p-4">
            <h3 className="text-sm font-medium">Tier Override Active</h3>
            <div className="space-y-1 text-sm">
              {subscription.overrideReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="font-medium">{subscription.overrideReason}</span>
                </div>
              )}
              {subscription.overrideExpiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium">
                    {new Date(subscription.overrideExpiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Paying for {subscription.subscriptionTier}, accessing {subscription.effectiveTier}{" "}
                features.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {hasActivePlan && (
            <Button
              variant="default"
              className="flex-1 sm:flex-none"
              onClick={handleManageSubscription}
              disabled={isRedirectingToPortal}
            >
              <Settings className="mr-2 h-4 w-4" />
              {isRedirectingToPortal ? "Opening..." : "Manage Subscription"}
            </Button>
          )}

          <Button variant="outline" className="flex-1 sm:flex-none" asChild>
            <Link href={hasActivePlan ? "/select-plan?change=true" : "/select-plan"}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              {hasActivePlan ? "Change Plan" : "View Plans"}
            </Link>
          </Button>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            {hasActivePlan ? (
              <>
                Click <strong>Manage Subscription</strong> to update payment methods, view invoices,
                or cancel your subscription.
              </>
            ) : (
              <>Select a plan to unlock premium features and get started with your journey.</>
            )}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Billing is powered by Stripe. All payment information is securely handled.
        </p>
      </CardContent>
    </Card>
  );
}
