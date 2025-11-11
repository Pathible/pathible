import { DashboardLayout } from "@/app/(auth)/dashboard/components/DashboardLayout";
import { ReactNode } from "react";
import { getServerSession, getServerSessionWithProfile } from "@/lib/auth-session";
import { redirect } from "next/navigation";

/**
 * Auth Layout - Wraps all authenticated routes
 *
 * Checks:
 * 1. User is authenticated (redirect to login if not)
 * 2. User has a profile (redirect to onboarding if not)
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  // Check authentication
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Check profile exists
  const sessionWithProfile = await getServerSessionWithProfile();

  if (!sessionWithProfile) {
    redirect("/onboarding");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
