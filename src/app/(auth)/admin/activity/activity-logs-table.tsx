"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Id } from "@/convex/_generated/dataModel";
import { ActivityTypeBadge } from "./activity-type-badge";

interface ActivityLog {
  _id: Id<"activityLog">;
  _creationTime: number;
  actionType: string;
  description: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  userId: Id<"profiles">;
  userName: string;
  householdId: Id<"households">;
  householdName?: string;
}

interface ActivityLogsTableProps {
  results: ActivityLog[];
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: (numItems: number) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatActionType(actionType: string): string {
  const actionLabels: Record<string, string> = {
    document_uploaded: "Document uploaded",
    document_viewed: "Document viewed",
    document_updated: "Document updated",
    document_deleted: "Document deleted",
    wisdom_created: "Wisdom created",
    wisdom_updated: "Wisdom updated",
    wisdom_deleted: "Wisdom deleted",
    letter_created: "Letter created",
    household_created: "Household created",
    household_updated: "Household updated",
    member_invited: "Member invited",
    member_joined: "Member joined",
    member_removed: "Member removed",
    member_role_updated: "Member role updated",
    plan_updated: "Plan updated",
    asset_created: "Asset created",
    asset_updated: "Asset updated",
    asset_deleted: "Asset deleted",
    policy_created: "Policy created",
    policy_updated: "Policy updated",
    policy_deleted: "Policy deleted",
    category_created: "Category created",
    category_updated: "Category updated",
    category_deleted: "Category deleted",
    family_unit_created: "Family unit created",
    family_unit_updated: "Family unit updated",
    family_unit_deleted: "Family unit deleted",
    family_member_created: "Family member created",
    family_member_updated: "Family member updated",
    family_member_deleted: "Family member deleted",
    suggestion_completed: "Suggestion completed",
    other: "Activity",
  };
  return actionLabels[actionType] || actionType.replace(/_/g, " ");
}

export function ActivityLogsTable({ results, status, loadMore }: ActivityLogsTableProps) {
  if (status === "LoadingFirstPage") {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No activity logs match your filters
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="max-w-[300px]">Details</TableHead>
              <TableHead className="w-[180px]">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  <ActivityTypeBadge actionType={log.actionType} />
                </TableCell>
                <TableCell className="font-medium">{formatActionType(log.actionType)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{log.userName}</span>
                    {log.householdName && (
                      <span className="text-xs text-muted-foreground">{log.householdName}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <div className="truncate" title={log.description}>
                    {log.description}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatTimestamp(log._creationTime)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Load More Button */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => loadMore(50)}>
            Load More
          </Button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Showing count */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {results.length} {results.length === 1 ? "entry" : "entries"}
      </div>
    </div>
  );
}
