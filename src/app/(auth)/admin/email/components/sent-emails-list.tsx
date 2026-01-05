"use client";

import { usePaginatedQuery } from "convex/react";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
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

const RECIPIENT_TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  all_users: "All Users",
  by_tier: "By Tier",
  household_owners: "Household Owners",
};

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  partial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function SentEmailsList() {
  const router = useRouter();
  const { results, status, loadMore } = usePaginatedQuery(
    api.adminEmail.listSentEmails,
    {},
    { initialNumItems: 15 },
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatRecipients = (type: string, count: number) => {
    const label = RECIPIENT_TYPE_LABELS[type] || type;
    return `${label} (${count})`;
  };

  if (status === "LoadingFirstPage") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No emails sent yet</h3>
          <p className="mt-2 text-center text-muted-foreground">
            When you send emails, they will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-crimson text-xl">Sent Emails</CardTitle>
        <CardDescription>History of all emails sent through the admin system</CardDescription>
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
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/admin/email/sent/${email._id}`)}
              >
                <TableCell className="font-medium">{email.subject}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRecipients(email.recipientType, email.recipientCount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {email.templateName || "Custom"}
                </TableCell>
                <TableCell className="text-muted-foreground">{email.sentByName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(email._creationTime)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={STATUS_STYLES[email.status]}>
                    {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                  </Badge>
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
