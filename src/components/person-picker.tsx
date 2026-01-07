"use client";

/**
 * PersonPicker Component
 *
 * A reusable dropdown component for selecting people from family members,
 * key contacts, or entering manually. Supports filtering, auto-selection,
 * and manual entry fallback.
 *
 * @example Basic usage
 * ```tsx
 * <PersonPicker
 *   householdId={householdId}
 *   value={selectedPerson}
 *   onChange={setSelectedPerson}
 *   label="Primary Executor"
 * />
 * ```
 *
 * @example With filtering
 * ```tsx
 * <PersonPicker
 *   householdId={householdId}
 *   value={guardian}
 *   onChange={setGuardian}
 *   label="Guardian"
 *   excludeMinors={true}
 *   filterRelationships={["spouse", "sibling", "parent"]}
 * />
 * ```
 */

import { useQuery } from "convex/react";
import { Pencil, Plus, User, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  createFamilyMemberReference,
  createKeyContactReference,
  createManualPersonReference,
  type PersonReference,
} from "@/lib/person-utils";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface NewContactData {
  fullName: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  relationship?: string;
}

export interface PersonPickerProps {
  householdId: Id<"households">;
  value: PersonReference | null;
  onChange: (value: PersonReference | null) => void;

  // Filtering
  filterRelationships?: string[];
  excludeIds?: string[];
  excludeMinors?: boolean;

  // Auto-selection
  autoSelectRelationship?: string;
  autoSelectCurrentUser?: boolean;

  // Labels
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  error?: string;

  // Manual entry
  allowManualEntry?: boolean;
  onSaveNewContact?: (data: NewContactData) => void;

  disabled?: boolean;
  className?: string;
}

// Special value for manual entry option
const MANUAL_ENTRY_VALUE = "__manual_entry__";

// ============================================================================
// COMPONENT
// ============================================================================

export function PersonPicker({
  householdId,
  value,
  onChange,
  filterRelationships,
  excludeIds,
  excludeMinors = false,
  autoSelectRelationship,
  autoSelectCurrentUser = false,
  label,
  placeholder = "Select a person...",
  helpText,
  required = false,
  error,
  allowManualEntry = true,
  onSaveNewContact,
  disabled = false,
  className,
}: PersonPickerProps) {
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualData, setManualData] = useState<NewContactData>({
    fullName: "",
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState<NewContactData>({
    fullName: "",
  });

  // Fetch person options from Convex
  const personOptions = useQuery(api.persons.getPersonOptions, {
    householdId,
    includeCurrentUser: true,
    filterByRelationship: filterRelationships,
    excludeMinors,
  });

  // Filter out excluded IDs
  const filteredOptions = useMemo(() => {
    if (!personOptions) return [];
    if (!excludeIds || excludeIds.length === 0) return personOptions;

    return personOptions.filter((option) => !excludeIds.includes(option.id));
  }, [personOptions, excludeIds]);

  // Group options by type
  const groupedOptions = useMemo(() => {
    const familyMembers = filteredOptions.filter((opt) => opt.type === "familyMember");
    const keyContacts = filteredOptions.filter((opt) => opt.type === "keyContact");

    return { familyMembers, keyContacts };
  }, [filteredOptions]);

  // Handle auto-selection when only one match exists
  useEffect(() => {
    // Skip if we already have a value or no options
    if (value || !filteredOptions.length) return;

    // Auto-select current user if requested
    if (autoSelectCurrentUser) {
      const currentUser = filteredOptions.find((opt) => opt.isCurrentUser);
      if (currentUser) {
        // Inline the selection logic to avoid dependency on handleSelectOption
        const option = filteredOptions.find((opt) => opt.id === currentUser.id);
        if (option) {
          const reference =
            option.type === "familyMember"
              ? createFamilyMemberReference(option.sourceId, {
                  fullName: option.fullName,
                  firstName: option.firstName,
                  lastName: option.lastName,
                  address: option.address,
                  city: option.city,
                  state: option.state,
                  zipCode: option.zipCode,
                  phone: option.phone,
                  email: option.email,
                  relationship: option.relationship,
                  dateOfBirth: option.dateOfBirth,
                })
              : createKeyContactReference(option.sourceId, {
                  fullName: option.fullName,
                  firstName: option.firstName,
                  lastName: option.lastName,
                  address: option.address,
                  city: option.city,
                  state: option.state,
                  zipCode: option.zipCode,
                  phone: option.phone,
                  email: option.email,
                  relationship: option.relationship,
                  dateOfBirth: option.dateOfBirth,
                });
          onChange(reference);
        }
        return;
      }
    }

    // Auto-select if only one match for relationship
    if (autoSelectRelationship) {
      const matches = filteredOptions.filter(
        (opt) => opt.relationshipType === autoSelectRelationship,
      );
      if (matches.length === 1) {
        const option = matches[0];
        const reference =
          option.type === "familyMember"
            ? createFamilyMemberReference(option.sourceId, {
                fullName: option.fullName,
                firstName: option.firstName,
                lastName: option.lastName,
                address: option.address,
                city: option.city,
                state: option.state,
                zipCode: option.zipCode,
                phone: option.phone,
                email: option.email,
                relationship: option.relationship,
                dateOfBirth: option.dateOfBirth,
              })
            : createKeyContactReference(option.sourceId, {
                fullName: option.fullName,
                firstName: option.firstName,
                lastName: option.lastName,
                address: option.address,
                city: option.city,
                state: option.state,
                zipCode: option.zipCode,
                phone: option.phone,
                email: option.email,
                relationship: option.relationship,
                dateOfBirth: option.dateOfBirth,
              });
        onChange(reference);
      }
    }
  }, [filteredOptions, value, autoSelectCurrentUser, autoSelectRelationship, onChange]);

  // Convert a person option to a PersonReference
  const optionToReference = useCallback(
    (optionId: string): PersonReference | null => {
      const option = filteredOptions.find((opt) => opt.id === optionId);
      if (!option) return null;

      if (option.type === "familyMember") {
        return createFamilyMemberReference(option.sourceId, {
          fullName: option.fullName,
          firstName: option.firstName,
          lastName: option.lastName,
          address: option.address,
          city: option.city,
          state: option.state,
          zipCode: option.zipCode,
          phone: option.phone,
          email: option.email,
          relationship: option.relationship,
          dateOfBirth: option.dateOfBirth,
        });
      }

      return createKeyContactReference(option.sourceId, {
        fullName: option.fullName,
        firstName: option.firstName,
        lastName: option.lastName,
        address: option.address,
        city: option.city,
        state: option.state,
        zipCode: option.zipCode,
        phone: option.phone,
        email: option.email,
        relationship: option.relationship,
        dateOfBirth: option.dateOfBirth,
      });
    },
    [filteredOptions],
  );

  // Handle selection from dropdown
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (optionId === MANUAL_ENTRY_VALUE) {
        setManualData({ fullName: "" });
        setShowManualDialog(true);
        return;
      }

      const reference = optionToReference(optionId);
      onChange(reference);
    },
    [optionToReference, onChange],
  );

  // Handle manual entry submission
  const handleManualSubmit = useCallback(() => {
    if (!manualData.fullName.trim()) return;

    // Parse first/last name from full name
    const nameParts = manualData.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const reference = createManualPersonReference({
      ...manualData,
      fullName: manualData.fullName.trim(),
      firstName,
      lastName,
    });

    onChange(reference);
    setShowManualDialog(false);
    setManualData({ fullName: "" });

    // Optionally save as new contact
    if (onSaveNewContact) {
      onSaveNewContact({
        ...manualData,
        fullName: manualData.fullName.trim(),
        firstName,
        lastName,
      });
    }
  }, [manualData, onChange, onSaveNewContact]);

  // Open edit dialog with current person's data
  const handleOpenEdit = useCallback(() => {
    if (!value) return;

    setEditData({
      fullName: value.fullName || "",
      firstName: value.firstName,
      lastName: value.lastName,
      address: value.address,
      city: value.city,
      state: value.state,
      zipCode: value.zipCode,
      phone: value.phone,
      email: value.email,
      relationship: value.relationship,
    });
    setShowEditDialog(true);
  }, [value]);

  // Submit edited data
  const handleEditSubmit = useCallback(() => {
    if (!value || !editData.fullName.trim()) return;

    // Update the current PersonReference with edited data
    const updatedReference: PersonReference = {
      ...value,
      fullName: editData.fullName.trim(),
      firstName: editData.firstName,
      lastName: editData.lastName,
      address: editData.address,
      city: editData.city,
      state: editData.state,
      zipCode: editData.zipCode,
      phone: editData.phone,
      email: editData.email,
      relationship: editData.relationship,
    };

    onChange(updatedReference);
    setShowEditDialog(false);
  }, [value, editData, onChange]);

  // Get current selection value for the Select component
  const currentSelectValue = useMemo(() => {
    if (!value) return undefined;

    if (value.sourceType === "manual") {
      // Manual entries show the name but don't have a select value
      return undefined;
    }

    if (value.sourceType === "familyMember" && value.familyMemberId) {
      return `familyMember:${value.familyMemberId}`;
    }

    if (value.sourceType === "keyContact" && value.keyContactId) {
      return `keyContact:${value.keyContactId}`;
    }

    return undefined;
  }, [value]);

  // Loading state
  if (personOptions === undefined) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`person-picker-${label}`}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Show selected person with Edit/Clear buttons */}
      {value ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{value.fullName}</span>
            {value.relationship && (
              <span className="text-muted-foreground">({value.relationship})</span>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleOpenEdit}
            disabled={disabled}
            title="Edit details"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange(null)}
            disabled={disabled}
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Select value={currentSelectValue} onValueChange={handleSelectOption} disabled={disabled}>
          <SelectTrigger
            id={`person-picker-${label}`}
            className={cn("w-full", error && "border-destructive")}
            aria-invalid={!!error}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {/* Family Members Group */}
            {groupedOptions.familyMembers.length > 0 && (
              <SelectGroup>
                <SelectLabel className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Family Members
                </SelectLabel>
                {groupedOptions.familyMembers.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col">
                      <span>{option.displayLabel}</span>
                      {option.subLabel && (
                        <span className="text-xs text-muted-foreground">{option.subLabel}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {/* Key Contacts Group */}
            {groupedOptions.keyContacts.length > 0 && (
              <>
                {groupedOptions.familyMembers.length > 0 && <SelectSeparator />}
                <SelectGroup>
                  <SelectLabel className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Contacts
                  </SelectLabel>
                  {groupedOptions.keyContacts.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex flex-col">
                        <span>{option.displayLabel}</span>
                        {option.subLabel && (
                          <span className="text-xs text-muted-foreground">{option.subLabel}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}

            {/* Manual Entry Option */}
            {allowManualEntry && (
              <>
                {(groupedOptions.familyMembers.length > 0 ||
                  groupedOptions.keyContacts.length > 0) && <SelectSeparator />}
                <SelectItem value={MANUAL_ENTRY_VALUE}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Plus className="h-4 w-4" />
                    Enter manually...
                  </div>
                </SelectItem>
              </>
            )}

            {/* Empty state */}
            {filteredOptions.length === 0 && !allowManualEntry && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No people available
              </div>
            )}
          </SelectContent>
        </Select>
      )}

      {/* Help text */}
      {helpText && !error && <p className="text-xs text-muted-foreground">{helpText}</p>}

      {/* Error message */}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Manual Entry Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Person Details</DialogTitle>
            <DialogDescription>Enter the details for the person you want to add.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="manual-fullName">Full Name *</Label>
              <Input
                id="manual-fullName"
                value={manualData.fullName}
                onChange={(e) =>
                  setManualData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-relationship">Relationship</Label>
              <Input
                id="manual-relationship"
                value={manualData.relationship || ""}
                onChange={(e) =>
                  setManualData((prev) => ({
                    ...prev,
                    relationship: e.target.value,
                  }))
                }
                placeholder="Friend, Attorney, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-address">Street Address</Label>
              <Input
                id="manual-address"
                value={manualData.address || ""}
                onChange={(e) =>
                  setManualData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="manual-city">City</Label>
                <Input
                  id="manual-city"
                  value={manualData.city || ""}
                  onChange={(e) =>
                    setManualData((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  placeholder="Springfield"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <Label htmlFor="manual-state">State</Label>
                <Input
                  id="manual-state"
                  value={manualData.state || ""}
                  onChange={(e) =>
                    setManualData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="manual-zipCode">ZIP Code</Label>
                <Input
                  id="manual-zipCode"
                  value={manualData.zipCode || ""}
                  onChange={(e) =>
                    setManualData((prev) => ({
                      ...prev,
                      zipCode: e.target.value,
                    }))
                  }
                  placeholder="90210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual-phone">Phone</Label>
                <Input
                  id="manual-phone"
                  type="tel"
                  value={manualData.phone || ""}
                  onChange={(e) =>
                    setManualData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-email">Email</Label>
                <Input
                  id="manual-email"
                  type="email"
                  value={manualData.email || ""}
                  onChange={(e) =>
                    setManualData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowManualDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleManualSubmit}
              disabled={!manualData.fullName.trim()}
            >
              Add Person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Person Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Person Details</DialogTitle>
            <DialogDescription>
              Update the details for this document. Changes are saved to this document only.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Full Name *</Label>
              <Input
                id="edit-fullName"
                value={editData.fullName}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-relationship">Relationship</Label>
              <Input
                id="edit-relationship"
                value={editData.relationship || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    relationship: e.target.value,
                  }))
                }
                placeholder="Friend, Attorney, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Street Address</Label>
              <Input
                id="edit-address"
                value={editData.address || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={editData.city || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  placeholder="Springfield"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={editData.state || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-zipCode">ZIP Code</Label>
                <Input
                  id="edit-zipCode"
                  value={editData.zipCode || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      zipCode: e.target.value,
                    }))
                  }
                  placeholder="90210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editData.phone || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditSubmit} disabled={!editData.fullName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
