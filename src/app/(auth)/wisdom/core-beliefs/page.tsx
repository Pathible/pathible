"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Heart, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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

const CATEGORIES = [
  { value: "faith", label: "Faith" },
  { value: "family", label: "Family" },
  { value: "work", label: "Work" },
  { value: "community", label: "Community" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

interface BeliefFormData {
  title: string;
  content: string;
  category: Category;
}

const initialFormData: BeliefFormData = {
  title: "",
  content: "",
  category: "personal",
};

export default function CoreBeliefsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"coreBeliefs"> | null>(null);
  const [formData, setFormData] = useState<BeliefFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<Id<"coreBeliefs"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const householdId = households?.[0]?._id;

  // Get core beliefs
  const beliefsData = useQuery(api.coreBeliefs.list, householdId ? { householdId } : "skip");

  // Mutations
  const createBelief = useMutation(api.coreBeliefs.create);
  const updateBelief = useMutation(api.coreBeliefs.update);
  const removeBelief = useMutation(api.coreBeliefs.remove);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (belief: {
    _id: Id<"coreBeliefs">;
    title: string;
    content: string;
    category: Category;
  }) => {
    setEditingId(belief._id);
    setFormData({
      title: belief.title,
      content: belief.content,
      category: belief.category,
    });
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await updateBelief({
          beliefId: editingId,
          title: formData.title,
          content: formData.content,
          category: formData.category,
        });
      } else {
        await createBelief({
          householdId,
          title: formData.title,
          content: formData.content,
          category: formData.category,
        });
      }
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save belief");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await removeBelief({ beliefId: deleteId });
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (!isUserLoaded || households === undefined) {
    return (
      <div className="px-6 py-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const beliefs = beliefsData?.beliefs ?? [];
  const canAddMore = beliefsData?.canAddMore ?? true;
  const maxBeliefs = beliefsData?.maxBeliefs ?? 5;

  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/wisdom"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Wisdom Hub
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Core Beliefs</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Define the fundamental beliefs and values that guide your life. These beliefs will be
          preserved as part of your legacy and shared with your family.
        </p>
      </div>

      {/* Beliefs List */}
      <div className="space-y-4 mb-6">
        {beliefsData === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : beliefs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No core beliefs yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding the beliefs and values that matter most to you.
              </p>
            </CardContent>
          </Card>
        ) : (
          beliefs.map((belief) => (
            <Card key={belief._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{belief.title}</h3>
                    <p className="text-muted-foreground">{belief.content}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() =>
                        openEditDialog({
                          _id: belief._id,
                          title: belief.title,
                          content: belief.content,
                          category: belief.category,
                        })
                      }
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(belief._id)}
                      className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Button */}
      {canAddMore && (
        <Card
          className="border-dashed cursor-pointer hover:border-primary/50 transition-colors"
          onClick={openCreateDialog}
        >
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Plus className="h-5 w-5" />
              <span>
                Add Core Belief ({beliefs.length}/{maxBeliefs})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About Section */}
      <Card className="mt-8 bg-muted/30">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            <strong>About Core Beliefs:</strong> Your core beliefs represent the guiding principles
            that shape your decisions, relationships, and life purpose. They will be saved to your
            Heritage Vault and can be shared with family members to help them understand what
            matters most to you.
          </p>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Core Belief" : "Add Core Belief"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="belief-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="belief-title"
                placeholder="e.g., Family is the foundation of a meaningful life"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="belief-content">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="belief-content"
                placeholder="Explain what this belief means to you..."
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                required
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="belief-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: val as Category,
                  }))
                }
              >
                <SelectTrigger id="belief-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  "Add Belief"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Core Belief?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This belief will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
