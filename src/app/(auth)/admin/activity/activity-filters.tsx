"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityFiltersProps {
  actionType: string | undefined;
  setActionType: (value: string | undefined) => void;
  module: string | undefined;
  setModule: (value: string | undefined) => void;
  startDate: number | undefined;
  setStartDate: (value: number | undefined) => void;
  endDate: number | undefined;
  setEndDate: (value: number | undefined) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  counts?: {
    total: number;
    byActionType: Record<string, number>;
    byModule: Record<string, number>;
  };
}

const ACTION_TYPE_GROUPS = [
  {
    label: "Document Actions",
    types: [
      { value: "document_uploaded", label: "Document uploaded" },
      { value: "document_viewed", label: "Document viewed" },
      { value: "document_updated", label: "Document updated" },
      { value: "document_deleted", label: "Document deleted" },
    ],
  },
  {
    label: "Wisdom Actions",
    types: [
      { value: "wisdom_created", label: "Wisdom created" },
      { value: "wisdom_updated", label: "Wisdom updated" },
      { value: "wisdom_deleted", label: "Wisdom deleted" },
    ],
  },
  {
    label: "Letter Actions",
    types: [{ value: "letter_created", label: "Letter created" }],
  },
  {
    label: "Household Actions",
    types: [
      { value: "household_created", label: "Household created" },
      { value: "household_updated", label: "Household updated" },
      { value: "member_invited", label: "Member invited" },
      { value: "member_joined", label: "Member joined" },
      { value: "member_removed", label: "Member removed" },
      { value: "member_role_updated", label: "Member role updated" },
    ],
  },
  {
    label: "Financial Actions",
    types: [
      { value: "asset_created", label: "Asset created" },
      { value: "asset_updated", label: "Asset updated" },
      { value: "asset_deleted", label: "Asset deleted" },
      { value: "policy_created", label: "Policy created" },
      { value: "policy_updated", label: "Policy updated" },
      { value: "policy_deleted", label: "Policy deleted" },
    ],
  },
  {
    label: "Family Actions",
    types: [
      { value: "family_unit_created", label: "Family unit created" },
      { value: "family_unit_updated", label: "Family unit updated" },
      { value: "family_unit_deleted", label: "Family unit deleted" },
      { value: "family_member_created", label: "Family member created" },
      { value: "family_member_updated", label: "Family member updated" },
      { value: "family_member_deleted", label: "Family member deleted" },
    ],
  },
  {
    label: "Category Actions",
    types: [
      { value: "category_created", label: "Category created" },
      { value: "category_updated", label: "Category updated" },
      { value: "category_deleted", label: "Category deleted" },
    ],
  },
  {
    label: "Other",
    types: [
      { value: "plan_updated", label: "Plan updated" },
      { value: "suggestion_completed", label: "Suggestion completed" },
      { value: "other", label: "Other" },
    ],
  },
];

const MODULES = [
  { value: "vault", label: "Vault" },
  { value: "wisdom", label: "Wisdom" },
  { value: "financial", label: "Financial" },
  { value: "family", label: "Family" },
  { value: "legacy", label: "Legacy" },
  { value: "household", label: "Household" },
  { value: "suggestion", label: "Suggestion" },
];

export function ActivityFilters({
  actionType,
  setActionType,
  module,
  setModule,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
  hasActiveFilters,
  counts,
}: ActivityFiltersProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        <Select
          value={actionType || "all"}
          onValueChange={(v) => setActionType(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ACTION_TYPE_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {group.label}
                </div>
                {group.types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                    {counts?.byActionType[type.value] && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({counts.byActionType[type.value]})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={module || "all"}
          onValueChange={(v) => setModule(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All modules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modules</SelectItem>
            {MODULES.map((mod) => (
              <SelectItem key={mod.value} value={mod.value}>
                {mod.label}
                {counts?.byModule[mod.value] && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({counts.byModule[mod.value]})
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="date"
          aria-label="Start date"
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={startDate ? new Date(startDate).toISOString().split("T")[0] : ""}
          onChange={(e) =>
            setStartDate(e.target.value ? new Date(e.target.value).getTime() : undefined)
          }
        />

        <input
          type="date"
          aria-label="End date"
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={endDate ? new Date(endDate).toISOString().split("T")[0] : ""}
          onChange={(e) =>
            setEndDate(
              e.target.value ? new Date(`${e.target.value}T23:59:59`).getTime() : undefined,
            )
          }
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 px-2 text-xs shrink-0">
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
