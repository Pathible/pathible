"use client";

import { Building, DollarSign, Shield, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const statCards = [
    {
      title: "Net Worth",
      value: formatCurrency(netWorth),
      icon: DollarSign,
      description: "Total assets value",
    },
    {
      title: "Financial Accounts",
      value: stats.totalAccounts.toString(),
      icon: Wallet,
      description: "Active accounts",
    },
    {
      title: "Properties",
      value: stats.totalProperties.toString(),
      icon: Building,
      description: "Real estate holdings",
    },
    {
      title: "Insurance Coverage",
      value: formatCurrency(stats.totalCoverageAmount),
      icon: Shield,
      description: "Total protection",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
