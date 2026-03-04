"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Id } from "@/convex/_generated/dataModel";
import { CommunicationForm } from "./communication-form";

type CommunicationMethod =
  | "phone"
  | "email"
  | "mail"
  | "in_person"
  | "online_portal"
  | "fax"
  | "other";

type CommunicationCategory =
  | "financial_institution"
  | "government_agency"
  | "insurance_company"
  | "legal"
  | "beneficiary"
  | "utility"
  | "employer"
  | "other";

interface Communication {
  _id: Id<"estateCommunications">;
  _creationTime: number;
  householdId: Id<"households">;
  activationId: Id<"estateActivations">;
  recipientName: string;
  recipientOrganization?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  method: CommunicationMethod;
  subject: string;
  summary: string;
  category: CommunicationCategory;
  relatedAssetId?: Id<"estateAssets">;
  followUpDate?: number;
  followUpNotes?: string;
  followUpCompleted?: boolean;
  followUpCompletedAt?: number;
  attachmentDocIds?: Id<"vaultDocuments">[];
  loggedBy: Id<"profiles">;
  communicationDate: number;
  updatedAt: number;
}

const CATEGORY_LABELS: Record<CommunicationCategory, string> = {
  financial_institution: "Financial Institution",
  government_agency: "Government Agency",
  insurance_company: "Insurance Company",
  legal: "Legal",
  beneficiary: "Beneficiary",
  utility: "Utility",
  employer: "Employer",
  other: "Other",
};

const METHOD_LABELS: Record<CommunicationMethod, string> = {
  phone: "Phone",
  email: "Email",
  mail: "Mail",
  in_person: "In Person",
  online_portal: "Online Portal",
  fax: "Fax",
  other: "Other",
};

interface CommunicationLogProps {
  communications: Communication[];
  categoryFilter: CommunicationCategory | undefined;
  onCategoryFilterChange: (category: CommunicationCategory | undefined) => void;
  householdId: Id<"households">;
}

export function CommunicationLog({
  communications,
  categoryFilter,
  onCategoryFilterChange,
  householdId,
}: CommunicationLogProps) {
  const [editingComm, setEditingComm] = useState<Communication | null>(null);

  return (
    <div className="space-y-4" data-testid="communication-log">
      <div className="flex flex-wrap gap-2">
        <Select
          value={categoryFilter ?? "all"}
          onValueChange={(val) =>
            onCategoryFilterChange(val === "all" ? undefined : (val as CommunicationCategory))
          }
        >
          <SelectTrigger data-testid="comm-category-filter">
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

      {communications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground" data-testid="comm-log-empty">
          {categoryFilter
            ? "No communications match the selected filter."
            : "No communications have been logged yet."}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Follow-up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communications.map((comm) => (
                  <TableRow
                    key={comm._id}
                    className="cursor-pointer"
                    onClick={() => setEditingComm(comm)}
                    data-testid={`comm-row-${comm._id}`}
                  >
                    <TableCell className="text-sm">
                      {new Date(comm.communicationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{comm.recipientName}</div>
                      {comm.recipientOrganization && (
                        <div className="text-xs text-muted-foreground">
                          {comm.recipientOrganization}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{comm.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[comm.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{METHOD_LABELS[comm.method]}</TableCell>
                    <TableCell>
                      {comm.followUpDate && (
                        <Badge
                          variant={comm.followUpCompleted ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {comm.followUpCompleted
                            ? "Done"
                            : new Date(comm.followUpDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {communications.map((comm) => (
              <button
                key={comm._id}
                type="button"
                className="rounded-lg border p-4 text-left space-y-1.5 hover:bg-muted/50 transition-colors"
                onClick={() => setEditingComm(comm)}
                data-testid={`comm-card-${comm._id}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{comm.recipientName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comm.communicationDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{comm.subject}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[comm.category]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {METHOD_LABELS[comm.method]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {editingComm && (
        <CommunicationForm
          open={!!editingComm}
          onOpenChange={(open) => {
            if (!open) setEditingComm(null);
          }}
          householdId={householdId}
          mode="edit"
          communication={editingComm}
        />
      )}
    </div>
  );
}
