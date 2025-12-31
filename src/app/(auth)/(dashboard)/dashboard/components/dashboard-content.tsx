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
      "True legacy transcends material wealth—it's about values, wisdom, and faith passed down through generations.",
  };

  // Stats with real data
  const wisdomEntriesCount = wisdomStats?.totalEntries ?? 0;
  const coreBeliefsCount = coreBeliefsData?.beliefs?.length ?? 0;

  const stats = {
    vaultItemsCount: vaultStats?.totalDocuments ?? 0,
    wisdomEntriesCount: wisdomEntriesCount + coreBeliefsCount,
    legacyPlanCompletion: 0, // TODO: Connect to legacy plan query
  };

  // Get user's first name for greeting
  const userName = user?.firstName || "there";

  // Determine next step based on progress
  const getNextStep = () => {
    if (stats.wisdomEntriesCount === 0) {
      return {
        title: "Add your first Wisdom entry",
        description: "Share life lessons and values with future generations",
        route: "/wisdom/create-entry",
        icon: Sparkles,
      };
    } else if (stats.vaultItemsCount < 5) {
      return {
        title: "Secure important documents",
        description: "Upload essential documents to your Heritage Vault",
        route: "/vault",
        icon: Shield,
      };
    } else if (stats.legacyPlanCompletion < 50) {
      return {
        title: "Continue your Legacy Plan",
        description: "Complete your life story and wishes for loved ones",
        route: "/legacy",
        icon: FileText,
      };
    } else {
      return {
        title: "Review Family Ecosystem",
        description: "Update family member roles and permissions",
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
        <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}.</h1>
        <p className="text-muted-foreground text-lg">Here&apos;s your legacy journey at a glance</p>
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
          title="Heritage Vault Items"
          description="Documents secured and protected"
        />

        <DashboardStatCard
          href="/wisdom"
          icon="bookOpen"
          value={stats.wisdomEntriesCount}
          title="Wisdom Entries"
          description="Life lessons shared with family"
        />

        <DashboardStatCard
          href="/legacy"
          icon="fileText"
          value={`${stats.legacyPlanCompletion}%`}
          title="Legacy Plan"
          description="Your story and final wishes"
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
              <p className="text-sm font-medium text-primary mb-3">— {dailyQuote.reference}</p>
              <p className="text-muted-foreground">{dailyQuote.reflection}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
