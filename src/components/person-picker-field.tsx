"use client";

/**
 * PersonPickerField Component
 *
 * A form field wrapper for PersonPicker that displays the selected person
 * with their details, provides edit functionality, and supports inline
 * manual entry with optional "Save to contacts" functionality.
 *
 * @example Basic usage
 * ```tsx
 * <PersonPickerField
 *   householdId={householdId}
 *   value={executor}
 *   onChange={setExecutor}
 *   label="Primary Executor"
 *   description="The person who will manage your estate"
 * />
 * ```
 *
 * @example With save to contacts
 * ```tsx
 * <PersonPickerField
 *   householdId={householdId}
 *   value={agent}
 *   onChange={setAgent}
 *   label="Healthcare Agent"
 *   showSaveToContacts={true}
 *   onSaveNewContact={handleSaveContact}
 * />
 * ```
 */

import { useMutation } from "convex/react";
import { Edit, Mail, MapPin, Phone, User, X } from "lucide-react";
import { useCallback, useState } from "react";
import {
  type NewContactData,
  PersonPicker,
  type PersonPickerProps,
} from "@/components/person-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  formatFullAddress,
  getAgeDescription,
  getPersonDisplayName,
  hasAddress,
  type PersonReference,
} from "@/lib/person-utils";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface PersonPickerFieldProps extends Omit<PersonPickerProps, "onSaveNewContact"> {
  /** Description text shown below the label */
  description?: string;
  /** Whether to show the "Save to contacts" checkbox for manual entries */
  showSaveToContacts?: boolean;
  /** Callback when user saves a new contact */
  onSaveNewContact?: (contactId: Id<"keyContacts">) => void;
  /** The role to assign when saving as key contact */
  saveContactRole?: "executor" | "trustee" | "guardian" | "healthcare_proxy" | "friend" | "other";
  /** Legacy plan ID to associate with saved contacts */
  legacyPlanId?: Id<"legacyPlans">;
  /** Whether to show person details when selected */
  showDetails?: boolean;
  /** Whether the field is in a compact display mode */
  compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PersonPickerField({
  householdId,
  value,
  onChange,
  label,
  description,
  required,
  error,
  showSaveToContacts = false,
  onSaveNewContact,
  saveContactRole = "other",
  legacyPlanId,
  showDetails = true,
  compact = false,
  disabled,
  className,
  ...pickerProps
}: PersonPickerFieldProps) {
  const [isEditing, setIsEditing] = useState(!value);
  const [saveToContacts, setSaveToContacts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mutation to save as key contact
  const saveAsKeyContact = useMutation(api.persons.saveAsKeyContact);

  // Handle selection change
  const handleChange = useCallback(
    async (newValue: PersonReference | null) => {
      onChange(newValue);

      if (newValue) {
        setIsEditing(false);

        // If manual entry and save to contacts is enabled
        if (newValue.sourceType === "manual" && saveToContacts && showSaveToContacts) {
          setIsSaving(true);
          try {
            const contactId = await saveAsKeyContact({
              householdId,
              legacyPlanId,
              name: newValue.fullName,
              role: saveContactRole,
              relationship: newValue.relationship,
              phone: newValue.phone,
              email: newValue.email,
              address: newValue.address,
              city: newValue.city,
              state: newValue.state,
              zipCode: newValue.zipCode,
              dateOfBirth: newValue.dateOfBirth,
            });
            onSaveNewContact?.(contactId);
          } catch (error) {
            console.error("Failed to save contact:", error);
          } finally {
            setIsSaving(false);
            setSaveToContacts(false);
          }
        }
      }
    },
    [
      onChange,
      saveToContacts,
      showSaveToContacts,
      saveAsKeyContact,
      householdId,
      legacyPlanId,
      saveContactRole,
      onSaveNewContact,
    ],
  );

  // Handle new contact from manual entry
  const handleNewContact = useCallback(
    async (data: NewContactData) => {
      if (!saveToContacts || !showSaveToContacts) return;

      setIsSaving(true);
      try {
        const contactId = await saveAsKeyContact({
          householdId,
          legacyPlanId,
          name: data.fullName,
          role: saveContactRole,
          relationship: data.relationship,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        });
        onSaveNewContact?.(contactId);
      } catch (error) {
        console.error("Failed to save contact:", error);
      } finally {
        setIsSaving(false);
        setSaveToContacts(false);
      }
    },
    [
      saveToContacts,
      showSaveToContacts,
      saveAsKeyContact,
      householdId,
      legacyPlanId,
      saveContactRole,
      onSaveNewContact,
    ],
  );

  // Clear selection and go back to edit mode
  const handleClear = useCallback(() => {
    onChange(null);
    setIsEditing(true);
  }, [onChange]);

  // Render the selected person display
  const renderSelectedPerson = () => {
    if (!value) return null;

    const displayName = getPersonDisplayName(value);
    const ageDesc = getAgeDescription(value.dateOfBirth);
    const addressStr = hasAddress(value)
      ? formatFullAddress({
          address: value.address,
          city: value.city,
          state: value.state,
          zipCode: value.zipCode,
        })
      : null;

    if (compact) {
      return (
        <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{displayName}</span>
            {value.relationship && (
              <span className="text-sm text-muted-foreground">({value.relationship})</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing(true)}
              disabled={disabled}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-md border border-input bg-background p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{displayName}</span>
                {value.relationship && (
                  <span className="text-sm text-muted-foreground">({value.relationship})</span>
                )}
                {value.sourceType === "manual" && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    Manual entry
                  </span>
                )}
              </div>

              {showDetails && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {ageDesc && <div>{ageDesc}</div>}
                  {addressStr && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {addressStr}
                    </div>
                  )}
                  {value.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {value.phone}
                    </div>
                  )}
                  {value.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {value.email}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing(true)}
              disabled={disabled}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <div className="space-y-1">
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      {/* Content */}
      {value && !isEditing ? (
        renderSelectedPerson()
      ) : (
        <div className="space-y-3">
          <PersonPicker
            householdId={householdId}
            value={value}
            onChange={handleChange}
            label=""
            required={required}
            error={error}
            disabled={disabled || isSaving}
            onSaveNewContact={handleNewContact}
            {...pickerProps}
          />

          {/* Save to contacts checkbox */}
          {showSaveToContacts && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="save-to-contacts"
                checked={saveToContacts}
                onCheckedChange={(checked) => setSaveToContacts(checked === true)}
                disabled={disabled || isSaving}
              />
              <Label
                htmlFor="save-to-contacts"
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                Save this person to my contacts
              </Label>
              {isSaving && <span className="text-xs text-muted-foreground">Saving...</span>}
            </div>
          )}
        </div>
      )}

      {/* Error message (when in display mode) */}
      {error && !isEditing && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
