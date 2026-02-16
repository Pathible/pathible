"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Clock,
  Eye,
  LayoutTemplate,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatDate } from "@/lib/date-utils";
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

  if (templates === undefined) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <h3 className="font-crimson text-lg font-medium">No email templates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Create your first template to start reaching families.
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
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <LayoutTemplate className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="font-crimson text-xl">Email Templates</CardTitle>
          </div>
          <CardDescription>
            Reusable templates for reaching families at the right moment
          </CardDescription>
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
                <TableRow key={template._id} className="hover:bg-muted/30">
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
                    <Badge variant="outline" className={getCategoryStyle(template.category)}>
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
                        <AdminStatusBadge
                          type="enabled"
                          value={template.enabled ? "enabled" : "disabled"}
                          className="text-xs w-fit"
                        >
                          {template.enabled ? "Enabled" : "Disabled"}
                        </AdminStatusBadge>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{"\u2014"}</span>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/email/templates/${template._id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(template._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <DialogTitle className="font-crimson">Email Preview</DialogTitle>
            <DialogDescription>Preview how this email will appear to recipients</DialogDescription>
          </DialogHeader>
          {previewTemplate && <EmailPreview templateId={previewTemplate} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-crimson">Delete Template</AlertDialogTitle>
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
