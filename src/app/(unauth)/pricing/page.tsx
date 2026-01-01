"use client";

import { PricingTable, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { FullPageLoader } from "@/components/full-page-loader";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { checkHasActivePlan } from "@/lib/subscription-plans";

/**
 * Public Pricing Page
 *
 * Displays Clerk's PricingTable for visitors to view subscription options.
 * Uses PublicPageLayout for consistent header/footer with home page.
 *
 * - Unauthenticated users: See plans, Clerk handles sign-up + checkout flow
 * - Authenticated users without plan: Can select a plan directly
 * - Authenticated users with plan: Redirected to /select-plan?change=true
 *
 * After successful checkout, users are redirected to /onboarding to complete
 * their profile setup before accessing the dashboard.
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
  const { isLoaded, isSignedIn, has } = useAuth();

  // Check for active subscription using shared utility
  const hasActivePlan = checkHasActivePlan(has);

  // If user is signed in with an active plan, redirect to change plan page
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && hasActivePlan) {
      router.push("/select-plan?change=true");
    }
  }, [isLoaded, isSignedIn, hasActivePlan, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return <FullPageLoader />;
  }

  // If signed in with active plan, show loading (redirect will happen)
  if (isSignedIn && hasActivePlan) {
    return <FullPageLoader />;
  }

  return (
    <PublicPageLayout>
      <section className="py-16 sm:py-24">
        {/* Header - constrained width for readability */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center mb-12">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Simple, transparent pricing
          </p>
          <h1 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Choose Your Legacy Plan
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Start preserving your family's story today. All plans include core features with varying
            levels of storage, support, and advanced tools.
          </p>
        </div>

        {/* Clerk PricingTable - wider container for 3-column layout on desktop */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingTable newSubscriptionRedirectUrl="/onboarding" />
        </div>
      </section>
    </PublicPageLayout>
  );
}
