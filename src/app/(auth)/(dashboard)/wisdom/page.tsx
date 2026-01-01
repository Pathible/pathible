"use client";

import { WisdomHubContent } from "@/app/(auth)/(dashboard)/wisdom/components/wisdom-hub-content";
import { FeatureGate } from "@/components/feature-gate";
import { FEATURES } from "@/lib/feature-access";

export default function WisdomPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <FeatureGate feature={FEATURES.WISDOM_ENTRIES}>
        <WisdomHubContent />
      </FeatureGate>
    </div>
  );
}
