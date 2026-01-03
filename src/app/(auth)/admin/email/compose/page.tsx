"use client";

import { useAction, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { markdownToEmailHtml } from "@/lib/email-utils";
import { EmailPreview } from "../components/email-preview";
import { MarkdownEditor } from "../components/markdown-editor";
import { RecipientSelector, type RecipientType } from "../components/recipient-selector";

export default function ComposeEmailPage() {
  const router = useRouter();

  // Template selection
  const templates = useQuery(api.adminEmail.listTemplates, {});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("custom");
  const selectedTemplate = useQuery(
    api.adminEmail.getTemplate,
    selectedTemplateId !== "custom"
      ? { templateId: selectedTemplateId as Id<"emailTemplates"> }
      : "skip",
  );

  // Email content
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  // Recipients
  const [recipientType, setRecipientType] = useState<RecipientType>("all_users");
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Id<"profiles">[]>([]);

  // UI state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Get recipient count for confirmation
  const recipientCount = useQuery(api.adminEmail.getRecipientCount, {
    recipientType,
    tiers: recipientType === "by_tier" ? selectedTiers : undefined,
    userIds: recipientType === "individual" ? selectedUserIds : undefined,
  });

  // Get recipients for sending
  const recipients = useQuery(api.adminEmail.getRecipientsForEmail, {
    recipientType,
    tiers: recipientType === "by_tier" ? selectedTiers : undefined,
    userIds: recipientType === "individual" ? selectedUserIds : undefined,
  });

  const sendEmail = useAction(api.adminEmail.sendEmail);

  // Update content when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject);
      setContent(selectedTemplate.content);
    }
  }, [selectedTemplate]);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value);
    if (value === "custom") {
      setSubject("");
      setContent("");
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Subject line is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Email content is required");
      return;
    }
    if (recipientCount?.count === 0) {
      toast.error("No recipients selected");
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSend = async () => {
    setShowConfirmDialog(false);
    setIsSending(true);

    try {
      // Generate HTML content
      const htmlContent = markdownToEmailHtml(content, subject);

      // Get recipient emails - in real implementation, you'd fetch emails from Clerk
      // For now, we'll use placeholder emails based on the recipients
      const recipientEmails = (recipients || []).map((r) => ({
        email: `user-${r.clerkUserId}@placeholder.com`, // Placeholder - needs Clerk integration
        firstName: r.firstName,
        lastName: r.lastName,
      }));

      const result = await sendEmail({
        subject,
        content,
        htmlContent,
        templateId:
          selectedTemplateId !== "custom"
            ? (selectedTemplateId as Id<"emailTemplates">)
            : undefined,
        recipientType,
        tiers: recipientType === "by_tier" ? selectedTiers : undefined,
        userIds: recipientType === "individual" ? selectedUserIds : undefined,
        recipientEmails,
      });

      if (result.success) {
        toast.success(`Email sent successfully to ${result.sentCount} recipient(s)`);
        router.push("/admin/email");
      } else {
        toast.error(result.errorMessage || "Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const recipientTypeLabels: Record<RecipientType, string> = {
    individual: "Individual Recipients",
    all_users: "All Users",
    by_tier: "Users by Subscription Tier",
    household_owners: "Household Owners",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/email"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Email System
          </Link>
          <h1 className="mt-2 font-crimson text-3xl font-semibold">Compose Email</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/email">Cancel</Link>
          </Button>
          <Button onClick={handleSend} disabled={isSending || recipientCount?.count === 0}>
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Email
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Column */}
        <div className="space-y-6">
          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Recipients</CardTitle>
              <CardDescription>Select who will receive this email</CardDescription>
            </CardHeader>
            <CardContent>
              <RecipientSelector
                recipientType={recipientType}
                onRecipientTypeChange={setRecipientType}
                selectedTiers={selectedTiers}
                onSelectedTiersChange={setSelectedTiers}
                selectedUserIds={selectedUserIds}
                onSelectedUserIdsChange={setSelectedUserIds}
              />
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Email Content</CardTitle>
              <CardDescription>Choose a template or write a custom email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Template (Optional)</Label>
                <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Email (No Template)</SelectItem>
                    {templates?.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>Email Body *</Label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your email content here..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Preview</CardTitle>
              <CardDescription>See how your email will appear to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailPreview subject={subject} content={content} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Send</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>You are about to send this email to:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>
                    <strong>Recipient Type:</strong> {recipientTypeLabels[recipientType]}
                  </li>
                  <li>
                    <strong>Count:</strong> {recipientCount?.count ?? 0} user(s)
                  </li>
                  {recipientType === "by_tier" && selectedTiers.length > 0 && (
                    <li>
                      <strong>Tiers:</strong> {selectedTiers.join(", ")}
                    </li>
                  )}
                </ul>
                <p className="font-medium text-foreground">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSend}>
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
