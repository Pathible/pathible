"use client";

import { usePaginatedQuery } from "convex/react";
import { AlertCircle, CheckCircle2, Clock, Loader2, Mail, RefreshCw, Send } from "lucide-react";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
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
import { formatDateTime } from "@/lib/date-utils";

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

const CAMPAIGN_STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  sending: <Loader2 className="h-3 w-3 animate-spin" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  failed: <AlertCircle className="h-3 w-3" />,
};

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
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <h3 className="font-crimson text-lg font-medium">No campaigns yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Campaigns will appear here when automated or broadcast emails are sent.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-accent/10 p-1.5">
            <Mail className="h-4 w-4 text-accent" />
          </div>
          <CardTitle className="font-crimson text-xl">Campaigns</CardTitle>
        </div>
        <CardDescription>Automated and broadcast email campaigns</CardDescription>
      </CardHeader>
      <CardContent>
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
              <TableRow key={campaign._id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">{campaign.campaignId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(campaign.type)}
                    <span className="text-sm">{formatCampaignType(campaign.type)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <AdminStatusBadge type="campaignStatus" value={campaign.status} className="gap-1">
                    {CAMPAIGN_STATUS_ICONS[campaign.status]}
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </AdminStatusBadge>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {campaign.totalRecipients}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-primary">
                  {campaign.sentCount}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-destructive">
                  {campaign.failedCount > 0 ? campaign.failedCount : "\u2014"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(campaign.startedAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {campaign.completedAt ? formatDateTime(campaign.completedAt) : "\u2014"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {status === "CanLoadMore" && (
          <div className="flex justify-center mt-4">
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
      </CardContent>
    </Card>
  );
}
