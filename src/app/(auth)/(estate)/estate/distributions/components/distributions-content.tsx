"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { DistributionByBeneficiary } from "./distribution-by-beneficiary";
import { DistributionForm } from "./distribution-form";
import { DistributionList } from "./distribution-list";
import { DistributionSummary } from "./distribution-summary";

export function DistributionsContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const [formOpen, setFormOpen] = useState(false);

  const distributions = useQuery(
    api.estateDistributions.listDistributions,
    householdId ? { householdId } : "skip",
  );

  const stats = useQuery(
    api.estateDistributions.getDistributionStats,
    householdId ? { householdId } : "skip",
  );

  const assets = useQuery(api.estateAssets.listAssets, householdId ? { householdId } : "skip");

  if (!isUserLoaded || households === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!household || !household.estateMode) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          Estate administration must be active to view distributions.
        </p>
        <Button variant="outline" asChild>
          <Link href="/estate">Go to Estate Overview</Link>
        </Button>
      </div>
    );
  }

  if (distributions === undefined || stats === undefined || assets === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="distributions-content">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Distributions</h2>
          <p className="mt-1 text-muted-foreground">Track asset distributions to beneficiaries.</p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setFormOpen(true)}
          data-testid="record-distribution-button"
        >
          <Plus className="h-4 w-4" />
          Record Distribution
        </Button>
      </div>

      <DistributionSummary stats={stats} />

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" data-testid="dist-tab-list">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="beneficiary" data-testid="dist-tab-beneficiary">
            By Beneficiary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <DistributionList
            distributions={distributions}
            assets={assets}
            householdId={household._id}
          />
        </TabsContent>

        <TabsContent value="beneficiary" className="mt-4">
          <DistributionByBeneficiary stats={stats} />
        </TabsContent>
      </Tabs>

      <DistributionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        householdId={household._id}
        assets={assets}
        mode="create"
      />
    </div>
  );
}
