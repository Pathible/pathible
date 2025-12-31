"use client";

import { useMutation } from "convex/react";
import { Edit2, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
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

const CATEGORIES = [
  { value: "faith", label: "Faith" },
  { value: "family", label: "Family" },
  { value: "work", label: "Work" },
  { value: "community", label: "Community" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

interface BeliefCardProps {
  belief: {
    _id: Id<"coreBeliefs">;
    statement: string;
    reflection: string;
    category: Category;
  };
  onDelete: (id: Id<"coreBeliefs">) => void;
}

export function BeliefCard({ belief, onDelete }: BeliefCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editStatement, setEditStatement] = useState(belief.statement);
  const [editReflection, setEditReflection] = useState(belief.reflection);
  const [editCategory, setEditCategory] = useState(belief.category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBelief = useMutation(api.coreBeliefs.update);

  const handleStartEdit = () => {
    setEditStatement(belief.statement);
    setEditReflection(belief.reflection);
    setEditCategory(belief.category);
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editStatement.trim() || !editReflection.trim()) {
      setError("Both statement and reflection are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateBelief({
        beliefId: belief._id,
        statement: editStatement,
        reflection: editReflection,
        category: editCategory,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update belief");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`statement-${belief._id}`} className="text-sm font-medium">
              Belief Statement <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`statement-${belief._id}`}
              value={editStatement}
              onChange={(e) => setEditStatement(e.target.value)}
              placeholder="State your core belief..."
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`reflection-${belief._id}`} className="text-sm font-medium">
              Reflection <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`reflection-${belief._id}`}
              value={editReflection}
              onChange={(e) => setEditReflection(e.target.value)}
              placeholder="Share why this belief is important to you..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`category-${belief._id}`} className="text-sm font-medium">
              Category
            </Label>
            <Select value={editCategory} onValueChange={(val) => setEditCategory(val as Category)}>
              <SelectTrigger id={`category-${belief._id}`}>
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

          <div className="flex gap-2">
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting || !editStatement.trim() || !editReflection.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-xl">{belief.statement}</CardTitle>
            <CardDescription className="text-muted-foreground">{belief.reflection}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleStartEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(belief._id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
