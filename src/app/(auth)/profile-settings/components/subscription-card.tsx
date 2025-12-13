"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tierLabels: Record<string, string> = {
  foundations: "Foundations",
  heritage: "Heritage",
  legacy: "Legacy",
};

/**
 * SubscriptionCard - Displays user's current subscription plan
 *
 * Uses Clerk's `has()` method to check subscription status directly.
 * This is the source of truth for subscription - Convex data is a mirror.
 *
 * Users can manage their subscription through Clerk's UserButton
 * which has a built-in billing management tab.
 */
export function SubscriptionCard() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { has, isLoaded: isAuthLoaded } = useAuth();

  // Loading state
  if (!isUserLoaded || !isAuthLoaded) {
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

  // Determine current plan using Clerk's has() method
  // This checks subscription status directly with Clerk - source of truth
  let currentPlan: string = "none";
  if (has?.({ plan: "legacy" })) {
    currentPlan = "legacy";
  } else if (has?.({ plan: "heritage" })) {
    currentPlan = "heritage";
  } else if (has?.({ plan: "foundations" })) {
    currentPlan = "foundations";
  }

  const hasActivePlan = currentPlan !== "none";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <p className="font-medium">
              {hasActivePlan ? `${tierLabels[currentPlan]} Plan` : "No Active Plan"}
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  hasActivePlan
                    ? "bg-green-500/10 text-green-600 border-green-200"
                    : "bg-gray-500/10 text-gray-600 border-gray-200"
                }
              >
                {hasActivePlan ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Billing Management Info */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            To manage your subscription, update payment methods, view invoices, or change your plan,
            click on your profile picture in the top navigation and select{" "}
            <strong>"Manage account"</strong>.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Billing is powered by Stripe through Clerk. All payment information is securely handled.
        </p>
      </CardContent>
    </Card>
  );
}
