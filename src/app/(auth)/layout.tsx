import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/app/(auth)/dashboard/components/DashboardLayout";
import { getOnboardingStatus } from "@/lib/auth-session";
import { checkHasActivePlan } from "@/lib/subscription-plans";

/**
 * Auth Layout - Wraps all authenticated routes
 *
 * Checks (in order):
 * 1. User is authenticated (redirect to login if not)
 * 2. User has completed onboarding (redirect to /onboarding if not)
 * 3. User has an active subscription (redirect to select-plan if not)
 *
 * This ensures users cannot access protected routes like /vault or /dashboard
 * without completing the full setup flow.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const { userId, has } = await auth();

  // Check 1: Authentication
  if (!userId) {
    redirect("/login");
  }

  // Check 2: Onboarding completion (profile + household)
  const onboardingStatus = await getOnboardingStatus();

  if (onboardingStatus?.needsOnboarding) {
    // User needs to complete onboarding
    // Redirect to appropriate step based on current status
    redirect("/onboarding");
  }

  // Check 3: Subscription status (backup to middleware)
  const hasActivePlan = checkHasActivePlan(has);

  if (!hasActivePlan) {
    redirect("/select-plan");
  }

  // All checks passed - render the protected content
  return <DashboardLayout>{children}</DashboardLayout>;
}
