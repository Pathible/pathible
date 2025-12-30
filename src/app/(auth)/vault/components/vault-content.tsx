"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, Loader2, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { CategoryManager } from "./category-manager";
import { DocumentList } from "./document-list";
import { SearchAndFilter } from "./search-and-filter";
import { UploadButton } from "./upload-button";
import { VaultStats } from "./vault-stats";

export function VaultContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  // Track retry attempts for auth sync
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10; // Max retries before giving up (5 seconds total)

  // Check Clerk session status
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households - run when session is ready
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  // Unified retry logic for auth race conditions
  useEffect(() => {
    const needsRetry = isUserLoaded && retryCount < maxRetries && (!user || households === null);

    if (needsRetry) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isUserLoaded, user, households, retryCount]);

  // Determine if we're still in the auth loading phase
  const isAuthLoading = !isUserLoaded || (!user && retryCount < maxRetries);

  // Use the first household (most users will only have one)
  const householdId = households?.[0]?._id;

  // Only fetch vault data once we have a household ID
  const stats = useQuery(api.vault.getStats, householdId ? { householdId } : "skip");
  const documentsResponse = useQuery(
    api.vault.list,
    householdId
      ? {
          householdId,
          searchQuery: searchQuery || undefined,
          category: selectedCategory,
        }
      : "skip",
  );
  // Extract documents from paginated response
  const documents = documentsResponse?.documents;
  const categories = useQuery(api.vault.listCategories, householdId ? { householdId } : "skip");

  // Initialize default categories mutation
  const initializeCategories = useMutation(api.vault.initializeDefaultCategories);
  const [categoriesInitialized, setCategoriesInitialized] = useState(false);

  // Auto-initialize default categories if household has none
  useEffect(() => {
    if (
      householdId &&
      categories !== undefined &&
      categories.length === 0 &&
      !categoriesInitialized
    ) {
      setCategoriesInitialized(true);
      initializeCategories({ householdId }).catch(console.error);
    }
  }, [householdId, categories, categoriesInitialized, initializeCategories]);

  // Loading state - wait for Better Auth session and retries to complete
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated - only show after all retries exhausted
  if (!user) {
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

  // Still loading households query (undefined = query pending, null = auth not ready yet)
  // Show loading while retrying, show error if retries exhausted
  if (households === undefined || (households === null && retryCount < maxRetries)) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Auth sync failed after all retries - show helpful error
  if (households === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connection Issue</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            Unable to load your household data. Please refresh the page or try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No household found (empty array means auth worked but user has no households)
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

  const isLoading =
    stats === undefined || documentsResponse === undefined || categories === undefined;

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Heritage Vault</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Securely store and organize important documents for your family
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setCategoryManagerOpen(true)}>
            <Settings className="h-4 w-4" />
            Manage Categories
          </Button>
          <UploadButton householdId={householdId} categories={categories || []} />
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <VaultStats stats={stats} />}

      {/* Search and Filter */}
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories || []}
        totalDocuments={stats?.totalDocuments || 0}
      />

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
