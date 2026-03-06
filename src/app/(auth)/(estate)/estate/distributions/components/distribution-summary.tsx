"use client";

import { Card, CardContent } from "@/components/ui/card";

type DistributionMethod =
  | "direct_transfer"
  | "wire_transfer"
  | "check"
  | "title_transfer"
  | "in_kind"
  | "other";

const METHOD_LABELS: Record<DistributionMethod, string> = {
  direct_transfer: "Direct Transfer",
  wire_transfer: "Wire Transfer",
  check: "Check",
  title_transfer: "Title Transfer",
  in_kind: "In Kind",
  other: "Other",
};

interface DistributionStats {
  total: number;
  totalValue: number;
  byBeneficiary: Array<{
    beneficiaryName: string;
    count: number;
    totalValue: number;
  }>;
  byMethod: Array<{
    method: DistributionMethod;
    count: number;
  }>;
}

interface DistributionSummaryProps {
  stats: DistributionStats;
}

export function DistributionSummary({ stats }: DistributionSummaryProps) {
  if (stats.total === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" data-testid="distribution-summary">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Distributions</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">${stats.totalValue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Value Distributed</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">By Method</p>
          <div className="space-y-1">
            {stats.byMethod.map((entry) => (
              <div key={entry.method} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{METHOD_LABELS[entry.method]}</span>
                <span className="font-medium tabular-nums">{entry.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
