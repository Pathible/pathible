"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowLeft, Clock, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { extractVariables, markdownToEmailHtml, TEMPLATE_CATEGORIES } from "@/lib/email-utils";
import { EmailPreview } from "./email-preview";
import { MarkdownEditor } from "./markdown-editor";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TemplateEditorProps {
  templateId?: Id<"emailTemplates">;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const isEditing = !!templateId;

  // Single unified query for any template
  const template = useQuery(api.adminEmail.getTemplate, templateId ? { templateId } : "skip");

  const createTemplate = useMutation(api.adminEmail.createTemplate);
  const updateTemplate = useMutation(api.adminEmail.updateTemplate);
  const sendTestEmail = useAction(api.adminEmail.sendTestEmail);

  // Basic template fields
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("other");

  // Automation toggle
  const [isAutomated, setIsAutomated] = useState(false);

  // Automation fields
  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState<"weekly" | "daily">("weekly");
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [hourUtc, setHourUtc] = useState(18);
  const [onboardingStatus, setOnboardingStatus] = useState("");
  const [minDaysSinceOnboarding, setMinDaysSinceOnboarding] = useState<number | undefined>(
    undefined,
  );
  const [vaultEmpty, setVaultEmpty] = useState<boolean | undefined>(undefined);
  const [requireEmailNotifications, setRequireEmailNotifications] = useState<boolean | undefined>(
    undefined,
  );

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // Load existing template data
  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setContent(template.content);
      setDescription(template.description || "");
      setCategory(template.category || "other");

      // Check if template has automation configured
      const hasAutomation = !!(template.schedule && template.triggerConditions);
      setIsAutomated(hasAutomation);

      if (hasAutomation) {
        setEnabled(template.enabled ?? true);
        if (template.schedule) {
          setFrequency(template.schedule.frequency);
          setDayOfWeek(template.schedule.dayOfWeek ?? 0);
          setHourUtc(template.schedule.hourUtc);
        }
        if (template.triggerConditions) {
          setOnboardingStatus(template.triggerConditions.onboardingStatus || "");
          setMinDaysSinceOnboarding(template.triggerConditions.minDaysSinceOnboarding);
          setVaultEmpty(template.triggerConditions.vaultEmpty);
          setRequireEmailNotifications(template.triggerConditions.requireEmailNotifications);
        }
      }
    }
  }, [template]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject line is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Email content is required");
      return;
    }

    setIsSaving(true);
    try {
      const variables = extractVariables(content + subject);

      if (isEditing && templateId) {
        // Update existing template
        await updateTemplate({
          templateId,
          name,
          subject,
          content,
          description: description || undefined,
          variables,
          category: category as
            | "onboarding"
            | "retargeting"
            | "announcements"
            | "legacy"
            | "invitations"
            | "digest"
            | "system"
            | "other",
          // Automation fields - pass null to clear if automation is disabled
          enabled: isAutomated ? enabled : undefined,
          schedule: isAutomated
            ? {
                frequency,
                dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
                hourUtc,
              }
            : null,
          triggerConditions: isAutomated
            ? {
                onboardingStatus: onboardingStatus || undefined,
                minDaysSinceOnboarding,
                vaultEmpty,
                requireEmailNotifications,
              }
            : null,
        });
        toast.success("Template updated successfully");
      } else {
        // Create new template
        await createTemplate({
          name,
          subject,
          content,
          description: description || undefined,
          variables,
          category: category as
            | "onboarding"
            | "retargeting"
            | "announcements"
            | "legacy"
            | "invitations"
            | "digest"
            | "system"
            | "other",
        });
        toast.success("Template created successfully");
        router.push("/admin/email");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error("Enter an email address for the test");
      return;
    }
    if (!subject.trim() || !content.trim()) {
      toast.error("Subject and content are required to send a test");
      return;
    }

    setIsSendingTest(true);
    try {
      const htmlContent = markdownToEmailHtml(content, subject);
      const result = await sendTestEmail({
        subject,
        htmlContent,
        toEmail: testEmail,
      });

      if (result.success) {
        toast.success(`Test email sent to ${testEmail}`);
      } else {
        toast.error(result.error || "Failed to send test email");
      }
    } catch {
      toast.error("Failed to send test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Loading state
  if (isEditing && template === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found state
  if (isEditing && template === null) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/email"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Email System
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Template not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="mt-2 flex items-center gap-2">
            <h1 className="font-crimson text-3xl font-semibold">
              {isEditing ? name || "Edit Template" : "New Template"}
            </h1>
            {isAutomated && (
              <Badge variant="outline" className="bg-accent/10 text-accent">
                Automated
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/email">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Template"}
          </Button>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor Column - spans 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Template Details</CardTitle>
              <CardDescription>Basic information about this email template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Welcome Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Welcome to {{appName}}, {{firstName}}!"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{variables}}"} for dynamic content
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Internal)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about when to use this template..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Email Content</CardTitle>
              <CardDescription>
                Write your email using Markdown. Use the toolbar to format text and insert
                variables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your email content here...

# Welcome to Pathible!

Hi {{firstName}},

Thank you for joining us...

---

Best regards,
The Pathible Team"
              />
            </CardContent>
          </Card>

          {/* Preview - sticky at bottom of left column */}
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-crimson text-xl">Preview</CardTitle>
                <CardDescription>Live preview with example variable values</CardDescription>
              </CardHeader>
              <CardContent>
                <EmailPreview subject={subject} content={content} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Send Test Email</CardTitle>
              <CardDescription>
                Send a test email to yourself to preview how it will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleSendTest}
                  disabled={isSendingTest || !testEmail}
                >
                  {isSendingTest ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Automation Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Automation</CardTitle>
              <CardDescription>
                Enable to send this template automatically on a schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isAutomated">Enable Automation</Label>
                  <p className="text-xs text-muted-foreground">
                    Configure schedule and trigger conditions
                  </p>
                </div>
                <Switch id="isAutomated" checked={isAutomated} onCheckedChange={setIsAutomated} />
              </div>
            </CardContent>
          </Card>

          {/* Automation Settings - only shown when automation is enabled */}
          {isAutomated && (
            <>
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enabled">Enabled</Label>
                      <p className="text-xs text-muted-foreground">
                        When disabled, this email won&apos;t be sent
                      </p>
                    </div>
                    <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Schedule</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={frequency}
                      onValueChange={(v) => setFrequency(v as "weekly" | "daily")}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {frequency === "weekly" && (
                    <div className="space-y-2">
                      <Label htmlFor="dayOfWeek">Day of Week</Label>
                      <Select
                        value={dayOfWeek.toString()}
                        onValueChange={(v) => setDayOfWeek(parseInt(v, 10))}
                      >
                        <SelectTrigger id="dayOfWeek">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAY_NAMES.map((day, index) => (
                            <SelectItem key={day} value={index.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="hourUtc">Hour (UTC)</Label>
                    <Select
                      value={hourUtc.toString()}
                      onValueChange={(v) => setHourUtc(parseInt(v, 10))}
                    >
                      <SelectTrigger id="hourUtc">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(24).keys()].map((hour) => (
                          <SelectItem key={`utc-hour-${hour}`} value={hour.toString()}>
                            {hour.toString().padStart(2, "0")}:00 UTC
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Trigger Conditions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trigger Conditions</CardTitle>
                  <CardDescription>Define which users receive this email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="onboardingStatus">Onboarding Status</Label>
                    <Select
                      value={onboardingStatus || "any"}
                      onValueChange={(v) => setOnboardingStatus(v === "any" ? "" : v)}
                    >
                      <SelectTrigger id="onboardingStatus">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any status</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minDays">Min Days Since Onboarding</Label>
                    <Input
                      id="minDays"
                      type="number"
                      min={0}
                      value={minDaysSinceOnboarding ?? ""}
                      onChange={(e) =>
                        setMinDaysSinceOnboarding(
                          e.target.value ? parseInt(e.target.value, 10) : undefined,
                        )
                      }
                      placeholder="No minimum"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vaultEmpty"
                      checked={vaultEmpty === true}
                      onCheckedChange={(checked) =>
                        setVaultEmpty(
                          checked === "indeterminate" ? undefined : checked ? true : undefined,
                        )
                      }
                    />
                    <Label htmlFor="vaultEmpty" className="text-sm">
                      Vault must be empty
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailNotifications"
                      checked={requireEmailNotifications === true}
                      onCheckedChange={(checked) =>
                        setRequireEmailNotifications(
                          checked === "indeterminate" ? undefined : checked ? true : undefined,
                        )
                      }
                    />
                    <Label htmlFor="emailNotifications" className="text-sm">
                      Require email opt-in
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
