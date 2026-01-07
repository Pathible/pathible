"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, BookOpen, Loader2, Lock, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeatureGate } from "@/components/feature-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { FEATURES } from "@/lib/feature-access";

const CATEGORIES = [
  { value: "values", label: "Values" },
  { value: "lessons", label: "Life Lessons" },
  { value: "stories", label: "Stories" },
  { value: "advice", label: "Advice" },
  { value: "traditions", label: "Traditions" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export default function QuickCreateWisdomEntryPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("lessons");
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const householdId = households?.[0]?._id;

  // Mutations
  const createWisdomEntry = useMutation(api.wisdom.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createWisdomEntry({
        householdId,
        title,
        content,
        category,
        isPublished,
      });
      router.push("/wisdom/library");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!isUserLoaded || households === undefined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <FeatureGate feature={FEATURES.WISDOM_ENTRIES}>
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/wisdom/create-entry"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to guided mode
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-2">Quick Create</h1>
          <p className="text-muted-foreground">
            Write freely without prompts. Perfect when you know exactly what you want to say.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Give your wisdom a meaningful title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Share your wisdom, lesson, or insight here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={10}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Take your time. This space is for reflection.
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(val) => setCategory(val as Category)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Choose a category..." />
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

              {/* Privacy */}
              <div className="space-y-2">
                <Label>Privacy</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPublished(false)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      !isPublished
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="h-4 w-4" />
                      <span className="font-medium">Private</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Only you can see this</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublished(true)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isPublished
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Share with Family</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Visible to family members</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Wisdom Entry"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/wisdom")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </FeatureGate>
  );
}
