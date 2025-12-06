"use client";

import { useQuery } from "convex/react";
import { AlertCircle, FolderOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { CategoryManager } from "./category-manager";
import { DocumentList } from "./document-list";
import { SearchAndFilter } from "./search-and-filter";
import { UploadButton } from "./upload-button";
import { VaultStats } from "./vault-stats";

export function VaultContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  // Check Better Auth session status
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  // Get user's households (only if authenticated)
  const households = useQuery(api.households.list, session?.user ? {} : "skip");

  // Use the first household (most users will only have one)
  const householdId = households?.[0]?._id;

  // Only fetch vault data once we have a household ID
  const stats = useQuery(api.vault.getStats, householdId ? { householdId } : "skip");
  const documents = useQuery(
    api.vault.list,
    householdId
      ? {
          householdId,
          searchQuery: searchQuery || undefined,
          category: selectedCategory,
        }
      : "skip",
  );
  const categories = useQuery(api.vault.listCategories, householdId ? { householdId } : "skip");

  // Loading state - wait for session and households
  if (isSessionPending || households === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated (shouldn't happen due to layout protection, but handle gracefully)
  if (!session?.user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please sign in to access the Heritage Vault.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No household found
  if (!householdId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Household Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            You need to be part of a household to access the Heritage Vault. Please complete your
            onboarding or contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = stats === undefined || documents === undefined || categories === undefined;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && <VaultStats stats={stats} />}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories || []}
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setCategoryManagerOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <FolderOpen className="h-4 w-4" />
            Manage Categories
          </Button>
          <UploadButton
            householdId={householdId}
            categories={categories || []}
            className="flex-1 sm:flex-none"
          />
        </div>
      </div>

      {/* Documents List */}
      <DocumentList
        documents={documents || []}
        categories={categories || []}
        householdId={householdId}
        isLoading={isLoading}
      />

      {/* Category Manager Modal */}
      <CategoryManager
        householdId={householdId}
        categories={categories || []}
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
      />
    </div>
  );
}
