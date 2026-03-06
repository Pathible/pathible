"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Id } from "@/convex/_generated/dataModel";
import { AssetCard } from "./asset-card";
import { AssetDetailDialog } from "./asset-detail-dialog";

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

interface Asset {
  _id: Id<"estateAssets">;
  _creationTime: number;
  householdId: Id<"households">;
  activationId: Id<"estateActivations">;
  name: string;
  description?: string;
  category: AssetCategory;
  status: AssetStatus;
  estimatedValue?: number;
  institution?: string;
  accountNumber?: string;
  beneficiary?: string;
  notes?: string;
  sourceType?: string;
  sourceId?: string;
  createdBy: Id<"profiles">;
  updatedAt: number;
}

const STATUS_LABELS: Record<AssetStatus, string> = {
  identified: "Found",
  verified: "Confirmed",
  institution_contacted: "Reached Out",
  in_transfer: "In Progress",
  closed: "Completed",
  distributed: "Passed On",
};

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  financial_account: "Financial Account",
  real_estate: "Real Estate",
  vehicle: "Vehicle",
  insurance_policy: "Insurance Policy",
  retirement_account: "Retirement Account",
  business_interest: "Business Interest",
  personal_property: "Personal Property",
  digital_asset: "Digital Asset",
  other: "Other",
};

interface AssetListProps {
  assets: Asset[];
  statusFilter: AssetStatus | undefined;
  categoryFilter: AssetCategory | undefined;
  onStatusFilterChange: (status: AssetStatus | undefined) => void;
  onCategoryFilterChange: (category: AssetCategory | undefined) => void;
}

export function AssetList({
  assets,
  statusFilter,
  categoryFilter,
  onStatusFilterChange,
  onCategoryFilterChange,
}: AssetListProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<Id<"estateAssets"> | null>(null);

  const selectedAsset = selectedAssetId ? assets.find((a) => a._id === selectedAssetId) : null;

  return (
    <div className="space-y-4" data-testid="asset-list">
      <div className="flex flex-wrap gap-2">
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(val) =>
            onStatusFilterChange(val === "all" ? undefined : (val as AssetStatus))
          }
        >
          <SelectTrigger data-testid="asset-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter ?? "all"}
          onValueChange={(val) =>
            onCategoryFilterChange(val === "all" ? undefined : (val as AssetCategory))
          }
        >
          <SelectTrigger data-testid="asset-category-filter">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground" data-testid="asset-list-empty">
          {statusFilter || categoryFilter
            ? "No assets match the selected filters."
            : 'No assets have been added yet. Click "Add Asset" to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard
              key={asset._id}
              asset={asset}
              onClick={() => setSelectedAssetId(asset._id)}
            />
          ))}
        </div>
      )}

      {selectedAsset && (
        <AssetDetailDialog
          open={!!selectedAssetId}
          onOpenChange={(open) => {
            if (!open) setSelectedAssetId(null);
          }}
          householdId={selectedAsset.householdId}
          mode="edit"
          asset={selectedAsset}
        />
      )}
    </div>
  );
}
