"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  BookOpen,
  FileText,
  Lightbulb,
  Loader2,
  Scale,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { QuickActionCard } from "@/app/(auth)/(dashboard)/dashboard/components/quick-action-card";
import { TipCard } from "@/app/(auth)/(dashboard)/dashboard/components/tip-card";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useEstateMode } from "@/hooks/use-estate-mode";
import {
  FEATURE_SLUGS,
  useEffectiveFeatureAccess,
  useEffectiveTierAccess,
} from "@/lib/feature-access";

export function DashboardContent() {
  const { user, isLoaded: isUserLoaded } = useUser();

  // Check feature access for tier-gated sections
  const { hasAccess: hasWisdomAccess, isLoading: wisdomAccessLoading } = useEffectiveFeatureAccess(
    FEATURE_SLUGS.WISDOM_ENTRIES,
  );
  const { hasAccess: hasLegacyAccess, isLoading: legacyAccessLoading } =
    useEffectiveTierAccess("legacy");

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  const householdId = households?.[0]?._id;

  // Get vault stats (available to all tiers)
  const vaultStats = useQuery(api.vault.getStats, householdId ? { householdId } : "skip");

  // Get financial stats (available to all tiers - financial_overview is foundations)
  const financialStats = useQuery(api.financial.getStats, householdId ? { householdId } : "skip");

  // Get wisdom stats only if user has access (Heritage+)
  const wisdomStats = useQuery(
    api.wisdom.getStats,
    householdId && hasWisdomAccess ? { householdId } : "skip",
  );
  const coreBeliefsData = useQuery(
    api.coreBeliefs.list,
    householdId && hasWisdomAccess ? { householdId } : "skip",
  );

  // Get legacy plan stats only if user has access (Legacy+)
  const legacyStats = useQuery(
    api.legacy.getStats,
    householdId && hasLegacyAccess ? { householdId } : "skip",
  );

  // Stats with real data
  const wisdomEntriesCount = wisdomStats?.totalEntries ?? 0;
  const coreBeliefsCount = coreBeliefsData?.beliefs?.length ?? 0;
  const netWorth =
    (financialStats?.totalAccountBalance ?? 0) + (financialStats?.totalPropertyValue ?? 0);

  const stats = {
    vaultItemsCount: vaultStats?.totalDocuments ?? 0,
    netWorth,
    wisdomEntriesCount: wisdomEntriesCount + coreBeliefsCount,
    legacyPlanCompletion: legacyStats?.completionPercentage ?? 0,
  };

  // Check if profile already exists
  const profile = useQuery(api.profiles.get, isUserLoaded && user ? {} : "skip");

  // Estate mode check for ExecutorRoleCard
  const { isEstateMode, isExecutor } = useEstateMode();

  // Build quick actions based on user progress (cap at 4)
  const getQuickActions = () => {
    const actions: {
      title: string;
      description: string;
      route: string;
      icon: typeof Shield;
      ctaLabel: string;
    }[] = [];

    if (stats.vaultItemsCount === 0) {
      actions.push({
        title: "Heritage Vault",
        description: "Upload your most important documents so your family can find them someday",
        route: "/vault",
        icon: Shield,
        ctaLabel: "Upload first document",
      });
    } else if (stats.vaultItemsCount < 5) {
      actions.push({
        title: "Heritage Vault",
        description: "You have a good start -- keep adding documents your family will need",
        route: "/vault",
        icon: Shield,
        ctaLabel: "Add more documents",
      });
    }

    if (stats.netWorth === 0) {
      actions.push({
        title: "Financial Clarity",
        description: "Help your family understand what you have and where it is",
        route: "/financial",
        icon: TrendingUp,
        ctaLabel: "Add account",
      });
    }

    if (hasWisdomAccess && stats.wisdomEntriesCount === 0) {
      actions.push({
        title: "Wisdom & Stories",
        description: "Pass down what matters most to those who matter most",
        route: "/wisdom/create-entry",
        icon: Sparkles,
        ctaLabel: "Start writing",
      });
    }

    if (hasLegacyAccess && stats.legacyPlanCompletion < 50) {
      actions.push({
        title: "Legacy Plan",
        description: "Give your family clarity, not confusion",
        route: "/legacy",
        icon: FileText,
        ctaLabel:
          stats.legacyPlanCompletion > 0
            ? `${stats.legacyPlanCompletion}% complete`
            : "Start planning",
      });
    }

    // Fallback if nothing else
    if (actions.length === 0) {
      actions.push({
        title: "Your Family",
        description: "Make sure the right people have access when it matters",
        route: "/family",
        icon: Users,
        ctaLabel: "View family",
      });
    }

    return actions.slice(0, 4);
  };

  // Build contextual tips based on empty areas (cap at 3)
  const getContextualTips = () => {
    const tips: {
      text: string;
      icon: typeof Lightbulb;
      route?: string;
      linkText?: string;
    }[] = [];

    if (stats.vaultItemsCount === 0) {
      tips.push({
        text: "Start with your most important document -- a will, trust, or insurance policy.",
        icon: Lightbulb,
        route: "/vault",
        linkText: "Go to Vault",
      });
    }

    if (stats.netWorth === 0) {
      tips.push({
        text: "Even a simple list of accounts helps your family avoid months of searching.",
        icon: Lightbulb,
        route: "/financial",
        linkText: "Add accounts",
      });
    }

    if (hasWisdomAccess && stats.wisdomEntriesCount === 0) {
      tips.push({
        text: "What's one piece of advice you'd want your grandchildren to know?",
        icon: Lightbulb,
        route: "/wisdom/create-entry",
        linkText: "Write it down",
      });
    }

    if (tips.length === 0) {
      tips.push({
        text: "You're doing great. Keep your information up to date as things change.",
        icon: Lightbulb,
      });
    }

    return tips.slice(0, 3);
  };

  // Loading state - wait for access checks and data before rendering
  const isAccessLoading = wisdomAccessLoading || legacyAccessLoading;
  const isLoadingHouseholdData =
    householdId &&
    (vaultStats === undefined ||
      financialStats === undefined ||
      // Only wait for wisdom stats if user has access
      (hasWisdomAccess && (wisdomStats === undefined || coreBeliefsData === undefined)) ||
      // Only wait for legacy stats if user has access
      (hasLegacyAccess && legacyStats === undefined));

  if (!isUserLoaded || households === undefined || isAccessLoading || isLoadingHouseholdData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const quickActions = getQuickActions();
  const tips = getContextualTips();

  // Count visible stat cards for dynamic grid (Vault + Financial always visible)
  const visibleCardCount = 2 + (hasWisdomAccess ? 1 : 0) + (hasLegacyAccess ? 1 : 0);

  return (
    <>
      {/* Compact greeting */}
      <h2 className="text-4xl font-bold mb-6">Welcome back, {profile?.firstName}!</h2>

      {/* Executor Role Card - shown when user is executor but estate mode is not active */}
      {isExecutor && !isEstateMode && <ExecutorRoleCard />}

      {/* Stats */}
      <div
        className={`grid grid-cols-1 gap-4 mb-8 ${
          visibleCardCount <= 2
            ? "sm:grid-cols-2"
            : visibleCardCount === 3
              ? "sm:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
        data-testid="dashboard-stats"
        data-tour="dashboard-stats"
      >
        <StatCard
          href="/vault"
          icon={Shield}
          iconColor="text-primary"
          value={stats.vaultItemsCount}
          title="Heritage Vault"
          description="Safe for your family"
          data-testid="shield"
        />
        <StatCard
          href="/financial"
          icon={TrendingUp}
          iconColor="text-accent"
          value={stats.netWorth > 0 ? `$${stats.netWorth.toLocaleString()}` : "\u2014"}
          title="Financial Clarity"
          description="Your family's financial picture"
          data-testid="trendingUp"
        />
        {hasWisdomAccess && (
          <StatCard
            href="/wisdom"
            icon={BookOpen}
            iconColor="text-secondary"
            value={stats.wisdomEntriesCount}
            title="Wisdom & Stories"
            description="Passed down for generations"
            data-testid="bookOpen"
          />
        )}
        {hasLegacyAccess && (
          <StatCard
            href="/legacy"
            icon={FileText}
            iconColor="text-muted-foreground"
            value={`${stats.legacyPlanCompletion}%`}
            title="Legacy Plan"
            description="Your story, your intentions"
            progressValue={stats.legacyPlanCompletion}
            data-testid="fileText"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div data-tour="quick-actions">
        <h3 className="text-lg font-semibold mb-3">Get Started</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.route}
              title={action.title}
              description={action.description}
              route={action.route}
              icon={action.icon}
              ctaLabel={action.ctaLabel}
            />
          ))}
        </div>
      </div>

      {/* Contextual Tips */}
      <div data-tour="dashboard-tips">
        <h3 className="text-lg font-semibold mb-3">Tips for You</h3>
        <div className="space-y-3">
          {tips.map((tip) => (
            <TipCard
              key={tip.text}
              text={tip.text}
              icon={tip.icon}
              route={tip.route}
              linkText={tip.linkText}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ExecutorRoleCard() {
  return (
    <Card className="mb-8 border-primary/20 bg-primary/5" data-testid="executor-role-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Scale className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Executor Designation</CardTitle>
        </div>
        <CardDescription>
          You have been designated as executor for this household. When the time comes, you can
          begin estate administration to help manage and organize everything that needs attention.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" data-testid="activate-estate-cta">
          <Link href="/estate/activate">Learn More</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
