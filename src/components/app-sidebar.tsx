"use client";

import {
  BookOpen,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Scale,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { tierHasAccess } from "@/convex/shared/subscriptionTiers";
import { useEstateMode } from "@/hooks/use-estate-mode";
import {
  FEATURE_SLUGS,
  type FeatureSlug,
  type SubscriptionTier,
  useEffectiveMultipleFeatureAccess,
} from "@/lib/feature-access";

type TierAccess = {
  strategy: "tier";
  requiredTier: SubscriptionTier;
};

type FeatureAccess = {
  strategy: "anyFeature" | "allFeatures";
  features: FeatureSlug[];
};

type NavAccess = TierAccess | FeatureAccess;

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  tourKey: string;
  access?: NavAccess;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    tourKey: "nav-dashboard",
  },
  {
    title: "Heritage Vault",
    href: "/vault",
    icon: Shield,
    tourKey: "nav-vault",
    access: {
      strategy: "anyFeature",
      features: [
        FEATURE_SLUGS.VAULT_DOCUMENT_STORAGE,
        FEATURE_SLUGS.VAULT_PHOTO_VIDEO,
        FEATURE_SLUGS.VAULT_FOLDERS,
        FEATURE_SLUGS.VAULT_TAGS_COLLECTIONS,
        FEATURE_SLUGS.VAULT_VOICE_UPLOADS,
        FEATURE_SLUGS.VAULT_GUIDED_ORGANIZATION,
      ],
    },
  },
  {
    title: "Financial Clarity",
    href: "/financial",
    icon: TrendingUp,
    tourKey: "nav-financial",
    access: {
      strategy: "anyFeature",
      features: [
        FEATURE_SLUGS.FINANCIAL_OVERVIEW,
        FEATURE_SLUGS.FINANCIAL_SUMMARIES,
        FEATURE_SLUGS.FINANCIAL_INSIGHTS,
        FEATURE_SLUGS.FINANCIAL_SPENDING_CATEGORIES,
        FEATURE_SLUGS.FINANCIAL_TRENDS,
      ],
    },
  },
  {
    title: "Family Ecosystem",
    href: "/family",
    icon: Users,
    tourKey: "nav-family",
    access: {
      strategy: "anyFeature",
      features: [
        FEATURE_SLUGS.FAMILY_MEMBERS,
        FEATURE_SLUGS.FAMILY_PROFILES,
        FEATURE_SLUGS.FAMILY_MESSAGING,
        FEATURE_SLUGS.FAMILY_RELATIONSHIPS,
      ],
    },
  },
  {
    title: "Wisdom & Stories",
    href: "/wisdom",
    icon: BookOpen,
    tourKey: "nav-wisdom",
    access: {
      strategy: "anyFeature",
      features: [FEATURE_SLUGS.WISDOM_ENTRIES, FEATURE_SLUGS.WISDOM_SHARED_PAGES],
    },
  },
  {
    title: "Legacy Planning",
    href: "/legacy",
    icon: FileText,
    tourKey: "nav-legacy",
    access: {
      strategy: "tier",
      requiredTier: "legacy",
    },
  },
];

const navFeatureRequirements = Array.from(
  new Set<FeatureSlug>(
    navItems.flatMap((item) => {
      const access = item.access;
      if (!access || access.strategy === "tier") return [];
      return access.features;
    }),
  ),
);

export function AppSidebar() {
  const pathname = usePathname();
  const {
    features: featureAccessMap,
    isLoading,
    effectiveTier,
  } = useEffectiveMultipleFeatureAccess(navFeatureRequirements);
  const accessReady = !isLoading && effectiveTier !== null;
  const { isEstateMode, hasExecutorPurchase } = useEstateMode();

  // Estate Administration is visible when:
  // - Estate mode is active (visible to ALL household members), OR
  // - Household has purchased the executor product
  const showEstateNav = isEstateMode || hasExecutorPurchase;

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar border-border">
      <SidebarContent className="gap-0">
        <SidebarGroup className="py-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                const hasAccess = accessReady
                  ? evaluateNavAccess(item.access, effectiveTier, featureAccessMap)
                  : true;
                const isLocked = accessReady && Boolean(item.access) && !hasAccess;

                if (isLocked) {
                  return null;
                }

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
              {showEstateNav && (
                <SidebarMenuItem data-tour="nav-estate" data-testid="estate-admin-nav-item">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/estate")}
                    className="px-2"
                  >
                    <Link href="/estate">
                      <Scale className="h-4 w-4" />
                      <span>Estate Administration</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function evaluateNavAccess(
  access: NavAccess | undefined,
  effectiveTier: SubscriptionTier | null,
  featureAccessMap: Record<FeatureSlug, boolean>,
) {
  if (!access) {
    return true;
  }

  if (access.strategy === "tier") {
    if (!effectiveTier) return false;
    return tierHasAccess(effectiveTier, access.requiredTier);
  }

  if (!access.features.length) {
    return false;
  }

  const featureStates = access.features.map((feature) => featureAccessMap[feature]);

  return access.strategy === "allFeatures"
    ? featureStates.every(Boolean)
    : featureStates.some(Boolean);
}
