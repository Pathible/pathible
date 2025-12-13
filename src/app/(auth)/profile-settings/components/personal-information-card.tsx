"use client";

import { UserButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface FormData {
  firstName: string;
  lastName: string;
}

export function PersonalInformationCard({ profile, email }: PersonalInformationCardProps) {
  const updateProfile = useMutation(api.profiles.update);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your name and manage your account</CardDescription>
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
            <div className="flex items-center gap-4">
              <Input type="email" value={email || ""} disabled className="bg-muted flex-1" />
              <UserButton
                appearance={{
                  elements: {
                    userButtonTrigger: "focus:shadow-none",
                  },
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Click your profile picture to manage your email, password, and security settings.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
