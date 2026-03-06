"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { AddTaskDialog } from "./add-task-dialog";
import { ChecklistPanel } from "./checklist-panel";
import { ChecklistProgress } from "./checklist-progress";

/**
 * Main checklist page content.
 * Fetches checklist items and stats, renders progress ring and category accordion.
 */
export function ChecklistContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const items = useQuery(api.estate.getChecklist, householdId ? { householdId } : "skip");
  const stats = useQuery(api.estate.getChecklistStats, householdId ? { householdId } : "skip");

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
          Activate estate administration to access the checklist.
        </p>
        <Button variant="outline" asChild>
          <Link href="/estate">Go to Estate Overview</Link>
        </Button>
      </div>
    );
  }

  if (items === undefined || stats === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          Your checklist is being prepared. This may take a moment.
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="checklist-content">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-4xl font-bold">Checklist</h2>
          <p className="mt-1 text-muted-foreground">
            A guided list to help you through the process, one step at a time.
          </p>
        </div>
        <AddTaskDialog householdId={household._id} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_200px]">
        <ChecklistPanel
          items={items}
          categoryStats={stats.byCategory}
          showWhenReady={stats.showWhenReady}
        />

        <div className="order-first lg:order-last lg:sticky lg:top-20">
          <ChecklistProgress total={stats.total} completed={stats.completed} />
        </div>
      </div>
    </div>
  );
}
