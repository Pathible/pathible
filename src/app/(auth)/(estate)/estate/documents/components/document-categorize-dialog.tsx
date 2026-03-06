"use client";

import { useMutation, useQuery } from "convex/react";
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

type EstateCategory =
  | "will"
  | "trust"
  | "death_certificate"
  | "insurance_claim"
  | "deed"
  | "tax_return"
  | "bank_statement"
  | "court_filing"
  | "correspondence"
  | "beneficiary_designation"
  | "other";

const CATEGORY_LABELS: Record<EstateCategory, string> = {
  will: "Will",
  trust: "Trust",
  death_certificate: "Death Certificate",
  insurance_claim: "Insurance Claim",
  deed: "Deed",
  tax_return: "Tax Return",
  bank_statement: "Bank Statement",
  court_filing: "Court Filing",
  correspondence: "Correspondence",
  beneficiary_designation: "Beneficiary Designation",
  other: "Other",
};

interface DocumentCategorizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: Id<"households">;
}

export function DocumentCategorizeDialog({
  open,
  onOpenChange,
  householdId,
}: DocumentCategorizeDialogProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [category, setCategory] = useState<EstateCategory | "">("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vaultResult = useQuery(api.vault.list, open ? { householdId, limit: 100 } : "skip");
  const vaultDocuments = vaultResult?.documents;

  const categorize = useMutation(api.estateDocuments.categorizeDocument);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !category) return;

    setIsSubmitting(true);
    try {
      await categorize({
        vaultDocumentId: selectedDocId as Id<"vaultDocuments">,
        householdId,
        estateCategory: category,
        notes: notes.trim() || undefined,
      });
      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDocId("");
    setCategory("");
    setNotes("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Categorize Document</DialogTitle>
            <DialogDescription>
              Select a vault document and assign an estate category for tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vault-doc">Vault Document</Label>
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger data-testid="vault-doc-select">
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  {vaultDocuments?.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                  {vaultDocuments?.length === 0 && (
                    <SelectItem value="_none" disabled>
                      No documents in vault
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estate-category">Estate Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as EstateCategory)}>
                <SelectTrigger data-testid="estate-category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-notes">Notes (optional)</Label>
              <Textarea
                id="doc-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional context for this document..."
                maxLength={2000}
                className="min-h-[80px]"
                data-testid="categorize-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedDocId || !category || isSubmitting}
              data-testid="categorize-submit"
            >
              {isSubmitting ? "Saving..." : "Categorize"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
