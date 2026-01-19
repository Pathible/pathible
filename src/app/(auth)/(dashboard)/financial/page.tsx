"use client";

import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { FinancialContent } from "@/app/(auth)/(dashboard)/financial/components/financial-content";
import { FeatureGate } from "@/components/feature-gate";
import { FEATURES } from "@/lib/feature-access";

function FinancialPageLoader() {
  return (
    <div className="flex justify-center items-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function FinancialPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <FeatureGate feature={FEATURES.FINANCIAL_OVERVIEW}>
        <Suspense fallback={<FinancialPageLoader />}>
          <FinancialContent />
        </Suspense>
      </FeatureGate>
    </div>
  );
}
