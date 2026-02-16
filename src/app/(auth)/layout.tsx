import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getHasTierOverride, getIsAdmin, getOnboardingStatus } from "@/lib/auth-session";
import { checkHasActivePlan } from "@/lib/feature-access";

/**
 * Auth Layout - Wraps all authenticated routes
 *
 * Checks (in order):
 * 1. User is authenticated (redirect to login if not)
 * 2. If admin → skip remaining checks (admins bypass onboarding/subscription)
 * 3. User has completed onboarding (redirect to /onboarding if not)
 * 4. User has an active subscription (redirect to select-plan if not)
 *
 * This ensures regular users cannot access protected routes like /vault or /dashboard
 * without completing the full setup flow, while admins can access the admin panel
 * regardless of onboarding or subscription status.
 *
 * Note: This layout does NOT include a visual wrapper. Child route groups
 * provide their own layouts:
 * - (dashboard)/ uses DashboardLayout for user-facing routes
 * - admin/ uses AdminLayout for admin routes
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const { userId, has } = await auth();

  // Check 1: Authentication
  if (!userId) {
    redirect("/login");
  }

  // Check 2: Admin bypass - admins skip onboarding and subscription checks
  // This allows admins to access the admin panel without completing user setup
  const isAdmin = await getIsAdmin();

  if (isAdmin) {
    // Admin users bypass all remaining checks
    return <>{children}</>;
  }

  // Check 3: Onboarding completion (profile + household)
  const onboardingStatus = await getOnboardingStatus();

  if (onboardingStatus?.needsOnboarding) {
    // User needs to complete onboarding
    // Redirect to appropriate step based on current status
    redirect("/onboarding");
  }

  // Check 4: Subscription status (backup to middleware)
  // First check Clerk billing, then fall back to Convex tierOverride
  // This allows demo/partner accounts to bypass Clerk billing via tierOverride
  const hasActivePlan = checkHasActivePlan(has);

  if (!hasActivePlan) {
    const hasTierOverride = await getHasTierOverride();
    if (!hasTierOverride) {
      redirect("/select-plan");
    }
  }

  // All checks passed - render the protected content
  // Visual layout is provided by child route groups
  return <>{children}</>;
}
