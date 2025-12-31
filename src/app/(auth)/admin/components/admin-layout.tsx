"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset className="flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
