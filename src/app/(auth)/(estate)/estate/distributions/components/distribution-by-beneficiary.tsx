"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type DistributionMethod =
  | "direct_transfer"
  | "wire_transfer"
  | "check"
  | "title_transfer"
  | "in_kind"
  | "other";

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

interface DistributionByBeneficiaryProps {
  stats: DistributionStats;
}

export function DistributionByBeneficiary({ stats }: DistributionByBeneficiaryProps) {
  if (stats.byBeneficiary.length === 0) {
    return (
      <div
        className="text-center py-8 text-muted-foreground"
        data-testid="dist-by-beneficiary-empty"
      >
        No distributions have been recorded yet.
      </div>
    );
  }

  const maxValue = Math.max(...stats.byBeneficiary.map((b) => b.totalValue), 1);

  return (
    <div className="space-y-3" data-testid="distribution-by-beneficiary">
      {stats.byBeneficiary.map((entry) => {
        const percentage = maxValue > 0 ? Math.round((entry.totalValue / maxValue) * 100) : 0;
        return (
          <Card key={entry.beneficiaryName}>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{entry.beneficiaryName}</span>
                <span className="tabular-nums font-medium">
                  ${entry.totalValue.toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {entry.count} distribution{entry.count !== 1 ? "s" : ""}
                {stats.totalValue > 0 && (
                  <> ({Math.round((entry.totalValue / stats.totalValue) * 100)}% of total)</>
                )}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
