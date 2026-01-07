"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Heart,
  LayoutTemplate,
  Loader2,
  ScrollText,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ComingSoonCard } from "@/components/coming-soon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { FEATURES } from "@/lib/feature-access";
import { LegacySummary } from "./legacy-summary";
import { LegacyWizard } from "./legacy-wizard";
import { LegalDocumentsSection } from "./legal-documents-section";

export function LegacyContent() {
  // Track retry attempts for auth sync
  const [retryCount, setRetryCount] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const maxRetries = 10;

  // URL-controlled tabs for tour navigation
  const activeTab = searchParams.get("tab") || "legacy-plan";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const query = params.toString();
    router.push(query ? `/legacy?${query}` : "/legacy", {
      scroll: false,
    });
  };

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
  const legalDocsStats = useQuery(
    api.legalDocuments.getStats,
    householdId ? { householdId } : "skip",
  );

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
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Signed In</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Sign in to start creating your legacy plan.
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
          <h3 className="text-lg font-semibold mb-2">Having Trouble Connecting</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            We&apos;re having trouble reaching your family&apos;s data. Mind giving it another try?
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
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Set Up</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Complete your profile to start building your legacy plan.
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
            Give your family clarity, not confusion. A simple way to put your intentions in writing.
          </p>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="legacy-plan" className="gap-2">
            <Heart className="h-4 w-4" />
            Your Legacy Plan
            {stats && (
              <Badge
                variant={legacyPlan?.isComplete ? "default" : "secondary"}
                className="ml-1 text-xs"
              >
                {legacyPlan?.isComplete ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                {stats.completionPercentage}%
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="legal-documents" className="gap-2" data-tour="legal-documents-tab">
            <ScrollText className="h-4 w-4" />
            Legal Documents
            {legalDocsStats && legalDocsStats.totalDocuments > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {legalDocsStats.completedDocuments}/{legalDocsStats.totalDocuments}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Legacy Plan */}
        <TabsContent value="legacy-plan" className="space-y-6">
          {legacyPlan?.isComplete ? (
            <LegacySummary
              householdId={householdId}
              householdName={households[0]?.name ?? "My Family"}
              userName={user.firstName ?? user.fullName ?? "User"}
              legacyPlan={legacyPlan}
              stats={stats}
            />
          ) : (
            <>
              <LegacyWizard
                householdId={householdId}
                legacyPlan={legacyPlan}
                onCreatePlan={() => createPlan({ householdId })}
              />

              {/* Coming Soon Features */}
              <ComingSoonCard
                feature={FEATURES.LEGACY_STORY_TEMPLATES}
                title="Story Templates"
                description="Pre-written templates to help you capture life stories, values, and memories for future generations."
                icon={<LayoutTemplate className="h-5 w-5" />}
              />
            </>
          )}
        </TabsContent>

        {/* Tab 2: Legal Documents */}
        <TabsContent value="legal-documents" className="space-y-6">
          <LegalDocumentsSection householdId={householdId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
