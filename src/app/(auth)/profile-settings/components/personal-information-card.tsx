"use client";

import { useMutation } from "convex/react";
import { Loader2, Mail, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

interface PersonalInformationCardProps {
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  email?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
}

export function PersonalInformationCard({ profile, email }: PersonalInformationCardProps) {
  const updateProfile = useMutation(api.profiles.update);
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success("Personal information updated successfully");
    } catch (error) {
      toast.error("Failed to update personal information", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === email) {
      toast.error("Please enter a different email address");
      return;
    }

    setIsChangingEmail(true);
    try {
      // Better Auth changeEmail sends verification to new email
      const result = await authClient.changeEmail({
        newEmail,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to change email");
      }

      toast.success("Verification email sent", {
        description: `Check ${newEmail} for a verification link to complete the change.`,
      });
      setShowEmailForm(false);
      setNewEmail("");
    } catch (error) {
      toast.error("Failed to change email", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your name and email address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName", {
                  required: "First name is required",
                })}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName", {
                  required: "Last name is required",
                })}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={!isDirty || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Name
              </>
            )}
          </Button>
        </form>

        {/* Email Section */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="flex items-center gap-2">
              <Input type="email" value={email || ""} disabled className="bg-muted flex-1" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEmailForm(!showEmailForm)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Change
              </Button>
            </div>
          </div>

          {showEmailForm && (
            <div className="mt-4 space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="Enter new email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isChangingEmail}
                />
                <p className="text-xs text-muted-foreground">
                  A verification email will be sent to confirm the change.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleChangeEmail}
                  disabled={isChangingEmail || !newEmail}
                >
                  {isChangingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEmailForm(false);
                    setNewEmail("");
                  }}
                  disabled={isChangingEmail}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
