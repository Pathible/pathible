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
 * Checks that user has admin role (redirects to dashboard if not).
 *
 * Note: Authentication is handled by the parent (auth) layout.
 * This layout only verifies admin role for access control.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  // Skip query until Clerk auth is loaded and user is signed in
  // This prevents the query from running before Convex has the auth token
  const myRole = useQuery(api.roles.getMyRole, isLoaded && isSignedIn ? {} : "skip");

  // Wait for Clerk auth to load
  if (!isLoaded) {
    return <AdminLoadingState />;
  }

  // This shouldn't happen since parent (auth) layout checks auth,
  // but handle it defensively
  if (!isSignedIn) {
    redirect("/login?redirect=/admin");
  }

  // Wait for role query to complete
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
