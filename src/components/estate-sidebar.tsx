"use client";

import {
  Briefcase,
  CheckSquare,
  Download,
  FileText,
  Gift,
  LayoutDashboard,
  Mail,
  Share2,
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
import { useEstateMode } from "@/hooks/use-estate-mode";

const estateNavItems = [
  {
    title: "Overview",
    href: "/estate",
    icon: LayoutDashboard,
    testId: "estate-nav-overview",
  },
  {
    title: "Checklist",
    href: "/estate/checklist",
    icon: CheckSquare,
    testId: "estate-nav-checklist",
  },
  {
    title: "Assets",
    href: "/estate/assets",
    icon: Briefcase,
    testId: "estate-nav-assets",
  },
  {
    title: "Documents",
    href: "/estate/documents",
    icon: FileText,
    testId: "estate-nav-documents",
  },
  {
    title: "Sharing",
    href: "/estate/shares",
    icon: Share2,
    testId: "estate-nav-shares",
  },
  {
    title: "Communications",
    href: "/estate/communications",
    icon: Mail,
    testId: "estate-nav-communications",
  },
  {
    title: "Distributions",
    href: "/estate/distributions",
    icon: Gift,
    testId: "estate-nav-distributions",
  },
  {
    title: "Export",
    href: "/estate/export",
    icon: Download,
    testId: "estate-nav-export",
  },
];

export function EstateSidebar() {
  const pathname = usePathname();
  const { hasPlanningAccess } = useEstateMode();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-sidebar border-border"
      data-testid="estate-sidebar"
    >
      <SidebarContent className="gap-0">
        <SidebarGroup className="py-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {estateNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href} data-testid={item.testId}>
                    <SidebarMenuButton asChild isActive={isActive} className="px-2">
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {hasPlanningAccess && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="px-2">
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Legacy Planning</span>
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
