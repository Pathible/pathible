"use client";

import { ProfileSettingsContent } from "@/app/(auth)/(dashboard)/profile-settings/components/profile-settings-content";
import { SubscriptionDebug } from "@/components/subscription-debug";

export default function ProfileSettingsPage() {
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
      <ProfileSettingsContent />
      {/* Debug component - remove before production */}
      <SubscriptionDebug />
    </div>
  );
}
