"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { AlertCircle, Lightbulb, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { ComingSoonBadge } from "@/components/coming-soon";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { AccountManager } from "./account-manager";
import { FinancialStats } from "./financial-stats";
import { InsuranceManager } from "./insurance-manager";
import { LearningCenter } from "./learning-center";
import { PropertyManager } from "./property-manager";
import { SuggestionsList } from "./suggestions-list";

export function FinancialContent() {
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
    return null;
  }

  // Not authenticated
  if (!user) {
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

  // Still loading households
  if (households === undefined || (households === null && retryCount < maxRetries)) {
    return null;
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
          <TabsTrigger value="suggestions" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Smart Suggestions
            <ComingSoonBadge size="sm" />
          </TabsTrigger>
          <TabsTrigger value="learning" className="gap-2">
            Faith & Finances
            <ComingSoonBadge size="sm" />
          </TabsTrigger>
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
