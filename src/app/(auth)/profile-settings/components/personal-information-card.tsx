"use client";

import { useUser } from "@clerk/nextjs";
import type { EmailAddressResource } from "@clerk/types";
import { useMutation } from "convex/react";
import { Loader2, Mail, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";

interface PersonalInformationCardProps {
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  email?: string;
}

interface NameFormData {
  firstName: string;
  lastName: string;
}

export function PersonalInformationCard({ profile, email }: PersonalInformationCardProps) {
  const { user } = useUser();
  const updateProfile = useMutation(api.profiles.update);

  // Email change state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<"enter" | "verify">("enter");
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmailAddress, setPendingEmailAddress] = useState<EmailAddressResource | null>(null);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<NameFormData>({
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
    },
  });

  const onSubmit = async (data: NameFormData) => {
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

  // Handle starting the email change process
  const handleStartEmailChange = async () => {
    if (!user || !newEmail.trim()) return;

    setIsEmailSubmitting(true);
    try {
      // Create new email address (this adds it to the user but doesn't make it primary yet)
      const emailAddress = await user.createEmailAddress({ email: newEmail.trim() });

      // Send verification code to the new email
      await emailAddress.prepareVerification({ strategy: "email_code" });

      setPendingEmailAddress(emailAddress);
      setEmailStep("verify");
      toast.success("Verification code sent", {
        description: `We sent a code to ${newEmail}`,
      });
    } catch (error) {
      console.error("Failed to create email address:", error);
      toast.error("Failed to send verification code", {
        description:
          error instanceof Error
            ? error.message.includes("already exists")
              ? "This email is already in use"
              : error.message
            : "Please try again",
      });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Handle verifying the OTP code
  const handleVerifyEmail = async () => {
    if (!user || !pendingEmailAddress || verificationCode.length !== 6) return;

    setIsEmailSubmitting(true);
    try {
      // Verify the code
      await pendingEmailAddress.attemptVerification({ code: verificationCode });

      // Set as primary email
      await user.update({ primaryEmailAddressId: pendingEmailAddress.id });

      toast.success("Email updated successfully", {
        description: `Your email is now ${newEmail}`,
      });

      // Reset and close
      handleCloseEmailDialog();
    } catch (error) {
      console.error("Failed to verify email:", error);
      toast.error("Verification failed", {
        description:
          error instanceof Error
            ? error.message.includes("incorrect")
              ? "The code you entered is incorrect"
              : error.message
            : "Please check the code and try again",
      });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Handle resending the verification code
  const handleResendCode = async () => {
    if (!pendingEmailAddress) return;

    setIsEmailSubmitting(true);
    try {
      await pendingEmailAddress.prepareVerification({ strategy: "email_code" });
      toast.success("New code sent", {
        description: `Check your inbox at ${newEmail}`,
      });
    } catch (error) {
      toast.error("Failed to resend code", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Reset and close the email dialog
  const handleCloseEmailDialog = () => {
    setEmailDialogOpen(false);
    setEmailStep("enter");
    setNewEmail("");
    setVerificationCode("");
    setPendingEmailAddress(null);
    setIsEmailSubmitting(false);
  };

  return (
    <>
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
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={email || ""} disabled className="bg-muted pl-10" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEmailDialogOpen(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is the email used to sign in to your account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Change Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={handleCloseEmailDialog}>
        <DialogContent className="sm:max-w-md">
          {emailStep === "enter" ? (
            <>
              <DialogHeader>
                <DialogTitle>Change Email Address</DialogTitle>
                <DialogDescription>
                  Enter your new email address. We&apos;ll send a verification code to confirm it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEmail">Current Email</Label>
                  <Input id="currentEmail" value={email || ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New Email Address</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="Enter new email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isEmailSubmitting}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEmailDialog}
                  disabled={isEmailSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleStartEmailChange}
                  disabled={!newEmail.trim() || isEmailSubmitting}
                >
                  {isEmailSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Verify Your Email</DialogTitle>
                <DialogDescription>
                  Enter the 6-digit code we sent to <strong>{newEmail}</strong>
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-6">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                  disabled={isEmailSubmitting}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isEmailSubmitting}
                  className="text-muted-foreground"
                >
                  Didn&apos;t receive a code? Resend
                </Button>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEmailStep("enter");
                    setVerificationCode("");
                  }}
                  disabled={isEmailSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={verificationCode.length !== 6 || isEmailSubmitting}
                >
                  {isEmailSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
