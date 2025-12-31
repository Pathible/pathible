"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Heart, Loader2, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { BeliefCard } from "./components/BeliefCard";
import { CreateBeliefDialog } from "./components/CreateBeliefDialog";

function CoreBeliefsContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if quick mode is requested via URL param
  const isQuickMode = searchParams.get("quick") === "true";

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Open dialog if quick mode is requested
  useEffect(() => {
    if (isQuickMode) {
      setIsCreateDialogOpen(true);
      // Clear the URL param without navigation
      router.replace("/wisdom/core-beliefs", { scroll: false });
    }
  }, [isQuickMode, router]);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<Id<"coreBeliefs"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const householdId = households?.[0]?._id;

  // Get core beliefs
  const beliefsData = useQuery(api.coreBeliefs.list, householdId ? { householdId } : "skip");

  // Mutations
  const removeBelief = useMutation(api.coreBeliefs.remove);

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
              <p className="text-muted-foreground mb-6">
                Start by adding the beliefs and values that matter most to you.
              </p>
              <Link
                href="/wisdom/core-beliefs/create"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Your First Belief
              </Link>
            </CardContent>
          </Card>
        ) : (
          beliefs.map((belief) => (
            <BeliefCard key={belief._id} belief={belief} onDelete={setDeleteId} />
          ))
        )}
      </div>

      {/* Add Buttons */}
      {canAddMore && householdId && (
        <div className="space-y-3">
          {/* Guided mode - primary action */}
          <Link href="/wisdom/core-beliefs/create">
            <Card className="border-dashed cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Add Core Belief</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll guide you through the process
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {beliefs.length}/{maxBeliefs}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Quick mode - secondary action */}
          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <Zap className="h-4 w-4 inline mr-1" />
            Quick add (skip the guide)
          </button>
        </div>
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

      {/* Create Dialog */}
      {householdId && (
        <CreateBeliefDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          householdId={householdId}
        />
      )}

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

// Wrap in Suspense for useSearchParams
export default function CoreBeliefsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-8 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      }
    >
      <CoreBeliefsContent />
    </Suspense>
  );
}
