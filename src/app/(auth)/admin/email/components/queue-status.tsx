"use client";

import { useQuery } from "convex/react";
import { CheckCircle2, Clock, Info, Loader2, Mail, XCircle } from "lucide-react";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
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
import { formatDateTimeCompact } from "@/lib/date-utils";

const QUEUE_ICONS: Record<string, React.ReactNode> = {
  queued: <Clock className="h-3 w-3" />,
  processing: <Loader2 className="h-3 w-3 animate-spin" />,
  sent: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
};

export function QueueStatus() {
  const stats = useQuery(api.adminEmail.getQueueStats);

  if (stats === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="font-crimson text-xl">Recent Email Activity</CardTitle>
          </div>
          <CardDescription>Last 10 emails processed by the queue</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No emails in the queue yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentEmails.map((email) => (
                  <TableRow key={email._id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">{email.to}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{email.subject}</TableCell>
                    <TableCell>
                      <AdminStatusBadge type="queueStatus" value={email.status} className="gap-1">
                        {QUEUE_ICONS[email.status]}
                        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </AdminStatusBadge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTimeCompact(email.scheduledFor)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {email.sentAt ? formatDateTimeCompact(email.sentAt) : "\u2014"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-muted p-1.5">
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="font-crimson text-base">Queue Processing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">Rate Limit:</strong> 2 emails per second
          </p>
          <p>
            <strong className="text-foreground">Processing:</strong> Cron job runs every 30 seconds
          </p>
          <p>
            <strong className="text-foreground">Retries:</strong> Up to 3 times with exponential
            backoff (1min, 5min, 15min)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
