"use client";

import { PricingTable, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { FullPageLoader } from "@/components/full-page-loader";
import { Button } from "@/components/ui/button";
import { checkHasActivePlan } from "@/lib/feature-access";

/**
 * Select Plan Page
 *
 * Uses Clerk's PricingTable component to display subscription options.
 * Plans must be configured in the Clerk Dashboard under Billing > Plans.
 *
 * Modes:
 * - New users: Redirected here from middleware if no active subscription
 * - Existing users: Access via ?change=true to upgrade/downgrade plans
 */
export default function SelectPlanPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <SelectPlanContent />
    </Suspense>
  );
}

function SelectPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, has } = useAuth();

  // Check if user is changing their existing plan
  const isChangingPlan = searchParams.get("change") === "true";

  // Check for active subscription using shared utility
  const hasActivePlan = checkHasActivePlan(has);

  // Check if user already has an active plan (only redirect if not changing plan)
  useEffect(() => {
    if (!isLoaded) return;

    // If not signed in, redirect to login
    if (!isSignedIn) {
      router.push("/login?redirect=/select-plan");
      return;
    }

    // If user already has a plan and NOT changing plans, redirect to dashboard
    if (hasActivePlan && !isChangingPlan) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, hasActivePlan, isChangingPlan, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return <FullPageLoader />;
  }

  // If not signed in, show loading (redirect will happen)
  if (!isSignedIn) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="w-full max-w-5xl mx-auto">
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            {isChangingPlan ? "Change Your Plan" : "Choose Your Legacy Plan"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isChangingPlan
              ? "Upgrade or downgrade your subscription. Changes take effect immediately with prorated billing."
              : "Start preserving your family's story today. All plans include core features with varying levels of storage, support, and advanced tools."}
          </p>
          {isChangingPlan && (
            <Button variant="ghost" className="mt-4" asChild>
              <Link href="/profile-settings">← Back to Settings</Link>
            </Button>
          )}
        </div>

        {/* Clerk PricingTable */}
        <PricingTable
          newSubscriptionRedirectUrl={isChangingPlan ? "/profile-settings" : "/dashboard"}
        />

        {/* Trust Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Trusted by Many Families</h2>
            <p className="text-muted-foreground">
              Join other families preserving their legacies with Pathible. Our secure platform
              ensures your memories and documents are protected for generations to come.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
