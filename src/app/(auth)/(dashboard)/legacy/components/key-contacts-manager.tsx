"use client";

import { useMutation } from "convex/react";
import { Mail, MapPin, Phone, Plus, Trash2, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type ContactRole =
  | "attorney"
  | "financial_advisor"
  | "executor"
  | "trustee"
  | "guardian"
  | "healthcare_proxy"
  | "other";

interface KeyContact {
  _id: Id<"keyContacts">;
  _creationTime: number;
  householdId: Id<"households">;
  legacyPlanId: Id<"legacyPlans">;
  name: string;
  role: ContactRole;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface KeyContactsManagerProps {
  householdId: Id<"households">;
  legacyPlanId: Id<"legacyPlans">;
  contacts: KeyContact[];
}

const roleLabels: Record<ContactRole, string> = {
  attorney: "Attorney",
  financial_advisor: "Financial Advisor",
  executor: "Executor",
  trustee: "Trustee",
  guardian: "Guardian",
  healthcare_proxy: "Healthcare Proxy",
  other: "Other",
};

const roleColors: Record<ContactRole, string> = {
  attorney: "bg-blue-100 text-blue-800",
  financial_advisor: "bg-green-100 text-green-800",
  executor: "bg-purple-100 text-purple-800",
  trustee: "bg-orange-100 text-orange-800",
  guardian: "bg-pink-100 text-pink-800",
  healthcare_proxy: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
};

export function KeyContactsManager({
  householdId,
  legacyPlanId,
  contacts,
}: KeyContactsManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Id<"keyContacts"> | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "other" as ContactRole,
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const addContact = useMutation(api.legacy.addKeyContact);
  const deleteContact = useMutation(api.legacy.deleteKeyContact);

  const resetForm = () => {
    setFormData({
      name: "",
      role: "other",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
  };

  const handleAddContact = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await addContact({
        householdId,
        legacyPlanId,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
      });
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: Id<"keyContacts">) => {
    setIsDeleting(contactId);
    try {
      await deleteContact({ householdId, contactId });
    } catch (error) {
      console.error("Failed to delete contact:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Key Contacts
            </CardTitle>
            <CardDescription>Important people involved in your legacy plan</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No key contacts added yet.</p>
            <p className="text-xs mt-1">
              Add attorneys, advisors, executors, and other important contacts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{contact.name}</span>
                    <Badge variant="secondary" className={roleColors[contact.role]}>
                      {roleLabels[contact.role]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </span>
                    )}
                    {contact.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {contact.address}
                      </span>
                    )}
                  </div>
                  {contact.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{contact.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteContact(contact._id)}
                  disabled={isDeleting === contact._id}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Key Contact</DialogTitle>
            <DialogDescription>Add an important contact to your legacy plan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: ContactRole) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address, city, state"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={!formData.name.trim() || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
