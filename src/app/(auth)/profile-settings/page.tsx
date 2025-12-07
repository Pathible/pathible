import { ProfileSettingsContent } from "@/app/(auth)/profile-settings/components/profile-settings-content";

export default async function ProfileSettingsPage() {
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <ProfileSettingsContent />
    </div>
  );
}
