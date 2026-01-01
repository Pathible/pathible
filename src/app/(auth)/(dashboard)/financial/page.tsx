"use client";

import { FinancialContent } from "@/app/(auth)/(dashboard)/financial/components/financial-content";
import { FeatureGate } from "@/components/feature-gate";
import { FEATURES } from "@/lib/feature-access";

export default function FinancialPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <FeatureGate feature={FEATURES.FINANCIAL_OVERVIEW}>
        <FinancialContent />
      </FeatureGate>
    </div>
  );
}
