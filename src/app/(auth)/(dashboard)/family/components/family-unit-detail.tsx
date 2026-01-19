"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, MessageCircle, Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ComingSoonBadge } from "@/components/coming-soon";
import { FeatureGate } from "@/components/feature-gate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FEATURES } from "@/lib/feature-access";
import { MemberCard } from "./member-card";
import { INITIAL_FORM_STATE, MemberFormDialog, type MemberFormState } from "./member-form-dialog";

interface FamilyUnitDetailProps {
  unitId: string;
}

// Format timestamp to YYYY-MM-DD in local timezone (not UTC)
// Using toISOString() would shift dates backward for US timezones
function formatDateForInput(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to build mutation args from form state
// Converts empty strings to undefined for optional fields
function buildMutationArgs(formState: MemberFormState) {
  // Helper to convert empty strings to undefined (for union types that include "")
  const toUndefinedIfEmpty = <T extends string>(val: T | ""): Exclude<T, ""> | undefined =>
    val === "" ? undefined : (val as Exclude<T, "">);

  return {
    firstName: formState.firstName,
    lastName: formState.lastName,
    email: formState.email || undefined,
    phone: formState.phone || undefined,
    gender: toUndefinedIfEmpty(formState.gender),
    dateOfBirth: formState.dateOfBirth ? new Date(formState.dateOfBirth).getTime() : undefined,
    address: formState.address || undefined,
    city: formState.city || undefined,
    county: formState.county || undefined,
    state: formState.state || undefined,
    zipCode: formState.zipCode || undefined,
    maritalStatus: toUndefinedIfEmpty(formState.maritalStatus),
    relationshipType: formState.relationshipType,
  };
}

export function FamilyUnitDetail({ unitId }: FamilyUnitDetailProps) {
  const router = useRouter();

  // Queries
  const familyUnit = useQuery(api.familyEcosystem.getFamilyUnit, {
    familyUnitId: unitId as Id<"familyUnits">,
  });
  const familyMembers = useQuery(api.familyEcosystem.listFamilyMembers, {
    familyUnitId: unitId as Id<"familyUnits">,
  });

  // Mutations
  const addFamilyMember = useMutation(api.familyEcosystem.addFamilyMember);
  const updateFamilyMember = useMutation(api.familyEcosystem.updateFamilyMember);
  const removeFamilyMember = useMutation(api.familyEcosystem.removeFamilyMember);

  // Dialog states - consolidated
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: Id<"familyMembers">;
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - single object instead of 14 separate useState calls
  const [editingMemberId, setEditingMemberId] = useState<Id<"familyMembers"> | null>(null);
  const [formState, setFormState] = useState<MemberFormState>(INITIAL_FORM_STATE);

  // Form change handler
  const handleFormChange = useCallback((updates: Partial<MemberFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setEditingMemberId(null);
    setFormState(INITIAL_FORM_STATE);
  }, []);

  // Open add dialog
  const openAddDialog = useCallback(() => {
    resetForm();
    setDialogMode("add");
  }, [resetForm]);

  // Open edit dialog with member data
  const openEditDialog = useCallback((member: NonNullable<typeof familyMembers>[0]) => {
    setEditingMemberId(member._id);
    setFormState({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email || "",
      phone: member.phone || "",
      relationshipType: member.relationshipType,
      gender: member.gender || "",
      dateOfBirth: member.dateOfBirth ? formatDateForInput(member.dateOfBirth) : "",
      address: member.address || "",
      city: member.city || "",
      county: member.county || "",
      state: member.state || "",
      zipCode: member.zipCode || "",
      maritalStatus: member.maritalStatus || "",
    });
    setDialogMode("edit");
  }, []);

  // Close dialog
  const closeDialog = useCallback(() => {
    setDialogMode(null);
    resetForm();
  }, [resetForm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const args = buildMutationArgs(formState);

      if (dialogMode === "add") {
        await addFamilyMember({
          familyUnitId: unitId as Id<"familyUnits">,
          ...args,
        });
        toast.success("Member added successfully");
      } else if (dialogMode === "edit" && editingMemberId) {
        await updateFamilyMember({
          memberId: editingMemberId,
          ...args,
        });
        toast.success("Member updated successfully");
      }

      closeDialog();
    } catch (error) {
      console.error(`Failed to ${dialogMode} member:`, error);
      toast.error(`Failed to ${dialogMode} member`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete confirmation
  const openDeleteConfirm = (memberId: Id<"familyMembers">, memberName: string) => {
    setMemberToDelete({ id: memberId, name: memberName });
    setShowDeleteConfirmDialog(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;

    setIsSubmitting(true);
    try {
      await removeFamilyMember({ memberId: memberToDelete.id });
      toast.success("Member removed successfully");
      setShowDeleteConfirmDialog(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (familyUnit === undefined || familyMembers === undefined) {
    return null;
  }

  // Not found
  if (familyUnit === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-2">Family Unit Not Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            The family unit you&apos;re looking for doesn&apos;t exist or you don&apos;t have access
            to it.
          </p>
          <Button onClick={() => router.push("/family")}>Back to Family Ecosystem</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <FeatureGate feature={FEATURES.FAMILY_MEMBERS}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push("/family")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Family Ecosystem
        </Button>

        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">{familyUnit.name}</h1>
              {familyUnit.isPrimary && (
                <Badge className="bg-green-600 hover:bg-green-700">Primary</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled className="opacity-60">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
                <ComingSoonBadge size="sm" className="ml-2" />
              </Button>
              <Button variant="outline" disabled className="opacity-60">
                <Share2 className="h-4 w-4 mr-2" />
                Share
                <ComingSoonBadge size="sm" className="ml-2" />
              </Button>
            </div>
          </div>
          {familyUnit.relationshipToHousehold && (
            <p className="text-muted-foreground text-lg">{familyUnit.relationshipToHousehold}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="shared">Shared Items</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Family Members</CardTitle>
                  <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!familyMembers || familyMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No members yet. Add your first family member to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {familyMembers.map((member) => (
                      <MemberCard
                        key={member._id}
                        member={member}
                        onEdit={() => openEditDialog(member)}
                        onRemove={() =>
                          openDeleteConfirm(member._id, `${member.firstName} ${member.lastName}`)
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared">
            <Card className="border-dashed border-amber-300">
              <CardContent className="py-12 text-center">
                <Share2 className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Shared Items</h3>
                <p className="text-muted-foreground mb-4">
                  Share documents and photos with this family unit.
                </p>
                <ComingSoonBadge />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="border-dashed border-amber-300">
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Activity Feed</h3>
                <p className="text-muted-foreground mb-4">
                  See recent activity and updates from this family unit.
                </p>
                <ComingSoonBadge />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Shared Member Form Dialog - handles both add and edit */}
      <MemberFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && closeDialog()}
        mode={dialogMode || "add"}
        formState={formState}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={closeDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToDelete?.name} from this family? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FeatureGate>
  );
}
