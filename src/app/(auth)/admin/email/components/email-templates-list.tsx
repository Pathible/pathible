"use client";

import { useMutation, useQuery } from "convex/react";
import { Clock, Eye, Loader2, Mail, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import type { Id } from "@/convex/_generated/dataModel";
import { getCategoryLabel, getCategoryStyle } from "@/lib/email-utils";
import { EmailPreview } from "./email-preview";

export function EmailTemplatesList() {
  const templates = useQuery(api.adminEmail.listTemplates, {});
  const deleteTemplate = useMutation(api.adminEmail.deleteTemplate);

  const [previewTemplate, setPreviewTemplate] = useState<Id<"emailTemplates"> | null>(null);
  const [deleteId, setDeleteId] = useState<Id<"emailTemplates"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteTemplate({ templateId: deleteId });
      toast.success("Template deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (templates === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No email templates yet</h3>
          <p className="mt-2 text-center text-muted-foreground">
            Create your first template to get started with email communications.
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/email/templates/new">Create Template</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-crimson text-xl">Email Templates</CardTitle>
          <CardDescription>Manage reusable email templates for communications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Template Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[180px]">Automation</TableHead>
                <TableHead className="w-[100px]">Last Modified</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/email/templates/${template._id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {template.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate text-muted-foreground">
                    {template.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getCategoryStyle(template.category)}>
                      {getCategoryLabel(template.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.isAutomated ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {template.scheduleDescription}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            template.enabled
                              ? "bg-green-500/10 text-green-700 text-xs w-fit"
                              : "text-muted-foreground text-xs w-fit"
                          }
                        >
                          {template.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(template.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewTemplate(template._id)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link href={`/admin/email/templates/${template._id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(template._id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>Preview how this email will appear to recipients</DialogDescription>
          </DialogHeader>
          {previewTemplate && <EmailPreview templateId={previewTemplate} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
