"use client";

import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface CreateBeliefDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: Id<"households">;
}

export function CreateBeliefDialog({ open, onOpenChange, householdId }: CreateBeliefDialogProps) {
  const [statement, setStatement] = useState("");
  const [reflection, setReflection] = useState("");
  const [category, setCategory] = useState<Category>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBelief = useMutation(api.coreBeliefs.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statement.trim() || !reflection.trim()) {
      setError("Both statement and reflection are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createBelief({
        householdId,
        statement: statement.trim(),
        reflection: reflection.trim(),
        category,
      });

      // Reset form and close dialog
      setStatement("");
      setReflection("");
      setCategory("personal");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create belief");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      // Reset form when closing
      setStatement("");
      setReflection("");
      setCategory("personal");
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Core Belief</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="belief-statement">
              Belief Statement <span className="text-destructive">*</span>
            </Label>
            <Input
              id="belief-statement"
              placeholder="e.g., Family is the foundation of a meaningful life"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="belief-reflection">
              Reflection <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="belief-reflection"
              placeholder="Explain what this belief means to you and why it's important..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="belief-category">Category</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as Category)}>
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
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !statement.trim() || !reflection.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Belief"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
