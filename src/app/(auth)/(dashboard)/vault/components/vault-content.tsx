"use client";

import { useMutation, useQuery } from "convex/react";
import { Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AuthLoadingSpinner,
  ConnectionErrorCard,
  SetupRequiredCard,
  SignInRequiredCard,
} from "@/components/auth-states";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuthenticatedHousehold } from "@/hooks/use-authenticated-household";
import { useEstateMode } from "@/hooks/use-estate-mode";
import { CategoryManager } from "./category-manager";
import { DocumentList } from "./document-list";
import { SearchAndFilter } from "./search-and-filter";
import { UploadButton } from "./upload-button";
import { VaultStats } from "./vault-stats";

export function VaultContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  // Use consolidated auth + household hook
  const { householdId, isLoading: isAuthLoading, error } = useAuthenticatedHousehold();
  const { isEstateMode } = useEstateMode();

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
  // Extract documents from paginated response (with type guard for safety)
  const documents = Array.isArray(documentsResponse?.documents) ? documentsResponse.documents : [];
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

  // Handle auth loading and error states
  if (isAuthLoading) {
    return <AuthLoadingSpinner />;
  }

  if (error === "not-authenticated") {
    return <SignInRequiredCard context="secure document vault" />;
  }

  if (error === "connection-failed") {
    return <ConnectionErrorCard />;
  }

  if (error === "no-household" || !householdId) {
    return <SetupRequiredCard context="important documents" />;
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
            Everything your family needs, in one secure place they can actually find
          </p>
        </div>
        {!isEstateMode && (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => setCategoryManagerOpen(true)}
              data-tour="vault-manage-categories"
            >
              <Settings className="h-4 w-4" />
              Manage Categories
            </Button>
            <UploadButton
              householdId={householdId}
              categories={categories || []}
              data-tour="vault-upload"
            />
          </div>
        )}
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

      {/* Tags & Collections (Heritage+ feature) */}
      {/* TODO Think about how this works more in the future */}
      {/* <FeatureGate feature={FEATURES.VAULT_TAGS_COLLECTIONS}>
        <TagsCollections />
      </FeatureGate> */}

      {/* Coming Soon Features */}
      {/* TODO Hiding this for now until these features for now until ready */}
      {/* <div className="grid gap-4 md:grid-cols-2">
        <ComingSoonCard
          feature={FEATURES.VAULT_VOICE_UPLOADS}
          title="Voice Recordings"
          description="Record oral histories and voice memos to preserve your family's stories in your own voice."
          icon={<Mic className="h-5 w-5" />}
        />
        <ComingSoonCard
          feature={FEATURES.VAULT_GUIDED_ORGANIZATION}
          title="Guided Organization"
          description="Step-by-step wizards to help you organize important documents like wills, insurance, and medical records."
          icon={<Sparkles className="h-5 w-5" />}
        />
      </div> */}

      {/* Documents List */}
      <DocumentList
        documents={documents}
        categories={categories || []}
        householdId={householdId}
        isLoading={isLoading}
        isReadOnly={isEstateMode}
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
