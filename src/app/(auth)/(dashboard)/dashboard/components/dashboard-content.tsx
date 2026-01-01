"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowRight, FileText, Heart, Loader2, Shield, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { DashboardStatCard } from "@/app/(auth)/(dashboard)/dashboard/components/dashboard-stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

export function DashboardContent() {
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  const householdId = households?.[0]?._id;

  // Get vault stats
  const vaultStats = useQuery(api.vault.getStats, householdId ? { householdId } : "skip");

  // Get wisdom stats (entries + core beliefs)
  const wisdomStats = useQuery(api.wisdom.getStats, householdId ? { householdId } : "skip");
  const coreBeliefsData = useQuery(api.coreBeliefs.list, householdId ? { householdId } : "skip");

  // Daily devotional/quote
  const dailyQuote = {
    text: "A good person leaves an inheritance for their children's children, but a sinner's wealth is stored up for the righteous.",
    reference: "Proverbs 13:22",
    reflection:
      "The best things we leave behind can't be measured. They can only be felt by those who receive them.",
  };

  // Stats with real data
  const wisdomEntriesCount = wisdomStats?.totalEntries ?? 0;
  const coreBeliefsCount = coreBeliefsData?.beliefs?.length ?? 0;

  const stats = {
    vaultItemsCount: vaultStats?.totalDocuments ?? 0,
    wisdomEntriesCount: wisdomEntriesCount + coreBeliefsCount,
    legacyPlanCompletion: 0, // TODO: Connect to legacy plan query
  };

  // Check if profile already exists
  const profile = useQuery(api.profiles.get, isUserLoaded && user ? {} : "skip");

  // Determine next step based on progress
  const getNextStep = () => {
    if (stats.wisdomEntriesCount === 0) {
      return {
        title: "Share your first piece of wisdom",
        description: "Pass down what matters most to those who matter most",
        route: "/wisdom/create-entry",
        icon: Sparkles,
      };
    } else if (stats.vaultItemsCount < 5) {
      return {
        title: "Organize important documents",
        description: "Add the documents your family will need someday",
        route: "/vault",
        icon: Shield,
      };
    } else if (stats.legacyPlanCompletion < 50) {
      return {
        title: "Continue your Legacy Plan",
        description: "Give your family clarity, not confusion",
        route: "/legacy",
        icon: FileText,
      };
    } else {
      return {
        title: "Check on your family",
        description: "Make sure the right people have access when it matters",
        route: "/family",
        icon: Users,
      };
    }
  };

  const nextStep = getNextStep();
  const NextStepIcon = nextStep.icon;

  // Loading state
  if (!isUserLoaded || households === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.firstName}!</h1>
        <p className="text-muted-foreground text-lg">Here&apos;s how your legacy is taking shape</p>
      </div>

      {/* Progress Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        data-testid="dashboard-stats"
        data-tour="dashboard-stats"
      >
        <DashboardStatCard
          href="/vault"
          icon="shield"
          value={stats.vaultItemsCount}
          title="Heritage Vault"
          description="Safe and ready for your family someday"
        />

        <DashboardStatCard
          href="/wisdom"
          icon="bookOpen"
          value={stats.wisdomEntriesCount}
          title="Wisdom & Stories"
          description="Passed down to future generations"
        />

        <DashboardStatCard
          href="/legacy"
          icon="fileText"
          value={`${stats.legacyPlanCompletion}%`}
          title="Legacy Plan"
          description="Your story, your heart, your intentions"
        />
      </div>

      {/* Next Step CTA */}
      <Link href={nextStep.route} className="block mb-8" data-tour="next-step-cta">
        <Card className="bg-primary/5 border-primary/20 cursor-pointer hover:shadow-lg transition-all hover:bg-primary/10">
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <NextStepIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold">Next Step</h3>
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <p className="text-lg font-medium text-foreground mb-1">{nextStep.title}</p>
                <p className="text-muted-foreground">{nextStep.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Daily Devotional/Quote */}
      <Card className="mb-8 border-l-4 border-l-primary" data-tour="daily-reflection">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Daily Reflection</h3>
              <blockquote className="text-lg italic text-foreground mb-2">
                &quot;{dailyQuote.text}&quot;
              </blockquote>
              <p className="text-sm font-medium text-primary mb-3">- {dailyQuote.reference}</p>
              <p className="text-muted-foreground">{dailyQuote.reflection}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
