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
 * Handles all estate states:
 * - No activation: prompt to activate
 * - Pending cooldown: show countdown
 * - Contested: show contested status
 * - Active: show estate overview
 */
export function EstateDashboardContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const activation = useQuery(api.estate.getActivation, householdId ? { householdId } : "skip");

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

  // Active estate mode
  if (household.estateMode && activation?.status === "active") {
    return <ActiveEstateView deceasedName={activation.deceasedName} />;
  }

  // Pending cooldown
  if (activation?.status === "pending") {
    return (
      <PendingCooldownView
        deceasedName={activation.deceasedName}
        cooldownEndsAt={activation.cooldownEndsAt}
      />
    );
  }

  // Contested
  if (activation?.status === "contested") {
    return <ContestedView deceasedName={activation.deceasedName} />;
  }

  // No activation yet
  return <NotActivatedView />;
}

function NotActivatedView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold">Estate Administration</h2>
        <p className="mt-2 text-muted-foreground">
          Estate administration hasn't been activated yet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-primary" />
            <CardTitle>Begin Estate Administration</CardTitle>
          </div>
          <CardDescription>
            If you're the designated executor and it's time, you can start the estate administration
            process here.
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

function PendingCooldownView({
  deceasedName,
  cooldownEndsAt,
}: {
  deceasedName: string;
  cooldownEndsAt: number;
}) {
  const cooldownEnd = new Date(cooldownEndsAt);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold">Estate Administration</h2>
        <p className="mt-2 text-muted-foreground">
          The activation for {deceasedName} is in the review period.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Clock className="h-8 w-8 text-amber-500" />
          <div>
            <p className="font-semibold">48-hour review period</p>
            <p className="text-sm text-muted-foreground">
              Estate mode will activate on{" "}
              <strong>
                {cooldownEnd.toLocaleDateString()} at {cooldownEnd.toLocaleTimeString()}
              </strong>
              . During this time, household members can review the activation and raise concerns if
              needed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What happens next</CardTitle>
          <CardDescription>
            Once the review period ends, estate mode will activate automatically. Your planning
            features will become read-only, and the estate tools will be ready to use.
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

function ContestedView({ deceasedName }: { deceasedName: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold">Estate Administration</h2>
        <p className="mt-2 text-muted-foreground">
          The activation for {deceasedName} has been contested.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <ShieldAlert className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-semibold">Activation contested</p>
            <p className="text-sm text-muted-foreground">
              A household member has raised a concern about this activation. Our team will review it
              and follow up with you.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActiveEstateView({ deceasedName }: { deceasedName: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold">Estate Overview</h2>
        <p className="mt-2 text-muted-foreground">Estate administration for {deceasedName}.</p>
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
            Start with the checklist and work through each section at your own pace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/estate/checklist">View Checklist</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
