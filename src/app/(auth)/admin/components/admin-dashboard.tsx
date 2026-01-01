"use client";

import { useQuery } from "convex/react";
import { Activity, FileText, Home, Key, Loader2, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ title, value, subtitle, icon, isLoading }: StatCardProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-crimson text-3xl font-semibold">{value}</p>
            )}
            {subtitle && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatActionType(actionType: string): string {
  const actionLabels: Record<string, string> = {
    document_uploaded: "Document uploaded",
    document_viewed: "Document viewed",
    document_updated: "Document updated",
    document_deleted: "Document deleted",
    wisdom_created: "Wisdom entry created",
    wisdom_updated: "Wisdom entry updated",
    wisdom_deleted: "Wisdom entry deleted",
    letter_created: "Letter created",
    household_created: "Household created",
    household_updated: "Household updated",
    member_invited: "Member invited",
    member_joined: "Member joined",
    member_removed: "Member removed",
    member_role_updated: "Member role updated",
    plan_updated: "Legacy plan updated",
    asset_created: "Financial asset added",
    asset_updated: "Financial asset updated",
    asset_deleted: "Financial asset deleted",
    policy_created: "Insurance policy added",
    policy_updated: "Insurance policy updated",
    policy_deleted: "Insurance policy deleted",
    category_created: "Category created",
    category_updated: "Category updated",
    category_deleted: "Category deleted",
    family_unit_created: "Family unit created",
    family_unit_updated: "Family unit updated",
    family_unit_deleted: "Family unit deleted",
    family_member_created: "Family member added",
    family_member_updated: "Family member updated",
    family_member_deleted: "Family member removed",
    suggestion_completed: "Suggestion completed",
    other: "Activity",
  };
  return actionLabels[actionType] || actionType.replace(/_/g, " ");
}

function RecentActivity() {
  const activity = useQuery(api.admin.getRecentActivity, { limit: 5 });

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="font-crimson text-xl">Recent Activity</CardTitle>
        </div>
        <CardDescription>Latest user actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {activity === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activity.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No activity recorded yet</p>
        ) : (
          <div className="space-y-4">
            {activity.map((item) => (
              <div
                key={item._id}
                className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{formatActionType(item.actionType)}</p>
                  <p className="text-sm text-muted-foreground">{item.userName || "Unknown user"}</p>
                </div>
                <span className="text-sm text-muted-foreground">
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

  const getCompletionStyles = (percentage: number) => {
    if (percentage < 25) return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900";
    if (percentage < 75)
      return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900";
    return "bg-primary/5 border-primary/20";
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <CardTitle className="font-crimson text-xl">Legacy Plans In Progress</CardTitle>
        </div>
        <CardDescription>Users who may need encouragement to complete their plans</CardDescription>
      </CardHeader>
      <CardContent>
        {plans === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">All legacy plans are complete!</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`rounded-lg border p-4 ${getCompletionStyles(plan.completionPercentage)}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{plan.householdName || "Unknown household"}</p>
                  <span className="text-sm font-medium">{plan.completionPercentage}%</span>
                </div>
                <p className="text-sm text-muted-foreground">By: {plan.userName || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  Updated: {formatTimeAgo(plan.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubscriptionBreakdown({
  tiers,
}: {
  tiers: { foundations: number; heritage: number; legacy: number; founders: number };
}) {
  const total = tiers.foundations + tiers.heritage + tiers.legacy + tiers.founders;

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="font-crimson text-xl">Subscription Tiers</CardTitle>
        </div>
        <CardDescription>Distribution of households by plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Foundations</span>
            <span className="font-medium">{tiers.foundations}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Heritage</span>
            <span className="font-medium">{tiers.heritage}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Legacy</span>
            <span className="font-medium">{tiers.legacy}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary font-medium">Founders</span>
            <span className="font-medium text-primary">{tiers.founders}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total</span>
              <span className="font-bold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const stats = useQuery(api.admin.getStats, {});

  const isLoading = stats === undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-crimson text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform activity and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Households"
          value={stats?.totalHouseholds ?? 0}
          icon={<Home className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Content Items"
          value={stats?.totalContent ?? 0}
          subtitle={
            stats ? `${stats.wisdomEntries} wisdom, ${stats.vaultDocuments} documents` : undefined
          }
          icon={<FileText className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Legacy Plans"
          value={stats?.totalLegacyPlans ?? 0}
          icon={<Key className="h-5 w-5" />}
          isLoading={isLoading}
        />
      </div>

      {/* Activity and Requests Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <IncompleteLegacyPlans />
      </div>

      {/* Subscription Breakdown */}
      {stats && (
        <div className="grid gap-6 lg:grid-cols-3">
          <SubscriptionBreakdown tiers={stats.subscriptionsByTier} />
        </div>
      )}
    </div>
  );
}
