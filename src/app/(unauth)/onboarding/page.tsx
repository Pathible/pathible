"use client";

import { useMutation } from "convex/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";

/**
 * Multi-Step Onboarding Wizard
 *
 * Guides new users through:
 * 1. Profile completion
 * 2. First household creation
 * 3. Goals and preferences
 * 4. Family member invitations (optional)
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Step 2: Household
  const [householdName, setHouseholdName] = useState("");
  const [householdDescription, setHouseholdDescription] = useState("");

  // Step 3: Goals
  type Goal =
    | "document_organization"
    | "legacy_planning"
    | "family_heritage"
    | "financial_clarity"
    | "estate_planning"
    | "end_of_life_planning";
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);

  // Step 4: Invitations
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Mutations
  const updateProfileMutation = useMutation(api.onboarding.updateProfile);
  const createHouseholdMutation = useMutation(api.onboarding.createFirstHousehold);
  const setPreferencesMutation = useMutation(api.onboarding.setPreferences);
  const sendInvitationsMutation = useMutation(api.onboarding.sendInvitations);
  const skipInvitationsMutation = useMutation(api.onboarding.skipInvitations);

  const goalOptions: Array<{ id: Goal; label: string }> = [
    { id: "document_organization", label: "Organize important documents" },
    { id: "legacy_planning", label: "Plan my legacy and estate" },
    { id: "family_heritage", label: "Preserve family stories and heritage" },
    { id: "financial_clarity", label: "Achieve financial clarity" },
    { id: "estate_planning", label: "Complete estate planning" },
    { id: "end_of_life_planning", label: "End-of-life planning" },
  ];

  const handleGoalToggle = (goalId: Goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId],
    );
  };

  const handleNext = async () => {
    setIsLoading(true);

    try {
      if (currentStep === 1) {
        // Validate Step 1
        if (!firstName.trim() || !lastName.trim()) {
          toast.error("Please enter your first and last name");
          setIsLoading(false);
          return;
        }

        // Update profile
        await updateProfileMutation({
          firstName,
          lastName,
          phone: phone || undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).getTime() : undefined,
        });

        toast.success("Profile updated!");
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Validate Step 2
        if (!householdName.trim()) {
          toast.error("Please enter a household name");
          setIsLoading(false);
          return;
        }

        // Create household
        await createHouseholdMutation({
          name: householdName,
          description: householdDescription || undefined,
        });

        toast.success("Household created!");
        setCurrentStep(3);
      } else if (currentStep === 3) {
        // Validate Step 3
        if (selectedGoals.length === 0) {
          toast.error("Please select at least one goal");
          setIsLoading(false);
          return;
        }

        // Set preferences
        await setPreferencesMutation({
          goals: selectedGoals,
          emailNotifications: true,
          interestedFeatures: [],
        });

        toast.success("Preferences saved!");
        setCurrentStep(4);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipInvitations = async () => {
    setIsLoading(true);
    try {
      await skipInvitationsMutation({});
      toast.success("Welcome to Pathible!");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      await sendInvitationsMutation({
        invitations: [
          {
            email: inviteEmail,
            relationship: inviteRelationship || undefined,
            role: "steward",
          },
        ],
      });

      toast.success("Invitation sent! Welcome to Pathible!");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/pathible-logo.svg"
            alt="Pathible"
            width={150}
            height={150}
            className="h-12 w-auto mx-auto"
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Complete Your Profile"}
              {currentStep === 2 && "Create Your First Household"}
              {currentStep === 3 && "What brings you to Pathible?"}
              {currentStep === 4 && "Invite Your First Family Member"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with some basic information about you"}
              {currentStep === 2 && "Every family needs a home base"}
              {currentStep === 3 && "Help us personalize your experience"}
              {currentStep === 4 && "Family is better together (you can skip this step)"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 2: Household */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="householdName">Household Name *</Label>
                  <Input
                    id="householdName"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="The Smith Family"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This is how your family group will be identified
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="householdDescription">Description (Optional)</Label>
                  <Input
                    id="householdDescription"
                    value={householdDescription}
                    onChange={(e) => setHouseholdDescription(e.target.value)}
                    placeholder="A brief description of your family..."
                  />
                </div>
              </>
            )}

            {/* Step 3: Goals */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {goalOptions.map((goal) => (
                  <div key={goal.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={goal.id}
                      checked={selectedGoals.includes(goal.id)}
                      onCheckedChange={() => handleGoalToggle(goal.id)}
                    />
                    <Label
                      htmlFor={goal.id}
                      className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                      {goal.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Invitations */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteRelationship">Relationship (Optional)</Label>
                  <Input
                    id="inviteRelationship"
                    value={inviteRelationship}
                    onChange={(e) => setInviteRelationship(e.target.value)}
                    placeholder="e.g., Spouse, Child, Parent"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  You can always invite more family members later from your dashboard
                </p>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Next"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSkipInvitations} disabled={isLoading}>
                    Skip for now
                  </Button>
                  <Button onClick={handleSendInvitation} disabled={isLoading}>
                    {isLoading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Send Invite & Continue
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
