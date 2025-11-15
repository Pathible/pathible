import { DashboardLayout } from "@/app/(auth)/dashboard/components/DashboardLayout";
import { ReactNode } from "react";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

/**
 * Auth Layout - Wraps all authenticated routes
 *
 * Checks:
 * 1. User is authenticated (redirect to login if not)
 *
 * Note: Profile checking is handled client-side by individual pages.
 * This is because Better Auth + Convex doesn't have great server-side support
 * for authenticated queries in Server Components.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  // Check authentication - just verify session cookie exists
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // If authenticated, render the protected content
  // Individual pages will handle profile checks on the client side
  return <DashboardLayout>{children}</DashboardLayout>;
}
