"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { BookOpen, FileText, LayoutDashboard, Shield, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";

type SubscriptionTier = "foundations" | "heritage" | "legacy" | "founders";

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  foundations: 1,
  heritage: 2,
  legacy: 3,
  founders: 4,
};

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    tourKey: "nav-dashboard",
    requiredTier: "foundations" as SubscriptionTier,
  },
  {
    title: "Heritage Vault",
    href: "/vault",
    icon: Shield,
    tourKey: "nav-vault",
    requiredTier: "foundations" as SubscriptionTier,
  },
  {
    title: "Financial Intelligence",
    href: "/financial",
    icon: TrendingUp,
    tourKey: "nav-financial",
    requiredTier: "foundations" as SubscriptionTier,
  },
  {
    title: "Family Ecosystem",
    href: "/family",
    icon: Users,
    tourKey: "nav-family",
    requiredTier: "foundations" as SubscriptionTier,
  },
  {
    title: "Wisdom & Education",
    href: "/wisdom",
    icon: BookOpen,
    tourKey: "nav-wisdom",
    requiredTier: "heritage" as SubscriptionTier,
  },
  {
    title: "Legacy Planning",
    href: "/legacy",
    icon: FileText,
    tourKey: "nav-legacy",
    requiredTier: "legacy" as SubscriptionTier,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households to determine effective tier
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];

  // Use tierOverride if set, otherwise fall back to subscriptionTier
  const effectiveTier: SubscriptionTier =
    household?.tierOverride ?? household?.subscriptionTier ?? "foundations";
  const currentTierLevel = TIER_LEVELS[effectiveTier];

  // Filter nav items based on effective tier
  const visibleNavItems = navItems.filter((item) => {
    const requiredLevel = TIER_LEVELS[item.requiredTier];
    return currentTierLevel >= requiredLevel;
  });

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar border-border">
      <SidebarContent className="gap-0">
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleNavItems.map((item) => {
                // Check if current path matches or is a sub-page of this nav item
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href} data-tour={item.tourKey}>
                    <SidebarMenuButton asChild isActive={isActive} className="px-2">
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
