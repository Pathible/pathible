"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Signed In</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Sign in to view and update your profile.
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
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Set Up</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Complete your profile to get started with Pathible.
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
          <p className="text-muted-foreground text-lg">Your account details and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <PersonalInformationCard
            profile={profile}
            email={user.emailAddresses[0]?.emailAddress ?? ""}
          />
          <ContactInformationCard profile={profile} />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionCard />
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <DangerZoneCard profileName={`${profile.firstName} ${profile.lastName}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
