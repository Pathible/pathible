"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { HelpCircle, User } from "lucide-react";
import {
  DashboardHeader,
  type HeaderMenuItem,
} from "@/app/(auth)/(dashboard)/dashboard/components/dashboard-header";
import { api } from "@/convex/_generated/api";

const estateMenuItems: HeaderMenuItem[] = [
  { label: "Profile Settings", href: "/estate/profile-settings", icon: User },
  { label: "Help Center", href: "/help", icon: HelpCircle },
];

export function DynamicEstateHeader() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const profile = useQuery(api.profiles.get, isUserLoaded && user ? {} : "skip");
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  const familyName = households?.[0]?.name ?? "My Family";
  const userName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : (user?.fullName ?? user?.firstName ?? "User");

  return (
    <DashboardHeader familyName={familyName} userName={userName} menuItems={estateMenuItems} />
  );
}
