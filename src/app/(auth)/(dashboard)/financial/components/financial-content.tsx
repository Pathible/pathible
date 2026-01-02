"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { AlertCircle, Lightbulb, TrendingUp, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  // URL-controlled tabs for tour navigation
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const query = params.toString();
    router.push(query ? `/financial?${query}` : "/financial", { scroll: false });
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
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Signed In</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Sign in to organize your family&apos;s financial picture.
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
            Complete your profile to start organizing your family&apos;s financial picture.
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
          <h1 className="text-4xl font-bold">Financial Clarity</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Keep your finances organized so your family knows where to look someday
        </p>
      </div>

      {/* Stats Cards */}
      {stats && <FinancialStats stats={stats} />}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
          <TabsTrigger value="learning" data-tour="faith-finances-tab">
            Faith & Finances
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
