"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { FullPageLoader } from "@/components/full-page-loader";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PricingPlans } from "@/components/pricing-plans";
import { useEffectiveSubscription } from "@/lib/feature-access-hooks";

/**
 * Public Pricing Page
 *
 * Displays custom pricing cards that redirect to Stripe Checkout.
 *
 * - Unauthenticated users: See plans, redirected to sign-up on click
 * - Authenticated users without plan: Can select a plan directly
 * - Authenticated users with plan: Redirected to /select-plan?change=true
 */
export default function PricingPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { effectiveTier, subscriptionStatus } = useEffectiveSubscription();

  const hasActivePlan = isSignedIn && effectiveTier && subscriptionStatus === "active";

  useEffect(() => {
    if (!isLoaded) return;
    if (hasActivePlan) {
      router.push("/select-plan?change=true");
    }
  }, [isLoaded, hasActivePlan, router]);

  if (!isLoaded) {
    return <FullPageLoader />;
  }

  if (hasActivePlan) {
    return <FullPageLoader />;
  }

  return (
    <PublicPageLayout>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center mb-12">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Simple, transparent pricing
          </p>
          <h1 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Choose Your Legacy Plan
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Start preserving your family's story today. All plans include a 7-day free trial.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingPlans />
        </div>
      </section>
    </PublicPageLayout>
  );
}
