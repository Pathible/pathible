"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

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
  name: string;
  description?: string;
  category: AssetCategory;
  status: AssetStatus;
  estimatedValue?: number;
  institution?: string;
}

const STATUS_CONFIG: Record<AssetStatus, { label: string; className: string }> = {
  identified: {
    label: "Found",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  verified: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  institution_contacted: {
    label: "Reached Out",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  in_transfer: {
    label: "In Progress",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  closed: {
    label: "Completed",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  distributed: {
    label: "Passed On",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
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

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const statusConfig = STATUS_CONFIG[asset.status];

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={onClick}
      data-testid={`asset-card-${asset._id}`}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-snug line-clamp-2">{asset.name}</h3>
          <Badge variant="secondary" className={cn("shrink-0 border-0", statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[asset.category]}</p>

        {asset.institution && (
          <p className="text-xs text-muted-foreground truncate">{asset.institution}</p>
        )}

        {asset.estimatedValue !== undefined && asset.estimatedValue > 0 && (
          <p className="text-sm font-medium tabular-nums">
            ${asset.estimatedValue.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
