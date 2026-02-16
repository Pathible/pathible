"use client";

import { usePaginatedQuery } from "convex/react";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const RECIPIENT_TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  all_users: "All Users",
  by_tier: "By Tier",
  household_owners: "Household Owners",
};

export function SentEmailsList() {
  const router = useRouter();
  const { results, status, loadMore } = usePaginatedQuery(
    api.adminEmail.listSentEmails,
    {},
    { initialNumItems: 15 },
  );

  const formatRecipients = (type: string, count: number) => {
    const label = RECIPIENT_TYPE_LABELS[type] || type;
    return `${label} (${count})`;
  };

  if (status === "LoadingFirstPage") {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <h3 className="font-crimson text-lg font-medium">
            No emails sent yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            When you send emails, they will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-secondary/10 p-1.5">
            <Mail className="h-4 w-4 text-secondary" />
          </div>
          <CardTitle className="font-crimson text-xl">Sent Emails</CardTitle>
        </div>
        <CardDescription>Every message that reached a family</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Subject</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Sent By</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((email) => (
              <TableRow
                key={email._id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => router.push(`/admin/email/sent/${email._id}`)}
              >
                <TableCell className="font-medium">{email.subject}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRecipients(email.recipientType, email.recipientCount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {email.templateName || "Custom"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {email.sentByName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(email._creationTime)}
                </TableCell>
                <TableCell>
                  <AdminStatusBadge type="emailStatus" value={email.status}>
                    {email.status.charAt(0).toUpperCase() +
                      email.status.slice(1)}
                  </AdminStatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {status === "CanLoadMore" && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={() => loadMore(15)}>
              Load More
            </Button>
          </div>
        )}

        {status === "LoadingMore" && (
          <div className="mt-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
