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
import { ShareDocumentDialog } from "./share-document-dialog";
import { ShareManagementList } from "./share-management-list";

type ShareStatus = "active" | "expired" | "revoked" | "exhausted";

export function SharesContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const [statusFilter, setStatusFilter] = useState<ShareStatus | undefined>(undefined);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const shares = useQuery(
    api.estateDocuments.listDocumentShares,
    householdId
      ? {
          householdId,
          status: statusFilter,
        }
      : "skip",
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
          Estate administration must be active to manage document sharing.
        </p>
        <Button variant="outline" asChild>
          <Link href="/estate">Go to Estate Overview</Link>
        </Button>
      </div>
    );
  }

  if (shares === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeCount = shares.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6" data-testid="shares-content">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Document Sharing</h2>
          <p className="mt-1 text-muted-foreground">
            Create secure, time-limited links to share documents with attorneys and beneficiaries.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShareDialogOpen(true)}
          data-testid="create-share-button"
        >
          Share a Document
        </Button>
      </div>

      {/* Summary */}
      {shares.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600" data-testid="shares-active-count">
              {activeCount}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold" data-testid="shares-total-count">
              {shares.length}
            </p>
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(val) => setStatusFilter(val === "all" ? undefined : (val as ShareStatus))}
        >
          <SelectTrigger className="w-[180px]" data-testid="share-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="exhausted">Exhausted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Share list */}
      {shares.length === 0 ? (
        <div className="text-center py-12 space-y-4 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            {statusFilter
              ? `No ${statusFilter} shares found.`
              : "No documents have been shared yet."}
          </p>
          <p className="text-sm text-muted-foreground">
            Share documents securely with attorneys, beneficiaries, and institutions.
          </p>
        </div>
      ) : (
        <ShareManagementList shares={shares} />
      )}

      <ShareDocumentDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        householdId={household._id}
      />
    </div>
  );
}
