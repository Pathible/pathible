"use client";

import { useQuery } from "convex/react";
import { Lightbulb, TrendingUp, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthLoadingSpinner,
  ConnectionErrorCard,
  SetupRequiredCard,
  SignInRequiredCard,
} from "@/components/auth-states";
import { ComingSoonBadge } from "@/components/coming-soon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useAuthenticatedHousehold } from "@/hooks/use-authenticated-household";
import { AccountManager } from "./account-manager";
import { FinancialStats } from "./financial-stats";
import { InsuranceManager } from "./insurance-manager";
import { LearningCenter } from "./learning-center";
import { PropertyManager } from "./property-manager";
import { SuggestionsList } from "./suggestions-list";

export function FinancialContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Use consolidated auth + household hook
  const { householdId, isLoading: isAuthLoading, error } = useAuthenticatedHousehold();

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

  // Handle auth loading and error states
  if (isAuthLoading) {
    return <AuthLoadingSpinner />;
  }

  if (error === "not-authenticated") {
    return <SignInRequiredCard context="financial picture" />;
  }

  if (error === "connection-failed") {
    return <ConnectionErrorCard />;
  }

  if (error === "no-household" || !householdId) {
    return <SetupRequiredCard context="financial picture" />;
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
