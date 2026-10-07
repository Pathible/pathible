"use client";

import { useAuth } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FullPageLoader } from "@/components/full-page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { checkHasActivePlan } from "@/lib/feature-access";
import { normalizeReferralSource } from "@/lib/referral";

/**
 * Multi-Step Onboarding Wizard
 *
 * Guides new users through:
 * 1. Profile completion
 * 2. First household creation
 * 3. Goals and preferences
 *
 * After completing all steps:
 * - Users WITH an active subscription (subscribed from /pricing) → /dashboard
 * - Users WITHOUT a subscription → /select-plan
 *
 * Family invitations can be done later from the dashboard.
 *
 * Supports ?ref=<partner> URL parameter for partner referral tracking.
 */
export default function OnboardingPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { has } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3; // Reduced from 4 - invitations moved to dashboard

  // Capture partner referral from URL (e.g., ?ref=cfr)
  const [savedReferral, setSavedReferral] = useState<string>();
  useEffect(() => {
    setSavedReferral(
      normalizeReferralSource(
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("pathible_ref="))
          ?.split("=")[1],
      ),
    );
  }, []);
  const referralSource = normalizeReferralSource(searchParams.get("ref")) ?? savedReferral;

  // Check if user already has an active subscription (e.g., subscribed from /pricing)
  const hasActivePlan = checkHasActivePlan(has);

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

  const [isLoading, setIsLoading] = useState(false);

  // Mutations
  const reconcileBilling = useAction(api.billing.reconcileCurrentUser);
  const updateProfileMutation = useMutation(api.onboarding.updateProfile);
  const createHouseholdMutation = useMutation(api.onboarding.createFirstHousehold);
  const setPreferencesMutation = useMutation(api.onboarding.setPreferences);

  const userWithProfile = useQuery(api.auth.getCurrentUserWithProfile);
  const savedOnboarding = useQuery(
    api.onboarding.getStatus,
    userWithProfile?.profile ? {} : "skip",
  );
  const subscription = useQuery(api.auth.getEffectiveSubscription);
  const hasProductAccess = hasActivePlan || subscription?.hasAccess === true;
  const restored = useRef(false);
  useEffect(() => {
    if (!savedOnboarding || restored.current) return;
    restored.current = true;
    setFirstName(savedOnboarding.profile.firstName);
    setLastName(savedOnboarding.profile.lastName);
    setPhone(savedOnboarding.profile.phone ?? "");
    if (savedOnboarding.household) setHouseholdName(savedOnboarding.household.name);
    setCurrentStep(savedOnboarding.household ? 3 : Math.min(savedOnboarding.currentStep, 3));
  }, [savedOnboarding]);
  useEffect(() => {
    if (savedOnboarding?.status === "complete" && subscription !== undefined) {
      router.replace(hasProductAccess ? "/dashboard" : "/select-plan");
    }
  }, [savedOnboarding, subscription, hasProductAccess, router]);

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

        // Verify paid entitlement on the server before creating the household.
        if (hasActivePlan && !(await reconcileBilling({})))
          throw new Error("We could not confirm your paid plan yet. Please try again.");

        if (!savedOnboarding?.household)
          await createHouseholdMutation({
            name: householdName,
            description: householdDescription || undefined,
            referralSource,
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

        // Set preferences - this also marks onboarding as complete
        await setPreferencesMutation({
          goals: selectedGoals,
          emailNotifications: true,
          interestedFeatures: [],
        });

        // If user already has a plan (subscribed from /pricing), go to dashboard
        // Otherwise, redirect to plan selection
        if (hasProductAccess) {
          toast.success("Onboarding complete! Welcome to Pathible.");
          setTimeout(() => router.push("/dashboard"), 500);
        } else {
          toast.success("Onboarding complete! Now let's select your plan.");
          setTimeout(() => router.push("/select-plan"), 500);
        }
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

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4 py-8"
      data-testid="onboarding-page"
    >
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
        <div className="mb-8" data-testid="onboarding-progress">
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <p
            className="text-sm text-muted-foreground text-center"
            data-testid="onboarding-step-indicator"
          >
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
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with some basic information about you"}
              {currentStep === 2 && "Every family needs a home base"}
              {currentStep === 3 && "Help us personalize your experience"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <div data-testid="onboarding-step-profile">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      data-testid="onboarding-firstName"
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
                      data-testid="onboarding-lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    data-testid="onboarding-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                  <Input
                    id="dateOfBirth"
                    data-testid="onboarding-dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Household */}
            {currentStep === 2 && (
              <div data-testid="onboarding-step-household">
                <div className="space-y-2">
                  <Label htmlFor="householdName">Household Name *</Label>
                  <Input
                    id="householdName"
                    data-testid="onboarding-householdName"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="The Smith Family"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This is how your family group will be identified
                  </p>
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="householdDescription">Description (Optional)</Label>
                  <Input
                    id="householdDescription"
                    data-testid="onboarding-householdDescription"
                    value={householdDescription}
                    onChange={(e) => setHouseholdDescription(e.target.value)}
                    placeholder="A brief description of your family..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {currentStep === 3 && (
              <div className="space-y-4" data-testid="onboarding-step-goals">
                {goalOptions.map((goal) => (
                  <div key={goal.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={goal.id}
                      data-testid={`onboarding-goal-${goal.id}`}
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

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
                data-testid="onboarding-back-button"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isLoading}
                data-testid="onboarding-next-button"
              >
                {isLoading ? "Saving..." : currentStep === totalSteps ? "Complete Setup" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
