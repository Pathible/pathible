"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TierOverrideCard } from "../../components/tier-override-card";

export default function HouseholdDetailPage() {
  const params = useParams();
  const householdId = params.householdId as Id<"households">;

  const household = useQuery(api.admin.users.getHousehold, { householdId });

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatBytes = (bytes: number | undefined) => {
    if (!bytes) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const getTierBadge = (tier: string) => {
    const styles = {
      foundations: "bg-pathible-forest/10 text-pathible-forest border-pathible-forest/20",
      heritage: "bg-pathible-sage/20 text-pathible-sage border-pathible-sage/30",
      legacy: "bg-pathible-gold/20 text-pathible-gold border-pathible-gold/30",
      founders: "bg-primary text-primary-foreground border-primary",
    };
    return <Badge className={styles[tier as keyof typeof styles] || ""}>{tier}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-primary/10 text-primary border-primary/20",
      inactive: "bg-muted text-muted-foreground border-muted",
      cancelled: "bg-destructive/10 text-destructive border-destructive/20",
      past_due: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
    };
    return <Badge className={styles[status as keyof typeof styles] || ""}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return <Badge variant="outline">{role}</Badge>;
  };

  const getMemberStatusBadge = (status: string) => {
    const styles = {
      active: "bg-primary/10 text-primary border-primary/20",
      pending: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
      inactive: "bg-muted text-muted-foreground border-muted",
    };
    return <Badge className={styles[status as keyof typeof styles] || ""}>{status}</Badge>;
  };

  const formatActionType = (actionType: string): string => {
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
  };

  if (household === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (household === null) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Households
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Household not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Households
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-crimson text-3xl font-semibold">{household.household.name}</h1>
          {getTierBadge(household.household.subscriptionTier)}
        </div>
      </div>

      {/* Household Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-crimson text-xl">Household Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Household Name</p>
              <p className="font-medium">{household.household.name}</p>
            </div>
            {household.household.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{household.household.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Primary Contact</p>
              <p className="font-medium">
                <Link
                  href={`/admin/users/${household.household.primaryContactId}`}
                  className="text-primary hover:underline"
                >
                  {household.household.primaryContactName}
                </Link>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(household.household._creationTime)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDate(household.household.updatedAt)}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold mb-4">Subscription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Tier</p>
                <div className="mt-1">{getTierBadge(household.household.subscriptionTier)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscription Status</p>
                <div className="mt-1">{getStatusBadge(household.household.subscriptionStatus)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="font-medium">{formatBytes(household.household.storageUsedBytes)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Document Count</p>
                <p className="font-medium">{household.household.vaultDocumentCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Family Units</p>
                <p className="font-medium">{household.household.familyUnitCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-medium">{household.household.memberCount || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Override */}
      <TierOverrideCard
        householdId={household.household._id}
        currentTier={household.household.subscriptionTier}
        tierOverride={household.household.tierOverride}
        tierOverrideExpiresAt={household.household.tierOverrideExpiresAt}
        tierOverrideReason={household.household.tierOverrideReason}
      />

      {/* Household Members */}
      <Card>
        <CardHeader>
          <CardTitle className="font-crimson text-xl">Members</CardTitle>
          <CardDescription>Users with access to this household</CardDescription>
        </CardHeader>
        <CardContent>
          {household.members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No members in this household</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {household.members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/users/${member.profileId}`}
                        className="hover:underline text-primary"
                      >
                        {member.firstName} {member.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>{getMemberStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(member.joinedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-crimson text-xl">Recent Activity</CardTitle>
          <CardDescription>Latest actions in this household</CardDescription>
        </CardHeader>
        <CardContent>
          {household.recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {household.recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{formatActionType(activity.actionType)}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.userName ? `By ${activity.userName}` : activity.description}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(activity._creationTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
