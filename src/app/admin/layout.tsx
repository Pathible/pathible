"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import { AdminLayout as AdminLayoutComponent } from "./components/admin-layout";

/**
 * Admin Layout - Wraps all admin routes
 *
 * Checks:
 * 1. User is authenticated (redirect to login if not)
 * 2. User has admin role (redirect to dashboard if not)
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const myRole = useQuery(api.roles.getMyRole);

  // Wait for auth to load
  if (!isLoaded) {
    return <AdminLoadingState />;
  }

  // Redirect if not signed in
  if (!isSignedIn) {
    redirect("/login?redirect=/admin");
  }

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
