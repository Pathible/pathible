"use client";

import { useMutation, useQuery } from "convex/react";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
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

const CATEGORY_OPTIONS: Array<{ value: AssetCategory; label: string }> = [
  { value: "financial_account", label: "Financial Account" },
  { value: "real_estate", label: "Real Estate" },
  { value: "vehicle", label: "Vehicle" },
  { value: "insurance_policy", label: "Insurance Policy" },
  { value: "retirement_account", label: "Retirement Account" },
  { value: "business_interest", label: "Business Interest" },
  { value: "personal_property", label: "Personal Property" },
  { value: "digital_asset", label: "Digital Asset" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS: Array<{ value: AssetStatus; label: string }> = [
  { value: "identified", label: "Found" },
  { value: "verified", label: "Confirmed" },
  { value: "institution_contacted", label: "Reached Out" },
  { value: "in_transfer", label: "In Progress" },
  { value: "closed", label: "Completed" },
  { value: "distributed", label: "Passed On" },
];

const STATUS_COLORS: Record<AssetStatus, string> = {
  identified: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  verified: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  institution_contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  in_transfer: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  closed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  distributed: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

interface Asset {
  _id: Id<"estateAssets">;
  name: string;
  description?: string;
  category: AssetCategory;
  status: AssetStatus;
  estimatedValue?: number;
  institution?: string;
  accountNumber?: string;
  beneficiary?: string;
  notes?: string;
  householdId: Id<"households">;
}

interface AssetDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: Id<"households">;
  mode: "create" | "edit";
  asset?: Asset;
}

export function AssetDetailDialog({
  open,
  onOpenChange,
  householdId,
  mode,
  asset,
}: AssetDetailDialogProps) {
  const [name, setName] = useState(asset?.name ?? "");
  const [description, setDescription] = useState(asset?.description ?? "");
  const [category, setCategory] = useState<AssetCategory>(asset?.category ?? "financial_account");
  const [estimatedValue, setEstimatedValue] = useState(
    asset?.estimatedValue !== undefined ? String(asset.estimatedValue) : "",
  );
  const [institution, setInstitution] = useState(asset?.institution ?? "");
  const [accountNumber, setAccountNumber] = useState(asset?.accountNumber ?? "");
  const [beneficiary, setBeneficiary] = useState(asset?.beneficiary ?? "");
  const [notes, setNotes] = useState(asset?.notes ?? "");
  const [newStatus, setNewStatus] = useState<AssetStatus | "">(asset?.status ?? "");
  const [statusNotes, setStatusNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAsset = useMutation(api.estateAssets.createAsset);
  const updateAsset = useMutation(api.estateAssets.updateAsset);
  const updateStatus = useMutation(api.estateAssets.updateAssetStatus);

  const statusHistory = useQuery(
    api.estateAssets.getAssetStatusHistory,
    mode === "edit" && asset ? { assetId: asset._id } : "skip",
  );

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("financial_account");
    setEstimatedValue("");
    setInstitution("");
    setAccountNumber("");
    setBeneficiary("");
    setNotes("");
    setNewStatus("");
    setStatusNotes("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSubmitting(true);
    try {
      const parsedValue = estimatedValue ? Number.parseFloat(estimatedValue) : undefined;
      const value = parsedValue && !Number.isNaN(parsedValue) ? parsedValue : undefined;

      if (mode === "create") {
        await createAsset({
          householdId,
          name: trimmedName,
          description: description.trim() || undefined,
          category,
          estimatedValue: value,
          institution: institution.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          beneficiary: beneficiary.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else if (asset) {
        await updateAsset({
          assetId: asset._id,
          name: trimmedName,
          description: description.trim() || undefined,
          category,
          estimatedValue: value,
          institution: institution.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          beneficiary: beneficiary.trim() || undefined,
          notes: notes.trim() || undefined,
        });

        if (newStatus && newStatus !== asset.status) {
          await updateStatus({
            assetId: asset._id,
            newStatus,
            notes: statusNotes.trim() || undefined,
          });
        }
      }

      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add Asset" : "Edit Asset"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new asset to the estate inventory."
                : "Update asset details or change its status."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-name">Name</Label>
              <Input
                id="asset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chase Savings Account"
                maxLength={255}
                data-testid="asset-name-input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asset-category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as AssetCategory)}>
                <SelectTrigger
                  id="asset-category"
                  className="w-full"
                  data-testid="asset-category-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="asset-value">Estimated Value</Label>
                <Input
                  id="asset-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="0.00"
                  data-testid="asset-value-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asset-institution">Institution</Label>
                <Input
                  id="asset-institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g., Chase Bank"
                  data-testid="asset-institution-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="asset-account">Account Number</Label>
                <Input
                  id="asset-account"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g., ****1234"
                  data-testid="asset-account-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asset-beneficiary">Beneficiary</Label>
                <Input
                  id="asset-beneficiary"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  data-testid="asset-beneficiary-input"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asset-description">Description (optional)</Label>
              <Textarea
                id="asset-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details..."
                maxLength={1000}
                className="min-h-[60px]"
                data-testid="asset-description-input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asset-notes">Notes (optional)</Label>
              <Textarea
                id="asset-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes..."
                maxLength={1000}
                className="min-h-[60px]"
                data-testid="asset-notes-input"
              />
            </div>

            {mode === "edit" && asset && (
              <>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="asset-status">Update Status</Label>
                  <Select
                    value={newStatus || asset.status}
                    onValueChange={(val) => setNewStatus(val as AssetStatus)}
                  >
                    <SelectTrigger
                      id="asset-status"
                      className="w-full"
                      data-testid="asset-status-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newStatus && newStatus !== asset.status && (
                  <div className="grid gap-2">
                    <Label htmlFor="status-notes">Status Change Notes (optional)</Label>
                    <Input
                      id="status-notes"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Reason for status change..."
                      data-testid="asset-status-notes-input"
                    />
                  </div>
                )}

                {statusHistory && statusHistory.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Status History</Label>
                      <div
                        className="space-y-2 max-h-48 overflow-y-auto"
                        data-testid="asset-status-history"
                      >
                        {statusHistory.map((change) => {
                          const fromLabel =
                            STATUS_OPTIONS.find((o) => o.value === change.previousStatus)?.label ??
                            change.previousStatus;
                          const toLabel =
                            STATUS_OPTIONS.find((o) => o.value === change.newStatus)?.label ??
                            change.newStatus;
                          return (
                            <div key={change._id} className="flex items-start gap-2 text-sm">
                              <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-[10px] border-0",
                                      STATUS_COLORS[change.previousStatus],
                                    )}
                                  >
                                    {fromLabel}
                                  </Badge>
                                  <span className="text-muted-foreground text-xs">to</span>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-[10px] border-0",
                                      STATUS_COLORS[change.newStatus],
                                    )}
                                  >
                                    {toLabel}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(change.changedAt).toLocaleDateString()}
                                  {change.notes && ` — ${change.notes}`}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              data-testid="asset-dialog-submit"
            >
              {isSubmitting
                ? mode === "create"
                  ? "Adding..."
                  : "Saving..."
                : mode === "create"
                  ? "Add Asset"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
