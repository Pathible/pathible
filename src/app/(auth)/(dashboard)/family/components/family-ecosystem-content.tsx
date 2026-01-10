"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, Plus, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { api } from "@/convex/_generated/api";
import { useDialogState, useFormState } from "@/hooks";
import { FamilyUnitCard } from "./family-unit-card";

export function FamilyEcosystemContent() {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  // Check Clerk session status
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  // Use the first household
  const householdId = households?.[0]?._id;

  // Get family units
  const familyUnits = useQuery(
    api.familyEcosystem.listFamilyUnits,
    isUserLoaded && user && householdId ? { householdId } : "skip",
  );

  // Mutations
  const createFamilyUnit = useMutation(api.familyEcosystem.createFamilyUnit);
  const inviteToPrimaryFamily = useMutation(api.familyEcosystem.inviteToPrimaryFamily);
  const ensureCurrentUserInPrimaryFamily = useMutation(
    api.familyEcosystem.ensureCurrentUserInPrimaryFamily,
  );

  // Dialog states
  const addFamilyDialog = useDialogState();
  const inviteMemberDialog = useDialogState();

  // Form states - Add Family
  const addFamilyForm = useFormState({
    name: "",
    description: "",
    relationship: "",
  });

  // Form states - Invite Member
  const inviteMemberForm = useFormState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    relationship: "other" as string,
  });

  // Track if we've ensured current user is in primary family
  const [hasEnsuredUser, setHasEnsuredUser] = useState(false);

  // Unified retry logic for auth race conditions
  useEffect(() => {
    const needsRetry =
      isUserLoaded &&
      retryCount < maxRetries &&
      (!user || households === null || familyUnits === null);

    if (needsRetry) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isUserLoaded, user, households, familyUnits, retryCount]);

  // Ensure current user is in the primary family when page loads
  useEffect(() => {
    if (householdId && !hasEnsuredUser && user) {
      ensureCurrentUserInPrimaryFamily({ householdId })
        .then(() => {
          setHasEnsuredUser(true);
        })
        .catch((error) => {
          console.error("Failed to ensure user in primary family:", error);
          setHasEnsuredUser(true); // Don't retry on error
        });
    }
  }, [householdId, hasEnsuredUser, user, ensureCurrentUserInPrimaryFamily]);

  // Determine if we're still in the auth loading phase
  const isAuthLoading = !isUserLoaded || (!user && retryCount < maxRetries);

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) return;

    addFamilyForm.setIsSubmitting(true);
    try {
      await createFamilyUnit({
        householdId,
        name: addFamilyForm.values.name,
        description: addFamilyForm.values.description || undefined,
        relationshipToHousehold: addFamilyForm.values.relationship || undefined,
      });

      toast.success("Family unit created successfully");
      addFamilyDialog.close();
      addFamilyForm.reset();
    } catch (error) {
      console.error("Failed to create family unit:", error);
      toast.error("Failed to create family unit");
    } finally {
      addFamilyForm.setIsSubmitting(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) return;

    inviteMemberForm.setIsSubmitting(true);
    try {
      await inviteToPrimaryFamily({
        householdId,
        firstName: inviteMemberForm.values.firstName,
        lastName: inviteMemberForm.values.lastName,
        email: inviteMemberForm.values.email,
        phone: inviteMemberForm.values.phone || undefined,
        relationshipType: inviteMemberForm.values.relationship as
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

      toast.success(`${inviteMemberForm.values.firstName} has been added to your family`);
      inviteMemberDialog.close();
      inviteMemberForm.reset();
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add family member");
    } finally {
      inviteMemberForm.setIsSubmitting(false);
    }
  };

  // Loading state
  if (isAuthLoading) {
    return null;
  }

  // Not authenticated
  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Signed In</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Sign in to see your family and who has access to your legacy.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Still loading households
  if (
    households === undefined ||
    familyUnits === undefined ||
    ((households === null || familyUnits === null) && retryCount < maxRetries)
  ) {
    return null;
  }

  // Auth sync failed
  if (households === null || familyUnits === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Having Trouble Connecting</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            We&apos;re having trouble reaching your family&apos;s data. Mind giving it another try?
          </p>
        </CardContent>
      </Card>
    );
  }

  // No household found
  if (!householdId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Set Up</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Complete your profile to start adding the people who matter most.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Family Ecosystem</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={inviteMemberDialog.open}
                data-tour="family-invite-member"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
              <Button onClick={addFamilyDialog.open} data-tour="family-add-unit">
                <Plus className="h-4 w-4 mr-2" />
                Add Family
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Your family at a glance, and who has access to what
          </p>
        </div>

        {/* Coming Soon Features */}
        {/* TODO Hiding this for now until these features for now until ready */}
        {/* <div className="grid gap-4 md:grid-cols-2">
          <ComingSoonCard
            feature={FEATURES.FAMILY_MESSAGING}
            title="Family Messaging"
            description="Stay connected with secure, private messaging for your family members."
            icon={<MessageCircle className="h-5 w-5" />}
          />
          <ComingSoonCard
            feature={FEATURES.FAMILY_RELATIONSHIPS}
            title="Family Tree"
            description="Visualize and map your family relationships across generations."
            icon={<GitBranch className="h-5 w-5" />}
          />
        </div> */}

        {/* Family Units Grid */}
        {familyUnits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your Family Tree Starts Here</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Add the people who matter most. They&apos;re the reason you&apos;re doing this.
              </p>
              <Button onClick={addFamilyDialog.open}>
                <Plus className="h-4 w-4 mr-2" />
                Add Family Unit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {familyUnits.map((unit) => (
              <FamilyUnitCard
                key={unit._id}
                unit={unit}
                onClick={() => router.push(`/family/${unit._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Family Dialog */}
      <Dialog open={addFamilyDialog.isOpen} onOpenChange={addFamilyDialog.setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Family Group</DialogTitle>
            <DialogDescription>
              Group your family members together, like &quot;The Johnsons&quot; or &quot;Mom&apos;s
              Side&quot;
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFamily} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name *</Label>
              <Input
                id="familyName"
                placeholder="e.g., The Johnson Family"
                value={addFamilyForm.values.name}
                onChange={(e) => addFamilyForm.setField("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyRelationship">Relationship</Label>
              <Input
                id="familyRelationship"
                placeholder="e.g., In-Laws, Extended Family"
                value={addFamilyForm.values.relationship}
                onChange={(e) => addFamilyForm.setField("relationship", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyDescription">Description</Label>
              <Input
                id="familyDescription"
                placeholder="Optional description"
                value={addFamilyForm.values.description}
                onChange={(e) => addFamilyForm.setField("description", e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addFamilyDialog.close}
                disabled={addFamilyForm.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addFamilyForm.isSubmitting}>
                {addFamilyForm.isSubmitting ? "Creating..." : "Create Family Unit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteMemberDialog.isOpen} onOpenChange={inviteMemberDialog.setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Someone to Your Family</DialogTitle>
            <DialogDescription>
              Bring someone into the circle. They&apos;ll be able to see what you&apos;ve shared.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteFirstName">Full Name *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="inviteFirstName"
                  placeholder="First name"
                  value={inviteMemberForm.values.firstName}
                  onChange={(e) => inviteMemberForm.setField("firstName", e.target.value)}
                  required
                />
                <Input
                  placeholder="Last name"
                  value={inviteMemberForm.values.lastName}
                  onChange={(e) => inviteMemberForm.setField("lastName", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address *</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="member@example.com"
                value={inviteMemberForm.values.email}
                onChange={(e) => inviteMemberForm.setField("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invitePhone">Phone</Label>
              <Input
                id="invitePhone"
                type="tel"
                placeholder="(555) 123-4567"
                value={inviteMemberForm.values.phone}
                onChange={(e) => inviteMemberForm.setField("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRelationship">Relationship *</Label>
              <Select
                value={inviteMemberForm.values.relationship}
                onValueChange={(value) => inviteMemberForm.setField("relationship", value)}
              >
                <SelectTrigger id="inviteRelationship">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  inviteMemberDialog.close();
                  inviteMemberForm.reset();
                }}
                disabled={inviteMemberForm.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMemberForm.isSubmitting}>
                {inviteMemberForm.isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
