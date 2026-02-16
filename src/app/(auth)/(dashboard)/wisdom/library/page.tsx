"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Loader2,
  Lock,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeatureGate } from "@/components/feature-gate";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate } from "@/lib/date-utils";
import { FEATURES } from "@/lib/feature-access";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "values", label: "Values" },
  { value: "lessons", label: "Life Lessons" },
  { value: "stories", label: "Stories" },
  { value: "advice", label: "Advice" },
  { value: "traditions", label: "Traditions" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  values: "Values",
  lessons: "Life Lessons",
  stories: "Stories",
  advice: "Advice",
  traditions: "Traditions",
};

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export default function WisdomLibraryPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<Id<"wisdomEntries"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const householdId = households?.[0]?._id;

  // Get wisdom entries
  const entries = useQuery(
    api.wisdom.list,
    householdId
      ? {
          householdId,
          searchQuery: searchQuery || undefined,
          category:
            categoryFilter !== "all"
              ? (categoryFilter as "values" | "lessons" | "stories" | "advice" | "traditions")
              : undefined,
        }
      : "skip",
  );

  // Mutations
  const removeEntry = useMutation(api.wisdom.remove);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await removeEntry({ entryId: deleteId });
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

  return (
    <FeatureGate feature={FEATURES.WISDOM_ENTRIES}>
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
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Wisdom Library</h1>
            </div>
            <p className="text-muted-foreground">
              Everything you&apos;ve written for the ones you love
            </p>
          </div>
          <Button asChild>
            <Link href="/wisdom/create-entry">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wisdom and letters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
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
          </CardContent>
        </Card>

        {/* Entries Grid */}
        {entries === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Your family is waiting to hear from you
              </h3>
              <p className="text-muted-foreground mb-4">
                The stories only you can tell, start with one, it doesn&apos;t have to be perfect.
              </p>
              <Button asChild>
                <Link href="/wisdom/create-entry">Write Your First Story</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map((entry) => (
              <Card
                key={entry._id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push(`/wisdom/library/${entry._id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.isPublished ? (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(entry._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {truncateText(entry.content, 120)}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {CATEGORY_LABELS[entry.category] || entry.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry._creationTime)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this wisdom entry?</AlertDialogTitle>
              <AlertDialogDescription>
                Once removed, this entry can&apos;t be recovered. Your family won&apos;t be able to
                see it.
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
    </FeatureGate>
  );
}
