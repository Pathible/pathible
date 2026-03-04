"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type DistributionMethod =
  | "direct_transfer"
  | "wire_transfer"
  | "check"
  | "title_transfer"
  | "in_kind"
  | "other";

const METHOD_OPTIONS: Array<{ value: DistributionMethod; label: string }> = [
  { value: "direct_transfer", label: "Direct Transfer" },
  { value: "wire_transfer", label: "Wire Transfer" },
  { value: "check", label: "Check" },
  { value: "title_transfer", label: "Title Transfer" },
  { value: "in_kind", label: "In Kind" },
  { value: "other", label: "Other" },
];

interface Asset {
  _id: Id<"estateAssets">;
  name: string;
}

interface Distribution {
  _id: Id<"estateDistributions">;
  assetId: Id<"estateAssets">;
  beneficiaryName: string;
  beneficiaryRelationship?: string;
  description?: string;
  value?: number;
  distributionDate: number;
  method: DistributionMethod;
  notes?: string;
}

interface DistributionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: Id<"households">;
  assets: Asset[];
  mode: "create" | "edit";
  distribution?: Distribution;
}

function formatDateForInput(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

export function DistributionForm({
  open,
  onOpenChange,
  householdId,
  assets,
  mode,
  distribution,
}: DistributionFormProps) {
  const [assetId, setAssetId] = useState<string>(distribution?.assetId ?? "");
  const [beneficiaryName, setBeneficiaryName] = useState(distribution?.beneficiaryName ?? "");
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState(
    distribution?.beneficiaryRelationship ?? "",
  );
  const [description, setDescription] = useState(distribution?.description ?? "");
  const [value, setValue] = useState(
    distribution?.value !== undefined ? String(distribution.value) : "",
  );
  const [distributionDate, setDistributionDate] = useState(
    distribution
      ? formatDateForInput(distribution.distributionDate)
      : formatDateForInput(Date.now()),
  );
  const [method, setMethod] = useState<DistributionMethod>(
    distribution?.method ?? "direct_transfer",
  );
  const [notes, setNotes] = useState(distribution?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordDistribution = useMutation(api.estateDistributions.recordDistribution);
  const updateDistribution = useMutation(api.estateDistributions.updateDistribution);

  const resetForm = () => {
    setAssetId("");
    setBeneficiaryName("");
    setBeneficiaryRelationship("");
    setDescription("");
    setValue("");
    setDistributionDate(formatDateForInput(Date.now()));
    setMethod("direct_transfer");
    setNotes("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = beneficiaryName.trim();
    if (!trimmedName || !assetId) return;

    setIsSubmitting(true);
    try {
      const parsedValue = value ? Number.parseFloat(value) : undefined;
      const distValue = parsedValue && !Number.isNaN(parsedValue) ? parsedValue : undefined;
      const distDate = new Date(distributionDate).getTime();

      if (mode === "create") {
        await recordDistribution({
          householdId,
          assetId: assetId as Id<"estateAssets">,
          beneficiaryName: trimmedName,
          beneficiaryRelationship: beneficiaryRelationship.trim() || undefined,
          description: description.trim() || undefined,
          value: distValue,
          distributionDate: distDate,
          method,
          notes: notes.trim() || undefined,
        });
      } else if (distribution) {
        await updateDistribution({
          distributionId: distribution._id,
          beneficiaryName: trimmedName,
          beneficiaryRelationship: beneficiaryRelationship.trim() || undefined,
          description: description.trim() || undefined,
          value: distValue,
          distributionDate: distDate,
          method,
          notes: notes.trim() || undefined,
        });
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
            <DialogTitle>
              {mode === "create" ? "Record Distribution" : "Edit Distribution"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Record an asset distribution to a beneficiary."
                : "Update this distribution record."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dist-asset">Asset</Label>
              <Select value={assetId} onValueChange={setAssetId} disabled={mode === "edit"}>
                <SelectTrigger id="dist-asset" className="w-full" data-testid="dist-asset-select">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset._id} value={asset._id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dist-beneficiary">Beneficiary Name</Label>
                <Input
                  id="dist-beneficiary"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  maxLength={255}
                  data-testid="dist-beneficiary-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dist-relationship">Relationship</Label>
                <Input
                  id="dist-relationship"
                  value={beneficiaryRelationship}
                  onChange={(e) => setBeneficiaryRelationship(e.target.value)}
                  placeholder="e.g., Daughter"
                  data-testid="dist-relationship-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dist-value">Value</Label>
                <Input
                  id="dist-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  data-testid="dist-value-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dist-method">Method</Label>
                <Select
                  value={method}
                  onValueChange={(val) => setMethod(val as DistributionMethod)}
                >
                  <SelectTrigger
                    id="dist-method"
                    className="w-full"
                    data-testid="dist-method-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dist-date">Distribution Date</Label>
              <Input
                id="dist-date"
                type="date"
                value={distributionDate}
                onChange={(e) => setDistributionDate(e.target.value)}
                data-testid="dist-date-input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dist-description">Description (optional)</Label>
              <Textarea
                id="dist-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the distribution..."
                maxLength={1000}
                className="min-h-[60px]"
                data-testid="dist-description-input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dist-notes">Notes (optional)</Label>
              <Textarea
                id="dist-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes..."
                maxLength={1000}
                className="min-h-[60px]"
                data-testid="dist-notes-input"
              />
            </div>
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
              disabled={!beneficiaryName.trim() || !assetId || isSubmitting}
              data-testid="dist-form-submit"
            >
              {isSubmitting
                ? mode === "create"
                  ? "Recording..."
                  : "Saving..."
                : mode === "create"
                  ? "Record Distribution"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
