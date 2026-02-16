"use client";

import { Building, DollarSign, Shield, Wallet } from "lucide-react";
import { StatCard } from "@/components/stat-card";

interface FinancialStatsProps {
  stats: {
    totalAccounts: number;
    totalProperties: number;
    totalPolicies: number;
    accountsByType: Record<string, number>;
    propertiesByType: Record<string, number>;
    policiesByType: Record<string, number>;
    totalAccountBalance: number;
    totalPropertyValue: number;
    totalCoverageAmount: number;
  };
}

export function FinancialStats({ stats }: FinancialStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate net worth from account balances + property values
  const netWorth = stats.totalAccountBalance + stats.totalPropertyValue;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={DollarSign}
        iconColor="text-primary"
        value={formatCurrency(netWorth)}
        title="Net Worth"
        description="Total assets value"
      />
      <StatCard
        icon={Wallet}
        iconColor="text-accent"
        value={stats.totalAccounts}
        title="Financial Accounts"
        description="Active accounts"
      />
      <StatCard
        icon={Building}
        iconColor="text-secondary"
        value={stats.totalProperties}
        title="Properties"
        description="Real estate holdings"
      />
      <StatCard
        icon={Shield}
        iconColor="text-muted-foreground"
        value={formatCurrency(stats.totalCoverageAmount)}
        title="Insurance Coverage"
        description="Total protection"
      />
    </div>
  );
}
