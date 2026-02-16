"use client";

import { useQuery } from "convex/react";
import { Wallet } from "lucide-react";
import {
  AuthLoadingSpinner,
  ConnectionErrorCard,
  SetupRequiredCard,
  SignInRequiredCard,
} from "@/components/auth-states";
import { api } from "@/convex/_generated/api";
import { useAuthenticatedHousehold } from "@/hooks/use-authenticated-household";
import { AccountManager } from "./account-manager";
import { FinancialStats } from "./financial-stats";
import { InsuranceManager } from "./insurance-manager";
import { PropertyManager } from "./property-manager";

export function FinancialContent() {
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
    insurance === undefined;

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

      <AccountManager accounts={accounts || []} householdId={householdId} isLoading={isLoading} />
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
    </div>
  );
}
