"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, UserMinus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
import { formatActionType } from "@/app/(auth)/admin/components/admin-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function UserDetailPage() {
  const params = useParams();
  const profileId = params.profileId as Id<"profiles">;

  const user = useQuery(api.admin.users.getUser, { profileId });
  const deactivateUser = useMutation(api.admin.users.deactivateUser);
  const reactivateUser = useMutation(api.admin.users.reactivateUser);

  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeactivate = async () => {
    setIsProcessing(true);
    try {
      await deactivateUser({ profileId });
      setShowDeactivateDialog(false);
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      alert("Failed to deactivate user. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    setIsProcessing(true);
    try {
      await reactivateUser({ profileId });
      setShowReactivateDialog(false);
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      alert("Failed to reactivate user. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    return <Badge variant="outline">{role}</Badge>;
  };

  if (user === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = !user.profile.deletedAt;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-crimson text-3xl font-semibold">
            {user.profile.firstName} {user.profile.lastName}
          </h1>
          <AdminStatusBadge type="memberStatus" value={isActive ? "active" : "inactive"}>
            {isActive ? "active" : "inactive"}
          </AdminStatusBadge>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-crimson text-xl">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {user.profile.firstName} {user.profile.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.profile.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user.profile.phone}</p>
              </div>
            )}
            {user.profile.dateOfBirth && (
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formatDateLong(user.profile.dateOfBirth)}</p>
              </div>
            )}
            {user.profile.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{user.profile.address}</p>
              </div>
            )}
            {(user.profile.city || user.profile.state || user.profile.zipCode) && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {[user.profile.city, user.profile.state, user.profile.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{formatDateLong(user.profile._creationTime)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDateLong(user.profile.updatedAt)}</p>
            </div>
            {user.profile.onboardingStatus && (
              <div>
                <p className="text-sm text-muted-foreground">Onboarding Status</p>
                <p className="font-medium">{user.profile.onboardingStatus.replace(/_/g, " ")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Household Memberships */}
      <Card>
        <CardHeader>
          <CardTitle className="font-crimson text-xl">Household Memberships</CardTitle>
          <CardDescription>Households this user belongs to</CardDescription>
        </CardHeader>
        <CardContent>
          {user.householdMemberships.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              This user is not a member of any households
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Household</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.householdMemberships.map((membership) => (
                  <TableRow key={membership._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/users/households/${membership.householdId}`}
                        className="hover:underline text-primary"
                      >
                        {membership.householdName}
                      </Link>
                    </TableCell>
                    <TableCell>{getRoleBadge(membership.role)}</TableCell>
                    <TableCell>
                      <AdminStatusBadge type="memberStatus" value={membership.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateLong(membership.joinedAt)}
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
          <CardDescription>Latest actions by this user</CardDescription>
        </CardHeader>
        <CardContent>
          {user.recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {user.recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{formatActionType(activity.actionType)}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
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

      {/* Administrative Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-crimson text-xl">Administrative Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {isActive ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeactivateDialog(true)}
                disabled={isProcessing}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Deactivate Account
              </Button>
            ) : (
              <Button onClick={() => setShowReactivateDialog(true)} disabled={isProcessing}>
                <UserPlus className="h-4 w-4 mr-2" />
                Reactivate Account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {user.profile.firstName} {user.profile.lastName}
              &apos;s account? They will no longer be able to access Pathible. This action can be
              reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate {user.profile.firstName} {user.profile.lastName}
              &apos;s account? They will regain access to Pathible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivate} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reactivating...
                </>
              ) : (
                "Reactivate Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
