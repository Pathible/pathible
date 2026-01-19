"use client";

import { usePaginatedQuery } from "convex/react";
import { AlertCircle, CheckCircle2, Clock, Loader2, Mail, RefreshCw, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCampaignType(type: string): string {
  switch (type) {
    case "weekly_vault_empty":
      return "Vault Empty";
    case "weekly_digest":
      return "Weekly Digest";
    case "admin_broadcast":
      return "Admin Broadcast";
    default:
      return type;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "sending":
      return (
        <Badge variant="default" className="gap-1 bg-blue-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sending
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "weekly_vault_empty":
      return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
    case "weekly_digest":
      return <Mail className="h-4 w-4 text-muted-foreground" />;
    case "admin_broadcast":
      return <Send className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Mail className="h-4 w-4 text-muted-foreground" />;
  }
}

export function CampaignsList() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.adminEmail.listCampaigns,
    {},
    { initialNumItems: 20 },
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No campaigns yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Email campaigns will appear here when automated or broadcast emails are sent.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Recipients</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((campaign) => (
              <TableRow key={campaign._id}>
                <TableCell className="font-mono text-sm">{campaign.campaignId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(campaign.type)}
                    <span className="text-sm">{formatCampaignType(campaign.type)}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                <TableCell className="text-right font-medium">{campaign.totalRecipients}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  {campaign.sentCount}
                </TableCell>
                <TableCell className="text-right text-red-600 font-medium">
                  {campaign.failedCount > 0 ? campaign.failedCount : "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(campaign.startedAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {campaign.completedAt ? formatDate(campaign.completedAt) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => loadMore(20)}>
            Load More
          </Button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
