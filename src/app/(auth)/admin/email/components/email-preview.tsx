"use client";

import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getExampleVariables, markdownToEmailHtml, substituteVariables } from "@/lib/email-utils";

interface EmailPreviewProps {
  templateId?: Id<"emailTemplates">;
  subject?: string;
  content?: string;
}

export function EmailPreview({ templateId, subject, content }: EmailPreviewProps) {
  const template = useQuery(api.adminEmail.getTemplate, templateId ? { templateId } : "skip");

  const exampleVariables = useMemo(() => getExampleVariables(), []);

  const previewSubject = subject ?? template?.subject ?? "";
  const previewContent = content ?? template?.content ?? "";

  const renderedSubject = useMemo(() => {
    return substituteVariables(previewSubject, exampleVariables);
  }, [previewSubject, exampleVariables]);

  const renderedHtml = useMemo(() => {
    if (!previewContent) return "";
    return markdownToEmailHtml(previewContent, previewSubject, exampleVariables);
  }, [previewContent, previewSubject, exampleVariables]);

  if (templateId && template === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!previewContent) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No content to preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subject Line */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject</p>
        <p className="mt-1 font-medium">{renderedSubject}</p>
      </div>

      {/* Email Body Preview */}
      <div className="rounded-lg border">
        <div className="border-b bg-muted/30 p-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Email Preview
          </p>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <iframe
            title="Email Preview"
            srcDoc={renderedHtml}
            className="h-[500px] w-full"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Variables are shown with example values. Actual emails will use recipient-specific data.
      </p>
    </div>
  );
}
