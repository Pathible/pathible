"use client";

import { useMutation } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";

interface ContactInformationCardProps {
  profile: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

interface FormData {
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export function ContactInformationCard({ profile }: ContactInformationCardProps) {
  const updateContactInfo = useMutation(api.profiles.updateContactInfo);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      zipCode: profile.zipCode || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateContactInfo({
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zipCode || undefined,
      });
      toast.success("Contact information updated successfully");
    } catch (error) {
      toast.error("Failed to update contact information", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Update your phone number and mailing address</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              {...register("phone", {
                maxLength: {
                  value: 20,
                  message: "Phone number is too long",
                },
              })}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Main Street"
              {...register("address", {
                maxLength: {
                  value: 200,
                  message: "Address is too long",
                },
              })}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                {...register("city", {
                  maxLength: {
                    value: 100,
                    message: "City name is too long",
                  },
                })}
              />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="CA"
                maxLength={2}
                className="uppercase"
                {...register("state", {
                  validate: (value) => {
                    if (!value) return true; // Allow empty
                    if (value.length !== 2) return "State must be a 2-letter code (e.g., CA, NY)";
                    if (!/^[A-Za-z]{2}$/.test(value)) return "State must be letters only";
                    return true;
                  },
                })}
              />
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                placeholder="12345"
                maxLength={10}
                {...register("zipCode", {
                  validate: (value) => {
                    if (!value) return true; // Allow empty
                    // US ZIP: 5 digits or 5+4 with optional dash
                    if (!/^\d{5}(-?\d{4})?$/.test(value)) {
                      return "ZIP code must be 5 digits (e.g., 12345) or 9 digits (e.g., 12345-6789)";
                    }
                    return true;
                  },
                })}
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive">{errors.zipCode.message}</p>
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
                Save Contact Info
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
