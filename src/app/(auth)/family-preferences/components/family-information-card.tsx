"use client";

import { useMutation } from "convex/react";
import { Loader2, Save, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface FamilyInformationCardProps {
  household: {
    _id: Id<"households">;
    name: string;
    description?: string;
    imageUrl?: string;
  };
  canEdit: boolean;
}

interface FormData {
  name: string;
  description: string;
}

export function FamilyInformationCard({ household, canEdit }: FamilyInformationCardProps) {
  const updateHousehold = useMutation(api.households.update);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: household.name,
      description: household.description || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateHousehold({
        householdId: household._id,
        name: data.name,
        description: data.description || undefined,
      });
      toast.success("Family information updated successfully");
    } catch (error) {
      toast.error("Failed to update family information", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Information</CardTitle>
        <CardDescription>Basic details about your immediate family unit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Family Name</Label>
            <Input
              id="name"
              placeholder="e.g., The Smith Family"
              disabled={!canEdit}
              {...register("name", {
                required: "Family name is required",
                maxLength: {
                  value: 100,
                  message: "Family name is too long (max 100 characters)",
                },
              })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your family..."
              rows={4}
              disabled={!canEdit}
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description is too long (max 500 characters)",
                },
              })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyImage">Family Image or Crest</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <span className="text-sm text-muted-foreground">Coming soon</span>
            </div>
          </div>

          {canEdit && (
            <Button type="submit" disabled={!isDirty || isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}

          {!canEdit && (
            <p className="text-sm text-muted-foreground">
              Only family owners and stewards can edit these settings.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
