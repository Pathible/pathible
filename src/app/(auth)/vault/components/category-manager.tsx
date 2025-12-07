"use client";

import { useMutation } from "convex/react";
import { FolderOpen, Pencil, Plus, Settings, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editName, setEditName] = useState("");

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
      });
      setNewCategoryName("");
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
      });
      setEditingCategory(null);
      setEditName("");
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
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Settings className="h-5 w-5 text-primary" />
              Manage Categories
            </DialogTitle>
            <DialogDescription>Add, edit, or remove document categories</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Add New Category - Always visible inline form */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Add New Category</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  maxLength={50}
                  className="border-primary/50 focus-visible:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCategoryName.trim()) {
                      handleCreate();
                    }
                  }}
                />
                <Button
                  onClick={handleCreate}
                  disabled={!newCategoryName.trim()}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Existing Categories */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Existing Categories</Label>
              {categories.length === 0 ? (
                <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    No categories yet. Create your first category to organize documents.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border-2 "
                    >
                      {editingCategory?._id === category._id ? (
                        <div className="flex-1 space-y-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            maxLength={50}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={cancelEdit}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleEdit} disabled={!editName.trim()}>
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-5 w-5 text-primary shrink-0" />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              {category.documentCount} docs
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => startEdit(category)}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeletingCategory(category)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
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
