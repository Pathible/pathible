"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { extractVariables, markdownToEmailHtml, TEMPLATE_CATEGORIES } from "@/lib/email-utils";
import { EmailPreview } from "./email-preview";
import { MarkdownEditor } from "./markdown-editor";

interface TemplateEditorProps {
  templateId?: Id<"emailTemplates">;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const isEditing = !!templateId;

  const existingTemplate = useQuery(
    api.adminEmail.getTemplate,
    templateId ? { templateId } : "skip",
  );

  const createTemplate = useMutation(api.adminEmail.createTemplate);
  const updateTemplate = useMutation(api.adminEmail.updateTemplate);
  const sendTestEmail = useAction(api.adminEmail.sendTestEmail);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // Load existing template data
  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setSubject(existingTemplate.subject);
      setContent(existingTemplate.content);
      setDescription(existingTemplate.description || "");
      setCategory(existingTemplate.category || "other");
    }
  }, [existingTemplate]);

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
        await updateTemplate({
          templateId,
          name,
          subject,
          content,
          description: description || undefined,
          variables,
          category: category as
            | "onboarding"
            | "legacy"
            | "invitations"
            | "digest"
            | "system"
            | "other",
        });
        toast.success("Template updated successfully");
      } else {
        await createTemplate({
          name,
          subject,
          content,
          description: description || undefined,
          variables,
          category: category as
            | "onboarding"
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

  if (isEditing && existingTemplate === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isEditing && existingTemplate === null) {
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
          <h1 className="mt-2 font-crimson text-3xl font-semibold">
            {isEditing ? `Edit Template: ${existingTemplate?.name}` : "New Template"}
          </h1>
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

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Column */}
        <div className="space-y-6">
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
        </div>

        {/* Preview Column */}
        <div className="lg:sticky lg:top-6 lg:self-start">
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
    </div>
  );
}
