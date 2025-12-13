"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { ContactInformationCard } from "./contact-information-card";
import { DangerZoneCard } from "./danger-zone-card";
import { PersonalInformationCard } from "./personal-information-card";
import { SubscriptionCard } from "./subscription-card";

export function ProfileSettingsContent() {
  // Check Clerk session status
  const { user, isLoaded: isUserLoaded } = useUser();

  // Load profile data
  const profile = useQuery(api.profiles.get, isUserLoaded && user ? {} : "skip");

  // Loading state
  if (!isUserLoaded || profile === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please sign in to access your profile settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please complete your onboarding to set up your profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-primary/10">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* Settings Cards */}
      <PersonalInformationCard
        profile={profile}
        email={user.emailAddresses[0]?.emailAddress ?? ""}
      />

      <ContactInformationCard profile={profile} />

      <SubscriptionCard />

      <DangerZoneCard profileName={`${profile.firstName} ${profile.lastName}`} />
    </div>
  );
}
