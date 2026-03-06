"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { DocumentCategorizeDialog } from "./document-categorize-dialog";
import { DocumentStatusBadges } from "./document-status-badges";

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

export function DocumentsContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const [categoryFilter, setCategoryFilter] = useState<EstateCategory | undefined>(undefined);
  const [categorizeDialogOpen, setCategorizeDialogOpen] = useState(false);

  const documents = useQuery(
    api.estateDocuments.listEstateDocuments,
    householdId
      ? {
          householdId,
          category: categoryFilter,
        }
      : "skip",
  );

  const stats = useQuery(
    api.estateDocuments.getEstateDocumentStats,
    householdId ? { householdId } : "skip",
  );

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
          Activate estate administration to organize documents.
        </p>
        <Button variant="outline" asChild>
          <Link href="/estate">Go to Estate Overview</Link>
        </Button>
      </div>
    );
  }

  if (documents === undefined || stats === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="documents-content">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-4xl font-bold">Documents</h2>
          <p className="mt-1 text-muted-foreground">
            Tag and organize your vault documents for the estate process.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setCategorizeDialogOpen(true)}
          data-testid="categorize-document-button"
        >
          Categorize Document
        </Button>
      </div>

      {/* Stats summary */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold" data-testid="doc-stats-total">
              {stats.total}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-green-600" data-testid="doc-stats-verified">
              {stats.byVerification.find((v) => v.status === "verified")?.count ?? 0}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Needs Update</p>
            <p className="text-2xl font-bold text-amber-600" data-testid="doc-stats-needs-update">
              {stats.byVerification.find((v) => v.status === "needs_update")?.count ?? 0}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Unverified</p>
            <p
              className="text-2xl font-bold text-muted-foreground"
              data-testid="doc-stats-unverified"
            >
              {stats.byVerification.find((v) => v.status === "unverified")?.count ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2">
        <Select
          value={categoryFilter ?? "all"}
          onValueChange={(val) =>
            setCategoryFilter(val === "all" ? undefined : (val as EstateCategory))
          }
        >
          <SelectTrigger className="w-[200px]" data-testid="category-filter">
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

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="text-center py-12 space-y-4 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            {categoryFilter
              ? `No documents in the "${CATEGORY_LABELS[categoryFilter]}" category.`
              : "No documents have been categorized yet."}
          </p>
          <p className="text-sm text-muted-foreground">
            Use "Categorize Document" to tag your vault documents for the estate process.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="rounded-lg border p-4 space-y-2"
              data-testid={`estate-doc-${doc._id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{doc.vaultDocumentName}</p>
                  <p className="text-sm text-muted-foreground">
                    {CATEGORY_LABELS[doc.estateCategory]} &middot;{" "}
                    {formatFileSize(doc.vaultDocumentFileSize)}
                  </p>
                </div>
                <DocumentStatusBadges
                  verificationStatus={doc.verificationStatus}
                  submittedTo={doc.submittedTo}
                  submittedAt={doc.submittedAt}
                  estateDocumentId={doc._id}
                  householdId={doc.householdId}
                />
              </div>
              {doc.notes && <p className="text-sm text-muted-foreground">{doc.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <DocumentCategorizeDialog
        open={categorizeDialogOpen}
        onOpenChange={setCategorizeDialogOpen}
        householdId={household._id}
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
