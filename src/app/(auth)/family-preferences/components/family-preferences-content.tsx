"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { FamilyInformationCard } from "./family-information-card";
import { NotificationPreferencesCard } from "./notification-preferences-card";

export function FamilyPreferencesContent() {
  // Track retry attempts for auth sync
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  // Check Clerk session status
  const { user, isLoaded: isUserLoaded } = useUser();

  // Load household data
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

  // Loading state
  const isAuthLoading = !isUserLoaded || (!user && retryCount < maxRetries);

  if (isAuthLoading || households === undefined) {
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
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please sign in to access family preferences.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No household found
  if (!households || households.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Family Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please complete your onboarding to set up your family.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get the first household (primary household)
  const household = households[0];

  // Check if user can edit (owner or steward)
  const canEdit = household.userRole === "owner" || household.userRole === "steward";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Family Preferences</h1>
          <p className="text-muted-foreground text-lg">
            Manage your immediate family unit settings
          </p>
        </div>
      </div>

      {/* Settings Cards */}
      <FamilyInformationCard household={household} canEdit={canEdit} />

      <NotificationPreferencesCard canEdit={canEdit} />
    </div>
  );
}
