"use client";

import { useQuery } from "convex/react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Eye,
  FileText,
  Home,
  Key,
  Loader2,
  Mail,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { formatTimeAgo } from "@/lib/date-utils";
import { AdminPageHeader } from "./admin-page-header";
import { formatActionType } from "./admin-utils";

function getActionIcon(actionType: string): string {
  if (actionType.startsWith("document_")) return "file";
  if (actionType.startsWith("wisdom_")) return "book";
  if (actionType.startsWith("household_") || actionType.startsWith("member_")) return "home";
  if (actionType.startsWith("family_")) return "users";
  if (actionType.startsWith("asset_") || actionType.startsWith("policy_")) return "dollar";
  if (actionType.startsWith("plan_") || actionType.startsWith("letter_")) return "key";
  return "activity";
}

function ActionDot({ actionType }: { actionType: string }) {
  const icon = getActionIcon(actionType);
  const colorMap: Record<string, string> = {
    file: "bg-pathible-forest/20 text-pathible-forest",
    book: "bg-secondary/20 text-secondary",
    home: "bg-accent/20 text-accent",
    users: "bg-primary/20 text-primary",
    dollar: "bg-pathible-gold/20 text-pathible-deep-gold",
    key: "bg-pathible-sage/20 text-pathible-sage",
    activity: "bg-muted text-muted-foreground",
  };
  return (
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${colorMap[icon]}`}
    >
      <Activity className="h-3.5 w-3.5" />
    </div>
  );
}

function RecentActivity() {
  const activity = useQuery(api.admin.getRecentActivity, { limit: 6 });

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="font-crimson text-xl">Recent Activity</CardTitle>
          </div>
          <Link
            href="/admin/activity"
            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <CardDescription>How families are using Pathible right now</CardDescription>
      </CardHeader>
      <CardContent>
        {activity === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activity.map((item) => (
              <div
                key={item._id}
                className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/30"
              >
                <ActionDot actionType={item.actionType} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {formatActionType(item.actionType)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.userName || "Unknown user"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground/70 shrink-0">
                  {formatTimeAgo(item._creationTime)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IncompleteLegacyPlans() {
  const plans = useQuery(api.admin.getIncompleteLegacyPlans, { limit: 5 });

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-accent/10 p-1.5">
            <Key className="h-4 w-4 text-accent" />
          </div>
          <CardTitle className="font-crimson text-xl">Plans In Progress</CardTitle>
        </div>
        <CardDescription>
          Families who could use encouragement to finish their legacy plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plans === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-8 w-8 text-primary/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-crimson">
              Every family has a complete plan
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold">
                    {plan.householdName || "Unknown household"}
                  </p>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      plan.completionPercentage < 25
                        ? "text-destructive"
                        : plan.completionPercentage < 75
                          ? "text-accent"
                          : "text-primary"
                    }`}
                  >
                    {plan.completionPercentage}%
                  </span>
                </div>
                <Progress value={plan.completionPercentage} className="h-1.5 mb-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{plan.userName || "Unknown"}</span>
                  <span>{formatTimeAgo(plan.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const TIER_CONFIG = [
  { key: "foundations", label: "Foundations", color: "bg-pathible-sage" },
  { key: "heritage", label: "Heritage", color: "bg-primary" },
  { key: "legacy", label: "Legacy", color: "bg-pathible-forest" },
  { key: "founders", label: "Founders", color: "bg-pathible-gold" },
] as const;

function SubscriptionBreakdown({
  tiers,
}: {
  tiers: {
    foundations: number;
    heritage: number;
    legacy: number;
    founders: number;
  };
}) {
  const total = tiers.foundations + tiers.heritage + tiers.legacy + tiers.founders;

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-pathible-gold/15 p-1.5">
            <TrendingUp className="h-4 w-4 text-pathible-deep-gold" />
          </div>
          <CardTitle className="font-crimson text-xl">Subscription Tiers</CardTitle>
        </div>
        <CardDescription>How households are distributed across plans</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stacked bar visualization */}
        {total > 0 && (
          <div className="flex h-3 rounded-full overflow-hidden mb-5 gap-0.5">
            {TIER_CONFIG.map(({ key, color }) => {
              const count = tiers[key];
              if (count === 0) return null;
              const pct = (count / total) * 100;
              return (
                <div
                  key={key}
                  className={`${color} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {TIER_CONFIG.map(({ key, label, color }) => {
            const count = tiers[key];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${color} shrink-0`} />
                <span className="text-sm flex-1">{label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                <span className="text-sm font-semibold tabular-nums w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total households</span>
            <span className="text-lg font-bold font-crimson">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const stats = useQuery(api.admin.getStats, {});
  const emailStats = useQuery(api.adminEmail.getQueueStats, {});
  const articles = useQuery(api.articles.listAll, {});

  const publishedArticles = articles?.filter((a) => a.status === "published").length ?? 0;
  const totalViews = articles?.reduce((sum, a) => sum + a.viewCount, 0) ?? 0;
  const emailsSent = emailStats?.sent ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="Helping families organize what matters most"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/admin/users"
          icon={Users}
          iconColor="text-primary"
          value={stats?.totalUsers ?? 0}
          title="Total Users"
          description="Families finding clarity"
          data-testid="users"
        />
        <StatCard
          href="/admin/users?tab=households"
          icon={Home}
          iconColor="text-accent"
          value={stats?.totalHouseholds ?? 0}
          title="Households"
          description="Homes being organized"
          data-testid="households"
        />
        <StatCard
          href="/admin/content"
          icon={BookOpen}
          iconColor="text-secondary"
          value={publishedArticles}
          title="Published Articles"
          description={articles ? `${articles.length} total articles` : undefined}
          data-testid="published-articles"
        />
        <StatCard
          href="/admin/content"
          icon={Eye}
          iconColor="text-pathible-forest"
          value={totalViews.toLocaleString()}
          title="Content Views"
          description="Total article reads"
          data-testid="content-views"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/admin/users"
          icon={Key}
          iconColor="text-pathible-deep-gold"
          value={stats?.totalLegacyPlans ?? 0}
          title="Legacy Plans"
          description="Plans giving families peace"
          data-testid="legacy"
        />
        <StatCard
          icon={FileText}
          iconColor="text-muted-foreground"
          value={stats?.totalContent ?? 0}
          title="User Content"
          description={
            stats ? `${stats.wisdomEntries} wisdom, ${stats.vaultDocuments} vault` : undefined
          }
          data-testid="content"
        />
        <StatCard
          href="/admin/email"
          icon={Mail}
          iconColor="text-primary"
          value={emailsSent}
          title="Emails Sent"
          description={
            emailStats ? `${emailStats.queued} queued, ${emailStats.failed} failed` : undefined
          }
          data-testid="emails-sent"
        />
        <StatCard
          href="/admin/email"
          icon={Mail}
          iconColor="text-accent"
          value={emailStats?.queued ?? 0}
          title="Email Queue"
          description={emailStats?.processing ? `${emailStats.processing} processing` : "All clear"}
          data-testid="email-queue"
        />
      </div>

      {/* Main Content: Activity + Plans side by side */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentActivity />
        </div>
        <div className="lg:col-span-2 space-y-6">
          {stats && <SubscriptionBreakdown tiers={stats.subscriptionsByTier} />}
          <IncompleteLegacyPlans />
        </div>
      </div>
    </div>
  );
}
