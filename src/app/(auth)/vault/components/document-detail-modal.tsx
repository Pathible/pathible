"use client";

import { useMutation } from "convex/react";
import { Calendar, Download, Edit2, FileText, Trash2, User, X } from "lucide-react";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Document {
  _id: Id<"vaultDocuments">;
  _creationTime: number;
  name: string;
  description?: string;
  uploaderName: string;
  fileSize: number;
  fileType: string;
  categories: string[];
  accessLevel: "household" | "admins" | "custom";
  updatedAt: number;
}

interface Category {
  _id: Id<"vaultCategories">;
  name: string;
  description?: string;
  documentCount: number;
}

interface DocumentDetailModalProps {
  document: Document;
  categories: Category[];
  householdId: Id<"households">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DocumentDetailModal({
  document,
  categories,
  open,
  onOpenChange,
  onDownload,
}: DocumentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(document.name);
  const [description, setDescription] = useState(document.description || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(document.categories);
  const [accessLevel, setAccessLevel] = useState(document.accessLevel);

  const updateDocument = useMutation(api.vault.update);
  const deleteDocument = useMutation(api.vault.remove);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDocument({
        documentId: document._id,
        name: name.trim(),
        description: description.trim() || undefined,
        categories: selectedCategories,
        accessLevel,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update document:", error);
      alert("Failed to update document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument({ documentId: document._id });
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document");
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  const handleCancel = () => {
    setName(document.name);
    setDescription(document.description || "");
    setSelectedCategories(document.categories);
    setAccessLevel(document.accessLevel);
    setIsEditing(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg font-semibold"
                  />
                ) : (
                  <DialogTitle className="text-xl">{document.name}</DialogTitle>
                )}
                <DialogDescription>
                  {formatFileSize(document.fileSize)} • {document.fileType}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {document.description || "No description"}
                </p>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category._id}
                      variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90"
                      onClick={() => handleCategoryToggle(category.name)}
                    >
                      {category.name}
                      {selectedCategories.includes(category.name) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {document.categories.length > 0 ? (
                    document.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories</p>
                  )}
                </div>
              )}
            </div>

            {/* Access Level */}
            <div className="space-y-2">
              <Label>Access Level</Label>
              {isEditing ? (
                <Select
                  value={accessLevel}
                  onValueChange={(value) =>
                    setAccessLevel(value as "household" | "admins" | "custom")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="household">All Household Members</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                    <SelectItem value="custom">Custom Members</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {document.accessLevel === "household" && "All household members"}
                  {document.accessLevel === "admins" && "Admins only"}
                  {document.accessLevel === "custom" && "Custom members"}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Uploaded by</span>
                </div>
                <p className="text-sm font-medium">{document.uploaderName}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Upload date</span>
                </div>
                <p className="text-sm font-medium">{formatDate(document._creationTime)}</p>
              </div>
            </div>

            {document.updatedAt !== document._creationTime && (
              <div className="text-xs text-muted-foreground">
                Last updated: {formatDate(document.updatedAt)}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="sm:mr-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button variant="outline" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{document.name}&quot;? This action cannot be
              undone and the file will be permanently removed from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
