"use client";

import { Activity, Loader2 } from "lucide-react";
import { formatActionType } from "@/app/(auth)/admin/components/admin-utils";
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
import { formatTimestamp } from "@/lib/date-utils";
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
      <div className="py-12 text-center">
        <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No activity logs match your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            <TableRow key={log._id} className="hover:bg-muted/30">
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
                <div className="truncate text-muted-foreground" title={log.description}>
                  {log.description}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground tabular-nums">
                {formatTimestamp(log._creationTime)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {status === "CanLoadMore" && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => loadMore(15)}>
            Load More
          </Button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">
        Showing {results.length} {results.length === 1 ? "entry" : "entries"}
      </div>
    </div>
  );
}
