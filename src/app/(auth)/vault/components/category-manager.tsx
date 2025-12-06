"use client";

import { useMutation } from "convex/react";
import { Edit2, FolderOpen, Plus, Trash2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface Category {
  _id: Id<"vaultCategories">;
  name: string;
  description?: string;
  documentCount: number;
}

interface CategoryManagerProps {
  householdId: Id<"households">;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManager({
  householdId,
  categories,
  open,
  onOpenChange,
}: CategoryManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const createCategory = useMutation(api.vault.createCategory);
  const updateCategory = useMutation(api.vault.updateCategory);
  const deleteCategory = useMutation(api.vault.deleteCategory);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await createCategory({
        householdId,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      setNewCategoryName("");
      setNewCategoryDescription("");
      setIsCreating(false);
      toast.success("Category created successfully");
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    }
  };

  const handleEdit = async () => {
    if (!editingCategory || !editName.trim()) return;

    try {
      await updateCategory({
        categoryId: editingCategory._id,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setEditingCategory(null);
      setEditName("");
      setEditDescription("");
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory({ categoryId: deletingCategory._id });
      setDeletingCategory(null);
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || "");
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
    setEditDescription("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Create and organize categories to help classify your documents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Create New Category */}
            {isCreating ? (
              <Card className="border-primary">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="new-category-name">Category Name *</Label>
                    <Input
                      id="new-category-name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., Financial, Medical, Legal"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-category-description">Description</Label>
                    <Textarea
                      id="new-category-description"
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      placeholder="Brief description (optional)"
                      rows={2}
                      maxLength={200}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreating(false);
                        setNewCategoryName("");
                        setNewCategoryDescription("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleCreate} disabled={!newCategoryName.trim()}>
                      Create Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button onClick={() => setIsCreating(true)} className="w-full">
                <Plus className="h-4 w-4" />
                Add New Category
              </Button>
            )}

            {/* Existing Categories */}
            <div className="space-y-2">
              {categories.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground text-center">
                      No categories yet. Create your first category to organize documents.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                categories.map((category) => (
                  <Card key={category._id}>
                    <CardContent className="p-4">
                      {editingCategory?._id === category._id ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              maxLength={50}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={2}
                              maxLength={200}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={cancelEdit}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleEdit} disabled={!editName.trim()}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base">{category.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {category.documentCount} docs
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => startEdit(category)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeletingCategory(category)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}
              &quot;? This will remove the category from{" "}
              {deletingCategory?.documentCount === 1
                ? "1 document"
                : `${deletingCategory?.documentCount} documents`}
              . The documents themselves will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
