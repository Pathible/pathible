"use client";

import { useQuery } from "convex/react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import { AdminLayout as AdminLayoutComponent } from "./components/admin-layout";

/**
 * Admin Layout - Wraps all admin routes
 *
 * Checks that user has admin role (redirects to dashboard if not).
 *
 * Note: Authentication is handled by the parent (auth) layout.
 * This layout only verifies admin role for access control.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const myRole = useQuery(api.roles.getMyRole);

  // Wait for role to load
  if (myRole === undefined) {
    return <AdminLoadingState />;
  }

  // Redirect if not admin
  if (myRole !== "admin") {
    redirect("/dashboard");
  }

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}

function AdminLoadingState() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    </div>
  );
}
