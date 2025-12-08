"use client";

import { useQuery } from "convex/react";
import { AlertCircle, Lightbulb, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { AccountManager } from "./account-manager";
import { FinancialStats } from "./financial-stats";
import { InsuranceManager } from "./insurance-manager";
import { LearningCenter } from "./learning-center";
import { PropertyManager } from "./property-manager";
import { SuggestionsList } from "./suggestions-list";

export function FinancialContent() {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  // Check Better Auth session status
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  // Get user's households
  const households = useQuery(
    api.households.list,
    !isSessionPending && session?.user ? {} : "skip",
  );

  // Unified retry logic for auth race conditions
  useEffect(() => {
    const needsRetry =
      !isSessionPending && retryCount < maxRetries && (!session?.user || households === null);

    if (needsRetry) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSessionPending, session?.user, households, retryCount]);

  // Determine if we're still in the auth loading phase
  const isAuthLoading = isSessionPending || (!session?.user && retryCount < maxRetries);

  // Use the first household
  const householdId = households?.[0]?._id;

  // Fetch financial data
  const stats = useQuery(api.financial.getStats, householdId ? { householdId } : "skip");
  const accounts = useQuery(api.financial.listAccounts, householdId ? { householdId } : "skip");
  const properties = useQuery(api.financial.listProperties, householdId ? { householdId } : "skip");
  const insurance = useQuery(
    api.financial.listInsurancePolicies,
    householdId ? { householdId } : "skip",
  );
  const suggestions = useQuery(
    api.financial.getSuggestions,
    householdId ? { householdId } : "skip",
  );

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-10 w-80" />
          </div>
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>

          {/* Content Area Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-9 w-32 rounded-md" />
              </div>
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please sign in to access Financial Intelligence.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Still loading households - show full page skeleton
  if (households === undefined || (households === null && retryCount < maxRetries)) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-10 w-80" />
          </div>
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>

          {/* Content Area Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-9 w-32 rounded-md" />
              </div>
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
            You need to be part of a household to access Financial Intelligence. Please complete
            your onboarding or contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isLoading =
    stats === undefined ||
    accounts === undefined ||
    properties === undefined ||
    insurance === undefined ||
    suggestions === undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Financial Intelligence</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Track your financial accounts, properties, and insurance in one place
        </p>
      </div>

      {/* Stats Cards */}
      {stats && <FinancialStats stats={stats} />}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Lightbulb className="h-4 w-4 mr-2" />
            Smart Suggestions
          </TabsTrigger>
          <TabsTrigger value="learning">Faith & Finances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AccountManager
            accounts={accounts || []}
            householdId={householdId}
            isLoading={isLoading}
          />
          <PropertyManager
            properties={properties || []}
            householdId={householdId}
            isLoading={isLoading}
          />
          <InsuranceManager
            insurance={insurance || []}
            householdId={householdId}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestionsList suggestions={suggestions || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="learning">
          <LearningCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
