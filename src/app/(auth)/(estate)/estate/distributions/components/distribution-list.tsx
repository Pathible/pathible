"use client";

import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DistributionForm } from "./distribution-form";

type DistributionMethod =
  | "direct_transfer"
  | "wire_transfer"
  | "check"
  | "title_transfer"
  | "in_kind"
  | "other";

interface Distribution {
  _id: Id<"estateDistributions">;
  _creationTime: number;
  householdId: Id<"households">;
  activationId: Id<"estateActivations">;
  assetId: Id<"estateAssets">;
  beneficiaryName: string;
  beneficiaryRelationship?: string;
  description?: string;
  value?: number;
  distributionDate: number;
  method: DistributionMethod;
  receiptDocId?: Id<"vaultDocuments">;
  notes?: string;
  distributedBy: Id<"profiles">;
  updatedAt: number;
}

interface Asset {
  _id: Id<"estateAssets">;
  name: string;
  householdId: Id<"households">;
}

const METHOD_LABELS: Record<DistributionMethod, string> = {
  direct_transfer: "Direct Transfer",
  wire_transfer: "Wire Transfer",
  check: "Check",
  title_transfer: "Title Transfer",
  in_kind: "In Kind",
  other: "Other",
};

interface DistributionListProps {
  distributions: Distribution[];
  assets: Asset[];
  householdId: Id<"households">;
}

export function DistributionList({ distributions, assets, householdId }: DistributionListProps) {
  const [editingDist, setEditingDist] = useState<Distribution | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"estateDistributions"> | null>(null);
  const deleteDistribution = useMutation(api.estateDistributions.deleteDistribution);

  const assetMap = new Map(assets.map((a) => [a._id, a]));

  const handleDelete = async (distributionId: Id<"estateDistributions">) => {
    setDeletingId(distributionId);
    try {
      await deleteDistribution({ distributionId });
    } finally {
      setDeletingId(null);
    }
  };

  if (distributions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="dist-list-empty">
        No distributions have been recorded yet.
      </div>
    );
  }

  return (
    <div data-testid="distribution-list">
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Beneficiary</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributions.map((dist) => {
              const asset = assetMap.get(dist.assetId);
              return (
                <TableRow
                  key={dist._id}
                  className="cursor-pointer"
                  onClick={() => setEditingDist(dist)}
                  data-testid={`dist-row-${dist._id}`}
                >
                  <TableCell className="text-sm">
                    {new Date(dist.distributionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{dist.beneficiaryName}</div>
                    {dist.beneficiaryRelationship && (
                      <div className="text-xs text-muted-foreground">
                        {dist.beneficiaryRelationship}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm truncate max-w-[150px]">
                    {asset?.name ?? "Unknown asset"}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {dist.value !== undefined ? `$${dist.value.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {METHOD_LABELS[dist.method]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={deletingId === dist._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dist._id);
                      }}
                      data-testid={`dist-delete-${dist._id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {distributions.map((dist) => {
          const asset = assetMap.get(dist.assetId);
          return (
            <button
              key={dist._id}
              type="button"
              className="rounded-lg border p-4 text-left space-y-1.5 hover:bg-muted/50 transition-colors"
              onClick={() => setEditingDist(dist)}
              data-testid={`dist-card-${dist._id}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{dist.beneficiaryName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(dist.distributionDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {asset?.name ?? "Unknown asset"}
              </p>
              <div className="flex items-center gap-2">
                {dist.value !== undefined && (
                  <span className="text-sm font-medium tabular-nums">
                    ${dist.value.toLocaleString()}
                  </span>
                )}
                <Badge variant="secondary" className="text-xs">
                  {METHOD_LABELS[dist.method]}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {editingDist && (
        <DistributionForm
          open={!!editingDist}
          onOpenChange={(open) => {
            if (!open) setEditingDist(null);
          }}
          householdId={householdId}
          assets={assets}
          mode="edit"
          distribution={editingDist}
        />
      )}
    </div>
  );
}
