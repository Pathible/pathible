"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

// Union types for form fields
export type RelationshipType =
  | "parent"
  | "child"
  | "spouse"
  | "partner"
  | "sibling"
  | "grandparent"
  | "grandchild"
  | "aunt_uncle"
  | "niece_nephew"
  | "cousin"
  | "in_law"
  | "other";

export type Gender = "male" | "female" | "prefer_not_to_say" | "";

export type MaritalStatus =
  | "single"
  | "married"
  | "divorced"
  | "widowed"
  | "domestic_partnership"
  | "separated"
  | "";

// Form state type - consolidates all form fields into single object
export interface MemberFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationshipType: RelationshipType;
  gender: Gender;
  dateOfBirth: string;
  address: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
  maritalStatus: MaritalStatus;
}

export const INITIAL_FORM_STATE: MemberFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  relationshipType: "other",
  gender: "",
  dateOfBirth: "",
  address: "",
  city: "",
  county: "",
  state: "",
  zipCode: "",
  maritalStatus: "",
};

// Relationship type options - shared constant
export const RELATIONSHIP_OPTIONS = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "spouse", label: "Spouse" },
  { value: "partner", label: "Partner" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "grandchild", label: "Grandchild" },
  { value: "aunt_uncle", label: "Aunt/Uncle" },
  { value: "niece_nephew", label: "Niece/Nephew" },
  { value: "cousin", label: "Cousin" },
  { value: "in_law", label: "In-Law" },
  { value: "other", label: "Other" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "domestic_partnership", label: "Domestic Partnership" },
  { value: "separated", label: "Separated" },
] as const;

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  formState: MemberFormState;
  onFormChange: (updates: Partial<MemberFormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function MemberFormDialog({
  open,
  onOpenChange,
  mode,
  formState,
  onFormChange,
  onSubmit,
  isSubmitting,
  onCancel,
}: MemberFormDialogProps) {
  const isEditing = mode === "edit";
  const title = isEditing ? "Edit Family Member" : "Add Family Member";
  const description = isEditing
    ? "Update member information."
    : "Add a new member to this family unit.";
  const submitLabel = isEditing
    ? isSubmitting
      ? "Updating..."
      : "Update Member"
    : isSubmitting
      ? "Adding..."
      : "Add Member";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
            <div className="space-y-2">
              <Label htmlFor="firstName">Full Name *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={formState.firstName}
                  onChange={(e) => onFormChange({ firstName: e.target.value })}
                  required
                />
                <Input
                  placeholder="Last name"
                  value={formState.lastName}
                  onChange={(e) => onFormChange({ lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formState.dateOfBirth}
                  onChange={(e) => onFormChange({ dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formState.gender}
                  onValueChange={(value: string) => onFormChange({ gender: value as Gender | "" })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationshipType">Relationship *</Label>
                <Select
                  value={formState.relationshipType}
                  onValueChange={(value: string) =>
                    onFormChange({ relationshipType: value as RelationshipType })
                  }
                  required
                >
                  <SelectTrigger id="relationshipType">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={formState.maritalStatus}
                  onValueChange={(value: string) =>
                    onFormChange({ maritalStatus: value as MaritalStatus | "" })
                  }
                >
                  <SelectTrigger id="maritalStatus">
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formState.email}
                  onChange={(e) => onFormChange({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formState.phone}
                  onChange={(e) => onFormChange({ phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={formState.address}
                onChange={(e) => onFormChange({ address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formState.city}
                  onChange={(e) => onFormChange({ city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  placeholder="County"
                  value={formState.county}
                  onChange={(e) => onFormChange({ county: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="CA"
                  maxLength={2}
                  value={formState.state}
                  onChange={(e) => onFormChange({ state: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-muted-foreground">2-letter code (e.g., CA, NY)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="12345"
                  value={formState.zipCode}
                  onChange={(e) => onFormChange({ zipCode: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  5 or 9 digits (e.g., 12345 or 12345-6789)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
