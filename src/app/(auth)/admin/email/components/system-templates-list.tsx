"use client";

import { useQuery } from "convex/react";
import { Clock, Code2, Eye, Loader2, Pencil, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";

export function SystemTemplatesList() {
  const systemTemplates = useQuery(api.adminEmail.getSystemTemplates, {});
  const [previewTemplate, setPreviewTemplate] = useState<{
    name: string;
    html: string;
  } | null>(null);

  if (systemTemplates === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (systemTemplates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent/10 p-1.5">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <CardTitle className="font-crimson text-xl">Automated Email Templates</CardTitle>
          </div>
          <CardDescription>
            No system templates found. Run the seed script to populate system templates.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-accent/10 p-1.5">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <CardTitle className="font-crimson text-xl">Automated Email Templates</CardTitle>
          </div>
          <CardDescription>
            System templates for automated emails (triggered by cron jobs). Edit templates to
            customize content, schedules, and trigger conditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Template Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-[200px]">Schedule</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.name}</span>
                      <Badge variant="outline" className="text-xs">
                        <Code2 className="mr-1 h-3 w-3" />
                        System
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground font-mono text-sm">
                    {template.subject}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {template.trigger}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge
                      type="enabled"
                      value={template.enabled ? "enabled" : "disabled"}
                    >
                      {template.enabled ? "Enabled" : "Disabled"}
                    </AdminStatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setPreviewTemplate({
                            name: template.name,
                            html: template.previewHtml,
                          })
                        }
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link href={`/admin/email/templates/${template._id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Email Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              This is how the automated email will appear to recipients (with sample data)
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md bg-white">
            {previewTemplate && (
              <iframe
                srcDoc={previewTemplate.html}
                title="Email Preview"
                className="w-full h-[600px] border-0"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
