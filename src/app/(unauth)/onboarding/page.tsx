"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

/**
 * Onboarding Page
 *
 * Note: Middleware ensures that:
 * 1. User is authenticated (redirects to login if not)
 * 2. User doesn't already have a profile (redirects to dashboard if they do)
 *
 * So this page can focus purely on collecting profile information.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createProfile = useMutation(api.profiles.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Onboarding] Creating profile...');
      await createProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      console.log('[Onboarding] Profile created successfully');
      toast.success("Welcome to Pathible!", {
        description: "Your profile has been created.",
      });

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.error("[Onboarding] Error creating profile:", error);
      toast.error("Failed to create profile", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/pathible-logo.svg"
            alt="Pathible"
            width={150}
            height={150}
            className="h-12 w-auto mx-auto"
          />
        </div>

        <div className="bg-card rounded-xl p-10 shadow-lg space-y-6">
          <div className="space-y-2">
            <h2 className="text-h2 text-foreground">Complete Your Profile</h2>
            <p className="text-secondary">Tell us a bit about yourself</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="first-name" className="text-small font-medium">
                First Name
              </Label>
              <Input
                id="first-name"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="input-field"
                data-testid="first-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name" className="text-small font-medium">
                Last Name
              </Label>
              <Input
                id="last-name"
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="input-field"
                data-testid="last-name-input"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
              data-testid="submit-profile-button"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2" />
                  Creating Profile...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>
          </form>

          <p className="text-caption text-muted-foreground text-center">
            This information will be used to personalize your experience.
          </p>
        </div>
      </div>
    </div>
  );
}
