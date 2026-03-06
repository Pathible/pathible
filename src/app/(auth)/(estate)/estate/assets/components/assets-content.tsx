"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { AssetDetailDialog } from "./asset-detail-dialog";
import { AssetList } from "./asset-list";
import { AssetStatusPipeline } from "./asset-status-pipeline";

type AssetCategory =
  | "financial_account"
  | "real_estate"
  | "vehicle"
  | "insurance_policy"
  | "retirement_account"
  | "business_interest"
  | "personal_property"
  | "digital_asset"
  | "other";

type AssetStatus =
  | "identified"
  | "verified"
  | "institution_contacted"
  | "in_transfer"
  | "closed"
  | "distributed";

export function AssetsContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const [statusFilter, setStatusFilter] = useState<AssetStatus | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | undefined>(undefined);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const assets = useQuery(
    api.estateAssets.listAssets,
    householdId
      ? {
          householdId,
          status: statusFilter,
          category: categoryFilter,
        }
      : "skip",
  );

  const stats = useQuery(api.estateAssets.getAssetStats, householdId ? { householdId } : "skip");

  if (!isUserLoaded || households === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!household || !household.estateMode) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          Activate estate administration to start tracking assets.
        </p>
        <Button variant="outline" asChild>
          <Link href="/estate">Go to Estate Overview</Link>
        </Button>
      </div>
    );
  }

  if (assets === undefined || stats === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="assets-content">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-4xl font-bold">Assets</h2>
          <p className="mt-1 text-muted-foreground">
            Keep track of assets as you work through the administration process.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setCreateDialogOpen(true)}
          data-testid="add-asset-button"
        >
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <AssetStatusPipeline stats={stats} />

      <AssetList
        assets={assets}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusFilterChange={setStatusFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      <AssetDetailDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        householdId={household._id}
        mode="create"
      />
    </div>
  );
}
