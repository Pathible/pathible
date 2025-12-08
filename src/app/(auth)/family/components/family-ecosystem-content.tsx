"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { FamilyUnitCard } from "./family-unit-card";

export function FamilyEcosystemContent() {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  // Check Better Auth session status
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  // Get user's households
  const households = useQuery(
    api.households.list,
    !isSessionPending && session?.user ? {} : "skip",
  );

  // Use the first household
  const householdId = households?.[0]?._id;

  // Get family units
  const familyUnits = useQuery(
    api.familyEcosystem.listFamilyUnits,
    !isSessionPending && session?.user && householdId ? { householdId } : "skip",
  );

  // Mutations
  const createFamilyUnit = useMutation(api.familyEcosystem.createFamilyUnit);
  const inviteToPrimaryFamily = useMutation(api.familyEcosystem.inviteToPrimaryFamily);
  const ensureCurrentUserInPrimaryFamily = useMutation(
    api.familyEcosystem.ensureCurrentUserInPrimaryFamily,
  );

  // Dialog states
  const [showAddFamilyDialog, setShowAddFamilyDialog] = useState(false);
  const [showInviteMemberDialog, setShowInviteMemberDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - Add Family
  const [familyName, setFamilyName] = useState("");
  const [familyDescription, setFamilyDescription] = useState("");
  const [familyRelationship, setFamilyRelationship] = useState("");

  // Form states - Invite Member
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState<string>("other");

  // Track if we've ensured current user is in primary family
  const [hasEnsuredUser, setHasEnsuredUser] = useState(false);

  // Unified retry logic for auth race conditions
  useEffect(() => {
    const needsRetry =
      !isSessionPending &&
      retryCount < maxRetries &&
      (!session?.user || households === null || familyUnits === null);

    if (needsRetry) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSessionPending, session?.user, households, familyUnits, retryCount]);

  // Ensure current user is in the primary family when page loads
  useEffect(() => {
    if (householdId && !hasEnsuredUser && session?.user) {
      ensureCurrentUserInPrimaryFamily({ householdId })
        .then(() => {
          setHasEnsuredUser(true);
        })
        .catch((error) => {
          console.error("Failed to ensure user in primary family:", error);
          setHasEnsuredUser(true); // Don't retry on error
        });
    }
  }, [householdId, hasEnsuredUser, session?.user, ensureCurrentUserInPrimaryFamily]);

  // Determine if we're still in the auth loading phase
  const isAuthLoading = isSessionPending || (!session?.user && retryCount < maxRetries);

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) return;

    setIsSubmitting(true);
    try {
      await createFamilyUnit({
        householdId,
        name: familyName,
        description: familyDescription || undefined,
        relationshipToHousehold: familyRelationship || undefined,
      });

      toast.success("Family unit created successfully");
      setShowAddFamilyDialog(false);
      setFamilyName("");
      setFamilyDescription("");
      setFamilyRelationship("");
    } catch (error) {
      console.error("Failed to create family unit:", error);
      toast.error("Failed to create family unit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId) return;

    setIsSubmitting(true);
    try {
      await inviteToPrimaryFamily({
        householdId,
        firstName: inviteFirstName,
        lastName: inviteLastName,
        email: inviteEmail,
        phone: invitePhone || undefined,
        relationshipType: inviteRelationship as
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

      toast.success(`${inviteFirstName} has been added to your family`);
      setShowInviteMemberDialog(false);
      resetInviteForm();
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add family member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetInviteForm = () => {
    setInviteFirstName("");
    setInviteLastName("");
    setInviteEmail("");
    setInvitePhone("");
    setInviteRelationship("other");
  };

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-10 w-80" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-10 w-10 rounded-full" />
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please sign in to access Family Ecosystem.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Still loading households - show full page skeleton
  if (
    households === undefined ||
    familyUnits === undefined ||
    ((households === null || familyUnits === null) && retryCount < maxRetries)
  ) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-10 w-80" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-10 w-10 rounded-full" />
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Auth sync failed
  if (households === null || familyUnits === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connection Issue</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            Unable to load your family data. Please refresh the page or try again later.
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
          <h3 className="text-lg font-semibold mb-2">No Household Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            You need to be part of a household to access Family Ecosystem. Please complete your
            onboarding or contact support.
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
              <Button variant="outline" onClick={() => setShowInviteMemberDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
              <Button onClick={() => setShowAddFamilyDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Family
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            View and manage your extended family network
          </p>
        </div>

        {/* Family Units Grid */}
        {familyUnits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Family Units Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Create your first family unit to start organizing your extended family network.
              </p>
              <Button onClick={() => setShowAddFamilyDialog(true)}>
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
      <Dialog open={showAddFamilyDialog} onOpenChange={setShowAddFamilyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Family Unit</DialogTitle>
            <DialogDescription>
              Create a new family unit to organize your extended family network.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFamily} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name *</Label>
              <Input
                id="familyName"
                placeholder="e.g., The Johnson Family"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyRelationship">Relationship</Label>
              <Input
                id="familyRelationship"
                placeholder="e.g., In-Laws, Extended Family"
                value={familyRelationship}
                onChange={(e) => setFamilyRelationship(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyDescription">Description</Label>
              <Input
                id="familyDescription"
                placeholder="Optional description"
                value={familyDescription}
                onChange={(e) => setFamilyDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddFamilyDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Family Unit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteMemberDialog} onOpenChange={setShowInviteMemberDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>
              Add a new member to your primary family unit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteFirstName">Full Name *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="inviteFirstName"
                  placeholder="First name"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Last name"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
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
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invitePhone">Phone</Label>
              <Input
                id="invitePhone"
                type="tel"
                placeholder="(555) 123-4567"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRelationship">Relationship *</Label>
              <Select value={inviteRelationship} onValueChange={setInviteRelationship}>
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
                  setShowInviteMemberDialog(false);
                  resetInviteForm();
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
    </>
  );
}
