"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

const tierLabels: Record<string, string> = {
  foundations: "Foundations",
  heritage: "Heritage",
  legacy: "Legacy",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-200",
  trialing: "bg-blue-500/10 text-blue-600 border-blue-200",
  past_due: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export function SubscriptionCard() {
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  const householdId = households?.[0]?._id;
  const household = households?.[0];

  // Loading state
  if (!isUserLoaded || households === undefined) {
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

  // No household found
  if (!householdId || !household) {
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
            <p className="text-muted-foreground mb-4">
              No subscription found. Join or create a household to manage subscriptions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = household.subscriptionTier;
  const status = household.subscriptionStatus;

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
            <p className="font-medium">{tierLabels[tier] || tier} Plan</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[status] || statusColors.inactive}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
              </Badge>
            </div>
          </div>
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Payment Method Info */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Payment methods and billing are managed through our secure payment portal. Click below
            to update your payment information, view invoices, or change your subscription.
          </p>
        </div>

        {/* Manage Subscription Button */}
        <Button variant="outline" className="w-full sm:w-auto" disabled>
          <ExternalLink className="mr-2 h-4 w-4" />
          Manage Subscription
          <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
        </Button>

        <p className="text-xs text-muted-foreground">
          Stripe integration is being configured. Payment management will be available soon.
        </p>
      </CardContent>
    </Card>
  );
}
