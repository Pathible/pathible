"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, Calendar, Loader2, Mail, User, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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

export default function SentEmailDetailPage() {
  const params = useParams();
  const emailId = params.emailId as Id<"sentEmails">;

  const email = useQuery(api.adminEmail.getSentEmail, { emailId });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (email === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (email === null) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/email">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Email
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Email not found</h3>
            <p className="mt-2 text-center text-muted-foreground">
              This email may have been deleted or doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/admin/email">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Email
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p className="mt-1 font-medium">{email.subject}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant="secondary" className={`mt-1 ${STATUS_STYLES[email.status]}`}>
                  {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                </Badge>
                {email.errorMessage && (
                  <p className="mt-1 text-sm text-destructive">{email.errorMessage}</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sent At</p>
                  <p className="mt-1 text-sm">{formatDate(email._creationTime)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sent By</p>
                  <p className="mt-1 text-sm">{email.sentByName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipients</p>
                  <p className="mt-1 text-sm">
                    {RECIPIENT_TYPE_LABELS[email.recipientType] || email.recipientType} (
                    {email.recipientCount} recipient
                    {email.recipientCount !== 1 ? "s" : ""})
                  </p>
                  {email.recipientFilter?.tiers && email.recipientFilter.tiers.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tiers: {email.recipientFilter.tiers.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {email.templateName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Template</p>
                  <p className="mt-1 text-sm">{email.templateName}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Email Content</CardTitle>
              <CardDescription>Preview how this email appeared to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-0">
                  <div className="rounded-lg border bg-white">
                    <iframe
                      srcDoc={email.htmlContent}
                      title="Email Preview"
                      className="w-full min-h-[600px] rounded-lg"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="markdown" className="mt-0">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-[600px]">
                      {email.content}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="html" className="mt-0">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-[600px]">
                      {email.htmlContent}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
