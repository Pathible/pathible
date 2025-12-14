import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/app/(auth)/dashboard/components/DashboardLayout";
import { checkHasActivePlan } from "@/lib/subscription-plans";

/**
 * Auth Layout - Wraps all authenticated routes
 *
 * Checks:
 * 1. User is authenticated (redirect to login if not)
 * 2. User has an active subscription (redirect to select-plan if not)
 *
 * Note: This is a backup check - middleware also enforces subscription.
 * Profile checking is handled client-side by individual pages.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const { userId, has } = await auth();

  // Check authentication
  if (!userId) {
    redirect("/login");
  }

  // Check subscription status (backup to middleware)
  const hasActivePlan = checkHasActivePlan(has);

  if (!hasActivePlan) {
    redirect("/select-plan");
  }

  // If authenticated and subscribed, render the protected content
  return <DashboardLayout>{children}</DashboardLayout>;
}
