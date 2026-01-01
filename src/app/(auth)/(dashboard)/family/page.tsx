"use client";

import { FeatureGate } from "@/components/feature-gate";
import { FEATURES } from "@/lib/feature-access";
import { FamilyEcosystemContent } from "./components/family-ecosystem-content";

export default function FamilyPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <FeatureGate feature={FEATURES.FAMILY_MEMBERS}>
        <FamilyEcosystemContent />
      </FeatureGate>
    </div>
  );
}
