"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { CommunicationForm } from "./communication-form";
import { CommunicationLog } from "./communication-log";
import { CommunicationTimeline } from "./communication-timeline";
import { FollowUpPanel } from "./follow-up-panel";

type CommunicationCategory =
  | "financial_institution"
  | "government_agency"
  | "insurance_company"
  | "legal"
  | "beneficiary"
  | "utility"
  | "employer"
  | "other";

export function CommunicationsContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const [categoryFilter, setCategoryFilter] = useState<CommunicationCategory | undefined>(
    undefined,
  );
  const [formOpen, setFormOpen] = useState(false);

  const communications = useQuery(
    api.estateCommunications.listCommunications,
    householdId ? { householdId, category: categoryFilter } : "skip",
  );

  const followUps = useQuery(
    api.estateCommunications.getFollowUps,
    householdId ? { householdId } : "skip",
  );

  const stats = useQuery(
    api.estateCommunications.getCommunicationStats,
    householdId ? { householdId } : "skip",
  );

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
          Activate estate administration to start logging communications.
        </p>
        <Button variant="outline" asChild>
          <Link href="/estate">Go to Estate Overview</Link>
        </Button>
      </div>
    );
  }

  if (communications === undefined || stats === undefined || followUps === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="communications-content">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-4xl font-bold">Communications</h2>
          <p className="mt-1 text-muted-foreground">
            Keep a record of your communications and follow-ups.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setFormOpen(true)}
          data-testid="log-communication-button"
        >
          <Plus className="h-4 w-4" />
          Log Communication
        </Button>
      </div>

      {stats.pendingFollowUps > 0 && <FollowUpPanel followUps={followUps} />}

      <Tabs defaultValue="log" className="w-full">
        <TabsList>
          <TabsTrigger value="log" data-testid="comm-tab-log">
            Log ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="timeline" data-testid="comm-tab-timeline">
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-4">
          <CommunicationLog
            communications={communications}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            householdId={household._id}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <CommunicationTimeline communications={communications} />
        </TabsContent>
      </Tabs>

      <CommunicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        householdId={household._id}
        mode="create"
      />
    </div>
  );
}
