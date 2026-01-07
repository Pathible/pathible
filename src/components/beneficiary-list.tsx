"use client";

import { useQuery } from "convex/react";
import { Plus, Trash2, Users } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { PersonReference } from "@/lib/person-utils";
import { getRelationshipLabel } from "@/lib/person-utils";

export interface BeneficiaryEntry {
  id: string;
  person: PersonReference | null;
  percentage: number;
}

export interface BeneficiaryListProps {
  householdId: Id<"households">;
  value: BeneficiaryEntry[];
  onChange: (value: BeneficiaryEntry[]) => void;
  label?: string;
  helpText?: string;
  excludeIds?: string[];
  showPercentageTotal?: boolean;
  maxEntries?: number;
  disabled?: boolean;
  className?: string;
}

export function BeneficiaryList({
  householdId,
  value,
  onChange,
  label = "Beneficiaries",
  helpText,
  excludeIds = [],
  showPercentageTotal = true,
  maxEntries = 10,
  disabled = false,
  className,
}: BeneficiaryListProps) {
  // Ensure value is always an array (defensive check for legacy data)
  const safeValue = Array.isArray(value) ? value : [];

  const options = useQuery(api.persons.getPersonOptions, {
    householdId,
    includeCurrentUser: false,
  });

  // Generate unique ID for new entries
  const generateId = useCallback(() => {
    return `ben_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }, []);

  // Add new beneficiary row
  const handleAdd = useCallback(() => {
    if (safeValue.length >= maxEntries) return;
    onChange([
      ...safeValue,
      {
        id: generateId(),
        person: null,
        percentage: 0,
      },
    ]);
  }, [safeValue, onChange, generateId, maxEntries]);

  // Remove beneficiary row
  const handleRemove = useCallback(
    (id: string) => {
      onChange(safeValue.filter((entry) => entry.id !== id));
    },
    [safeValue, onChange],
  );

  // Update person selection
  const handlePersonChange = useCallback(
    (id: string, personId: string) => {
      const option = options?.find((o) => o.id === personId);
      if (!option && personId !== "manual") return;

      const updatedValue = safeValue.map((entry) => {
        if (entry.id !== id) return entry;

        if (personId === "manual") {
          return {
            ...entry,
            person: {
              sourceType: "manual" as const,
              fullName: "",
            },
          };
        }

        // At this point, we know option exists due to the guard at line 92
        if (!option) return entry;

        const person: PersonReference = {
          sourceType: option.type,
          familyMemberId: option.type === "familyMember" ? option.sourceId : undefined,
          keyContactId: option.type === "keyContact" ? option.sourceId : undefined,
          fullName: option.fullName,
          firstName: option.firstName,
          lastName: option.lastName,
          relationship: option.relationship,
          address: option.address,
          city: option.city,
          state: option.state,
          zipCode: option.zipCode,
          phone: option.phone,
          email: option.email,
          dateOfBirth: option.dateOfBirth,
        };

        return { ...entry, person };
      });

      onChange(updatedValue);
    },
    [safeValue, onChange, options],
  );

  // Update manual name entry
  const handleNameChange = useCallback(
    (id: string, name: string) => {
      onChange(
        safeValue.map((entry) => {
          if (entry.id !== id) return entry;
          return {
            ...entry,
            person: {
              ...entry.person,
              sourceType: "manual" as const,
              fullName: name,
            },
          };
        }),
      );
    },
    [safeValue, onChange],
  );

  // Update percentage
  const handlePercentageChange = useCallback(
    (id: string, percentage: string) => {
      const numValue = Number.parseInt(percentage, 10) || 0;
      onChange(
        safeValue.map((entry) => {
          if (entry.id !== id) return entry;
          return { ...entry, percentage: Math.min(100, Math.max(0, numValue)) };
        }),
      );
    },
    [safeValue, onChange],
  );

  // Calculate total percentage
  const totalPercentage = safeValue.reduce((sum, entry) => sum + (entry.percentage || 0), 0);

  // Get selected person IDs to exclude from dropdown
  const selectedIds = safeValue
    .filter((entry) => entry.person?.familyMemberId || entry.person?.keyContactId)
    .map((entry) => entry.person?.familyMemberId || entry.person?.keyContactId)
    .filter(Boolean) as string[];

  const allExcludedIds = [...excludeIds, ...selectedIds];

  // Group options
  const familyOptions = options?.filter(
    (o) => o.type === "familyMember" && !allExcludedIds.includes(o.sourceId),
  );
  const contactOptions = options?.filter(
    (o) => o.type === "keyContact" && !allExcludedIds.includes(o.sourceId),
  );

  return (
    <div className={className}>
      {label && <Label className="text-sm font-medium mb-2 block">{label}</Label>}
      {helpText && <p className="text-xs text-muted-foreground mb-3">{helpText}</p>}

      <div className="space-y-3">
        {safeValue.map((entry) => (
          <div key={entry.id} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
            <div className="flex-1 space-y-2">
              {/* Person selector or manual input */}
              {entry.person?.sourceType === "manual" ? (
                <Input
                  placeholder="Enter full name"
                  value={entry.person.fullName || ""}
                  onChange={(e) => handleNameChange(entry.id, e.target.value)}
                  disabled={disabled}
                  className="h-9"
                />
              ) : (
                <Select
                  value={
                    entry.person?.familyMemberId
                      ? `familyMember:${entry.person.familyMemberId}`
                      : entry.person?.keyContactId
                        ? `keyContact:${entry.person.keyContactId}`
                        : ""
                  }
                  onValueChange={(val) => handlePersonChange(entry.id, val)}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9">
                    {entry.person?.fullName ? (
                      <span>{entry.person.fullName}</span>
                    ) : (
                      <SelectValue placeholder="Select a person..." />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {familyOptions && familyOptions.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Family Members
                        </SelectLabel>
                        {familyOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            <span>{option.fullName}</span>
                            {option.relationshipType && (
                              <span className="text-muted-foreground ml-1">
                                ({getRelationshipLabel(option.relationshipType)})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {contactOptions && contactOptions.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Contacts</SelectLabel>
                        {contactOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.displayLabel}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    <SelectGroup>
                      <SelectLabel>Other</SelectLabel>
                      <SelectItem value="manual">Enter name manually...</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              {/* Show selected person info */}
              {entry.person && entry.person.sourceType !== "manual" && entry.person.fullName && (
                <p className="text-xs text-muted-foreground pl-1">
                  {entry.person.relationship && `${entry.person.relationship}`}
                  {entry.person.city && entry.person.state && (
                    <span className="ml-2">
                      • {entry.person.city}, {entry.person.state}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Percentage input */}
            <div className="w-20">
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={entry.percentage || ""}
                  onChange={(e) => handlePercentageChange(entry.id, e.target.value)}
                  disabled={disabled}
                  className="h-9 pr-6 text-right"
                  placeholder="0"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>

            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(entry.id)}
              disabled={disabled}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add button */}
        {safeValue.length < maxEntries && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={disabled}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Beneficiary
          </Button>
        )}

        {/* Percentage total */}
        {showPercentageTotal && safeValue.length > 0 && (
          <div
            className={`text-sm text-right pr-12 ${
              totalPercentage === 100
                ? "text-green-600"
                : totalPercentage > 100
                  ? "text-destructive"
                  : "text-muted-foreground"
            }`}
          >
            Total: {totalPercentage}%
            {totalPercentage !== 100 && totalPercentage > 0 && (
              <span className="ml-1">
                {totalPercentage < 100 ? `(${100 - totalPercentage}% remaining)` : "(exceeds 100%)"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
