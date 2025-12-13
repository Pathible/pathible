"use client";

import { PricingTable, useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Select Plan Page
 *
 * Displays Clerk's PricingTable for users to select a subscription plan.
 * This page is shown after onboarding completion and before accessing the dashboard.
 *
 * Users without an active subscription are redirected here from the middleware.
 */
export default function SelectPlanPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, has } = useAuth();

  // Check if user already has an active plan
  useEffect(() => {
    if (!isLoaded) return;

    // If not signed in, redirect to login
    if (!isSignedIn) {
      router.push("/login?redirect=/select-plan");
      return;
    }

    // Check for active subscription
    const hasActivePlan =
      has?.({ plan: "foundations" }) || has?.({ plan: "heritage" }) || has?.({ plan: "legacy" });

    // If user already has a plan, redirect to dashboard
    if (hasActivePlan) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, has, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If not signed in, show loading (redirect will happen)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-4xl">
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

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Select a plan to start your legacy journey. All plans include full access to Pathible's
            core features with varying levels of storage and support.
          </p>
        </div>

        {/* Clerk PricingTable - handles entire checkout flow */}
        <div className="[&_.cl-pricingTable]:bg-transparent">
          <PricingTable />
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
