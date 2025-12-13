"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardHeader } from "./dashboard-header";

/**
 * Dynamic Dashboard Header
 *
 * Fetches real user and household data from Clerk and Convex
 * to display in the header.
 */
export function DynamicDashboardHeader() {
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's profile from Convex
  const profile = useQuery(api.profiles.get, isUserLoaded && user ? {} : "skip");

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  // Get the first household name (primary household)
  const primaryHousehold = households?.[0];
  const familyName = primaryHousehold?.name ?? "My Family";

  // Get user's display name
  // Priority: Convex profile > Clerk user > fallback
  const userName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : (user?.fullName ?? user?.firstName ?? "User");

  return <DashboardHeader familyName={familyName} userName={userName} />;
}
