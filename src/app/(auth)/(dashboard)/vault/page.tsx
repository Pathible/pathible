"use client";

import { VaultContent } from "@/app/(auth)/(dashboard)/vault/components/vault-content";
import { FeatureGate } from "@/components/feature-gate";
import { FEATURES } from "@/lib/feature-access";

export default function VaultPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <FeatureGate feature={FEATURES.VAULT_DOCUMENT_STORAGE}>
        <VaultContent />
      </FeatureGate>
    </div>
  );
}
