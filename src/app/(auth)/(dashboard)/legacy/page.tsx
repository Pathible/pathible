"use client";

import { LegacyContent } from "@/app/(auth)/(dashboard)/legacy/components/legacy-content";
import { FeatureGate } from "@/components/feature-gate";
import { FEATURES } from "@/lib/feature-access";

export default function LegacyPlanningPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <FeatureGate feature={FEATURES.LEGACY_QUESTIONNAIRES}>
        <LegacyContent />
      </FeatureGate>
    </div>
  );
}
