"use client";

import { cn } from "@/lib/utils";

interface ChecklistProgressProps {
  total: number;
  completed: number;
  className?: string;
}

/**
 * Circular progress indicator showing overall checklist completion.
 * Displays percentage in the center with a ring around it.
 */
export function ChecklistProgress({ total, completed, className }: ChecklistProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      data-testid="checklist-progress"
    >
      <div className="relative h-28 w-28">
        <svg
          className="h-28 w-28 -rotate-90"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`${percentage}% complete`}
        >
          <title>{`${percentage}% checklist progress`}</title>
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{percentage}%</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {completed} of {total} tasks complete
      </p>
    </div>
  );
}
