"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, MessageCircle, Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MemberCard } from "./member-card";

interface FamilyUnitDetailProps {
  unitId: string;
}

export function FamilyUnitDetail({ unitId }: FamilyUnitDetailProps) {
  const router = useRouter();

  // Queries - run in parallel (backend handles auth/access checks)
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

  // Dialog states
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showEditMemberDialog, setShowEditMemberDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [editingMemberId, setEditingMemberId] = useState<Id<"familyMembers"> | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationshipType, setRelationshipType] = useState<string>("other");
  const [gender, setGender] = useState<string>("");

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await addFamilyMember({
        familyUnitId: unitId as Id<"familyUnits">,
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined,
        gender: (gender as "male" | "female" | "prefer_not_to_say" | undefined) || undefined,
        relationshipType: relationshipType as
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
          | "other",
      });

      toast.success("Member added successfully");
      setShowAddMemberDialog(false);
      resetForm();
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error("Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberId) return;

    setIsSubmitting(true);
    try {
      await updateFamilyMember({
        memberId: editingMemberId,
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined,
        gender: (gender as "male" | "female" | "prefer_not_to_say" | undefined) || undefined,
        relationshipType: relationshipType as
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
          | "other",
      });

      toast.success("Member updated successfully");
      setShowEditMemberDialog(false);
      resetForm();
    } catch (error) {
      console.error("Failed to update member:", error);
      toast.error("Failed to update member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: Id<"familyMembers">) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeFamilyMember({ memberId });
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    }
  };

  const openEditDialog = (member: NonNullable<typeof familyMembers>[0]) => {
    setEditingMemberId(member._id);
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setEmail(member.email || "");
    setPhone(member.phone || "");
    setRelationshipType(member.relationshipType);
    setGender(member.gender || "");
    setShowEditMemberDialog(true);
  };

  const resetForm = () => {
    setEditingMemberId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRelationshipType("other");
    setGender("");
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
    <>
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
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Items
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
                  <Button onClick={() => setShowAddMemberDialog(true)}>
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
                        onRemove={() => handleRemoveMember(member._id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Shared items feature coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Activity feed coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>Add a new member to this family unit.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Full Name *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationshipType">Relationship *</Label>
              <Select value={relationshipType} onValueChange={setRelationshipType} required>
                <SelectTrigger id="relationshipType">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="grandparent">Grandparent</SelectItem>
                  <SelectItem value="grandchild">Grandchild</SelectItem>
                  <SelectItem value="aunt_uncle">Aunt/Uncle</SelectItem>
                  <SelectItem value="niece_nephew">Niece/Nephew</SelectItem>
                  <SelectItem value="cousin">Cousin</SelectItem>
                  <SelectItem value="in_law">In-Law</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddMemberDialog(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditMemberDialog} onOpenChange={setShowEditMemberDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Family Member</DialogTitle>
            <DialogDescription>Update member information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">Full Name *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="editFirstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRelationshipType">Relationship *</Label>
              <Select value={relationshipType} onValueChange={setRelationshipType} required>
                <SelectTrigger id="editRelationshipType">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="grandparent">Grandparent</SelectItem>
                  <SelectItem value="grandchild">Grandchild</SelectItem>
                  <SelectItem value="aunt_uncle">Aunt/Uncle</SelectItem>
                  <SelectItem value="niece_nephew">Niece/Nephew</SelectItem>
                  <SelectItem value="cousin">Cousin</SelectItem>
                  <SelectItem value="in_law">In-Law</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editGender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="editGender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditMemberDialog(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
