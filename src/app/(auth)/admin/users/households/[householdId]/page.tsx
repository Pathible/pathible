"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
import { formatActionType } from "@/app/(auth)/admin/components/admin-utils";
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
import { formatDateLong } from "@/lib/date-utils";
import { EstateAdminCard } from "../../components/estate-admin-card";
import { TierOverrideCard } from "../../components/tier-override-card";

export default function HouseholdDetailPage() {
  const params = useParams();
  const householdId = params.householdId as Id<"households">;

  const household = useQuery(api.admin.users.getHousehold, { householdId });

  const formatBytes = (bytes: number | undefined) => {
    if (!bytes) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const getRoleBadge = (role: string) => {
    return <Badge variant="outline">{role}</Badge>;
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
          <AdminStatusBadge type="tier" value={household.household.subscriptionTier} />
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
              <p className="font-medium">{formatDateLong(household.household._creationTime)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDateLong(household.household.updatedAt)}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold mb-4">Subscription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Current Tier{" "}
                  {household.household.tierOverride && (
                    <Badge variant="outline" className="text-xs">
                      Overriden
                    </Badge>
                  )}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <AdminStatusBadge type="tier" value={household.household.subscriptionTier} />
                  {household.household.tierOverride && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <AdminStatusBadge type="tier" value={household.household.tierOverride} />
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscription Status</p>
                <div className="mt-1">
                  <AdminStatusBadge
                    type="subscriptionStatus"
                    value={household.household.subscriptionStatus}
                  />
                </div>
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

      {/* Estate Administration */}
      <EstateAdminCard
        householdId={household.household._id}
        estateMode={household.household.estateMode}
        executorPurchased={household.household.executorPurchased}
        executorPurchasedAt={household.household.executorPurchasedAt}
        activation={household.activation}
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
                    <TableCell>
                      <AdminStatusBadge type="memberStatus" value={member.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateLong(member.joinedAt)}
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
                    {formatDateLong(activity._creationTime)}
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
