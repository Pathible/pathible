"use client";

import { AlertTriangle, Scale } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEstateMode } from "@/hooks/use-estate-mode";
import { cn } from "@/lib/utils";

/**
 * Persistent banner shown on ALL pages when estate mode is active.
 *
 * On planning pages: "This household is being cared for by [Executor Name]..."
 * On estate pages: status + days since activation
 */
export function EstateStatusBanner() {
  const { isEstateMode, executorName, isExecutor, isLoading } = useEstateMode();
  const pathname = usePathname();

  if (isLoading || !isEstateMode) {
    return null;
  }

  const isEstatePage = pathname.startsWith("/estate");

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm border-b",
        isEstatePage
          ? "bg-primary/10 border-primary/20 text-foreground"
          : "bg-amber-50 border-amber-200 text-amber-900",
      )}
      data-testid={isEstatePage ? "estate-status-banner" : "estate-readonly-banner"}
    >
      {isEstatePage ? (
        <Scale className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      )}
      <p className="flex-1">
        {isEstatePage ? (
          <>
            Estate administration is active.
            {isExecutor
              ? " You are managing this estate."
              : executorName
                ? ` Managed by ${executorName}.`
                : ""}
          </>
        ) : (
          <>
            This household is being cared for
            {executorName ? ` by ${executorName}` : ""} during estate administration. Planning
            features are view-only.
          </>
        )}
      </p>
      {!isEstatePage && (
        <Link
          href="/estate"
          className="shrink-0 text-sm font-medium text-primary hover:underline"
          data-testid="estate-banner-link"
        >
          View Estate
        </Link>
      )}
    </div>
  );
}
