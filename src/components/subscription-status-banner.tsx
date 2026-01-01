"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

/**
 * Displays a warning banner when user doesn't have an active subscription.
 * Should be placed in the dashboard layout to show on all authenticated pages.
 *
 * This implements the "full block" policy - users without active subscriptions
 * see a prominent banner directing them to upgrade.
 */
export function SubscriptionStatusBanner() {
  const { isLoaded, hasAnyPlan } = useSubscription();

  // Don't render anything while loading or if user has an active plan
  if (!isLoaded || hasAnyPlan) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4 mx-4 md:mx-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Subscription Required</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Your subscription is inactive or expired. Please subscribe to access all features.
        </span>
        <Link href="/select-plan">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            Choose a Plan
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
