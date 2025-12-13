"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { LegacySummary } from "./legacy-summary";
import { LegacyWizard } from "./legacy-wizard";

export function LegacyContent() {
  // Track retry attempts for auth sync
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  // Check Clerk session status
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  // Unified retry logic for auth race conditions
  useEffect(() => {
    const needsRetry = isUserLoaded && retryCount < maxRetries && (!user || households === null);

    if (needsRetry) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isUserLoaded, user, households, retryCount]);

  // Determine if we're still in the auth loading phase
  const isAuthLoading = !isUserLoaded || (!user && retryCount < maxRetries);

  // Use the first household
  const householdId = households?.[0]?._id;

  // Get legacy plan and stats
  const legacyPlan = useQuery(api.legacy.get, householdId ? { householdId } : "skip");
  const stats = useQuery(api.legacy.getStats, householdId ? { householdId } : "skip");

  // Create legacy plan mutation
  const createPlan = useMutation(api.legacy.create);

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please sign in to access Legacy Planning.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Still loading households
  if (households === undefined || (households === null && retryCount < maxRetries)) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Auth sync failed
  if (households === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connection Issue</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            Unable to load your household data. Please refresh the page or try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No household found
  if (!householdId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Household Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            You need to be part of a household to access Legacy Planning. Please complete your
            onboarding or contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = legacyPlan === undefined || stats === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show summary if plan is complete, otherwise show wizard
  if (legacyPlan?.isComplete) {
    return <LegacySummary householdId={householdId} legacyPlan={legacyPlan} stats={stats} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Legacy Planning</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Turn your values and organization into a living plan that blends legal clarity,
            financial wisdom, and faith.
          </p>
        </div>
      </div>

      {/* Wizard */}
      <LegacyWizard
        householdId={householdId}
        legacyPlan={legacyPlan}
        onCreatePlan={() => createPlan({ householdId })}
      />

      {/* Privacy Note */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-base text-foreground/80 text-center font-medium">
          Your responses are private and secure. This information helps create your personalized
          legacy plan.
        </p>
      </div>
    </div>
  );
}
