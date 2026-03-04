"use client";

import { cn } from "@/lib/utils";

type AssetStatus =
  | "identified"
  | "verified"
  | "institution_contacted"
  | "in_transfer"
  | "closed"
  | "distributed";

interface StatusStage {
  status: AssetStatus;
  label: string;
  color: string;
  bgColor: string;
}

const PIPELINE_STAGES: StatusStage[] = [
  {
    status: "identified",
    label: "Found",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  {
    status: "verified",
    label: "Confirmed",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    status: "institution_contacted",
    label: "Reached Out",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
  },
  {
    status: "in_transfer",
    label: "In Progress",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/40",
  },
  {
    status: "closed",
    label: "Completed",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/40",
  },
  {
    status: "distributed",
    label: "Passed On",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/40",
  },
];

interface AssetStats {
  total: number;
  totalEstimatedValue: number;
  byStatus: Array<{ status: AssetStatus; count: number }>;
  byCategory: Array<{ category: string; count: number; estimatedValue: number }>;
}

interface AssetStatusPipelineProps {
  stats: AssetStats;
}

export function AssetStatusPipeline({ stats }: AssetStatusPipelineProps) {
  const statusCounts = new Map<AssetStatus, number>();
  for (const entry of stats.byStatus) {
    statusCounts.set(entry.status, entry.count);
  }

  if (stats.total === 0) {
    return null;
  }

  return (
    <div data-testid="asset-status-pipeline">
      {/* Desktop: horizontal pipeline */}
      <div className="hidden sm:flex items-stretch gap-1">
        {PIPELINE_STAGES.map((stage, index) => {
          const count = statusCounts.get(stage.status) ?? 0;
          return (
            <div
              key={stage.status}
              className={cn("flex-1 rounded-lg px-3 py-3 text-center", stage.bgColor)}
              data-testid={`pipeline-stage-${stage.status}`}
            >
              <div className={cn("text-2xl font-bold tabular-nums", stage.color)}>{count}</div>
              <div className={cn("text-xs font-medium mt-0.5", stage.color)}>{stage.label}</div>
              {index < PIPELINE_STAGES.length - 1 && <span className="sr-only">then</span>}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-1 sm:hidden">
        {PIPELINE_STAGES.map((stage) => {
          const count = statusCounts.get(stage.status) ?? 0;
          return (
            <div
              key={stage.status}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-2.5",
                stage.bgColor,
              )}
              data-testid={`pipeline-stage-mobile-${stage.status}`}
            >
              <span className={cn("text-sm font-medium", stage.color)}>{stage.label}</span>
              <span className={cn("text-lg font-bold tabular-nums", stage.color)}>{count}</span>
            </div>
          );
        })}
      </div>

      {stats.totalEstimatedValue > 0 && (
        <p className="mt-2 text-sm text-muted-foreground text-right">
          Total estimated value:{" "}
          <span className="font-medium text-foreground">
            ${stats.totalEstimatedValue.toLocaleString()}
          </span>
        </p>
      )}
    </div>
  );
}
