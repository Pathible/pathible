"use client";

import { SignedIn, useAuth, useUser } from "@clerk/nextjs";
import { SubscriptionDetailsButton, useSubscription } from "@clerk/nextjs/experimental";
import { ArrowUpRight, CreditCard, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentPlanTier, PLAN_LABELS } from "@/lib/subscription-plans";

const statusVariants: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  past_due: {
    label: "Past Due",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  },
  canceled: {
    label: "Canceled",
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
  incomplete: {
    label: "Incomplete",
    className: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
  trialing: {
    label: "Trial",
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
  },
};

/**
 * SubscriptionCard - Comprehensive subscription management interface
 *
 * Uses Clerk's official billing components:
 * - useSubscription hook for detailed subscription data
 * - SubscriptionDetailsButton for in-app subscription management
 * - Navigation to pricing table for plan changes
 *
 * Displays:
 * - Current plan with status badge
 * - Next payment date and amount
 * - Subscription start date
 * - Action buttons for management and plan changes
 */
export function SubscriptionCard() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { has, isLoaded: isAuthLoaded } = useAuth();
  const { data: subscription, isLoading: isSubscriptionLoading } = useSubscription();

  // Loading state
  if (!isUserLoaded || !isAuthLoaded || isSubscriptionLoading) {
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

  // Not signed in
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please sign in to view your subscription.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine current plan using shared utility
  const currentPlan = getCurrentPlanTier(has);
  const hasActivePlan = currentPlan !== null;

  // Get subscription details from Clerk
  const subscriptionStatus = subscription?.status || "inactive";
  const statusInfo = statusVariants[subscriptionStatus] || statusVariants.inactive;

  // Format dates
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const nextPaymentDate = formatDate(subscription?.currentPeriodEnd);
  const startDate = formatDate(subscription?.createdAt);

  // Format amount
  const formatAmount = (amount: number | null | undefined) => {
    if (!amount) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const nextPaymentAmount = formatAmount(
    subscription?.currentPeriodEnd ? subscription?.amount : null,
  );

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
              {hasActivePlan && currentPlan ? `${PLAN_LABELS[currentPlan]} Plan` : "No Active Plan"}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
          <CreditCard className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Subscription Details */}
        {hasActivePlan && subscription && (
          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="text-sm font-medium">Subscription Details</h3>
            <div className="space-y-2 text-sm">
              {startDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{startDate}</span>
                </div>
              )}
              {nextPaymentDate && subscriptionStatus === "active" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next payment</span>
                  <span className="font-medium">{nextPaymentDate}</span>
                </div>
              )}
              {nextPaymentAmount && subscriptionStatus === "active" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{nextPaymentAmount}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <SignedIn>
            <SubscriptionDetailsButton>
              <Button variant="default" className="flex-1 sm:flex-none">
                <Settings className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </SubscriptionDetailsButton>
          </SignedIn>

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
          Billing is powered by Stripe through Clerk. All payment information is securely handled.
        </p>
      </CardContent>
    </Card>
  );
}
