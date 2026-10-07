import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getIsAdmin, getOnboardingStatus } from "@/lib/auth-session";

/**
 * Auth Layout - Wraps all authenticated routes
 *
 * Checks (in order):
 * 1. User is authenticated (redirect to login if not)
 * 2. If admin -> skip remaining checks (admins bypass onboarding/subscription)
 * 3. User has completed onboarding (redirect to /onboarding if not)
 * Planning and Executor entitlements are checked independently by child layouts.
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
export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  // Check 1: Authentication
  if (!userId) {
    redirect("/login");
  }

  // Check 2: Admin bypass - admins skip onboarding and subscription checks
  const isAdmin = await getIsAdmin();

  if (isAdmin) {
    return <>{children}</>;
  }

  // Check 3: Onboarding completion (profile + household)
  const onboardingStatus = await getOnboardingStatus();

  if (onboardingStatus?.needsOnboarding) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
