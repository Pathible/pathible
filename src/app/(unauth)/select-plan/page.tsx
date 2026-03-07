"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { FullPageLoader } from "@/components/full-page-loader";
import { PricingPlans } from "@/components/pricing-plans";
import { Button } from "@/components/ui/button";
import { useEffectiveSubscription } from "@/lib/feature-access-hooks";

/**
 * Select Plan Page
 *
 * Displays custom pricing cards that redirect to Stripe Checkout.
 *
 * Modes:
 * - New users: Redirected here from middleware if no active subscription
 * - Existing users: Access via ?change=true to manage via Stripe Customer Portal
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
  const { isLoaded, isSignedIn } = useAuth();
  const { effectiveTier, subscriptionStatus } = useEffectiveSubscription();
  const [isRedirectingToPortal, setIsRedirectingToPortal] = useState(false);

  const isChangingPlan = searchParams.get("change") === "true";
  const hasActivePlan = effectiveTier && subscriptionStatus === "active";

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/login?redirect=/select-plan");
      return;
    }

    // If user already has a plan and NOT changing plans, redirect to dashboard
    if (hasActivePlan && !isChangingPlan) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, hasActivePlan, isChangingPlan, router]);

  const handleManageSubscription = async () => {
    setIsRedirectingToPortal(true);
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
    } finally {
      setIsRedirectingToPortal(false);
    }
  };

  if (!isLoaded) {
    return <FullPageLoader />;
  }

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
              : "Start preserving your family's story today. All plans include a 7-day free trial."}
          </p>
          {isChangingPlan && (
            <div className="flex justify-center gap-3 mt-4">
              <Button variant="ghost" asChild>
                <Link href="/profile-settings">← Back to Settings</Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={isRedirectingToPortal}
              >
                {isRedirectingToPortal ? "Opening..." : "Manage in Stripe"}
              </Button>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <PricingPlans currentTier={effectiveTier} mode={isChangingPlan ? "change" : "new"} />

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
