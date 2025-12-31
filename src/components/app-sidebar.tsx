"use client";

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

const navItems = [
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
  },
  {
    title: "Financial Intelligence",
    href: "/financial",
    icon: TrendingUp,
    tourKey: "nav-financial",
  },
  {
    title: "Family Ecosystem",
    href: "/family",
    icon: Users,
    tourKey: "nav-family",
  },
  {
    title: "Wisdom & Education",
    href: "/wisdom",
    icon: BookOpen,
    tourKey: "nav-wisdom",
  },
  {
    title: "Legacy Planning",
    href: "/legacy",
    icon: FileText,
    tourKey: "nav-legacy",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar border-border">
      <SidebarContent className="gap-0">
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
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
