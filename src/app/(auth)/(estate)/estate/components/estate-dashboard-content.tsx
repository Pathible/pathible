"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Clock, Loader2, Scale, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

/**
 * Estate Dashboard Content
 *
 * Shows estate status when activated, or redirects to activation when not.
 * Phase 1 shows a minimal overview; future phases add checklist stats,
 * asset counts, and activity feeds.
 */
export function EstateDashboardContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];

  if (!isUserLoaded || households === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!household) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No household found.</p>
      </div>
    );
  }

  // If estate mode is not active, prompt to activate
  if (!household.estateMode) {
    return <NotActivatedView />;
  }

  return <ActiveEstateView />;
}

function NotActivatedView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Estate Administration</h2>
        <p className="mt-2 text-muted-foreground">
          Estate administration has not been activated for this household.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-primary" />
            <CardTitle>Begin Estate Administration</CardTitle>
          </div>
          <CardDescription>
            If you are the designated executor and the time has come, you can activate estate
            administration to begin managing the estate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild data-testid="activate-estate-button">
            <Link href="/estate/activate">Begin Activation</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ActiveEstateView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Estate Overview</h2>
        <p className="mt-2 text-muted-foreground">
          Manage and track estate administration progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="estate-stats-grid">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">Active</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Progress</p>
              <p className="text-lg font-semibold">Getting started</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What to do next</CardTitle>
          <CardDescription>
            The checklist and asset tracking features will be available in upcoming updates. For
            now, review the household documents and financial information in the planning view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/dashboard">View Planning Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
