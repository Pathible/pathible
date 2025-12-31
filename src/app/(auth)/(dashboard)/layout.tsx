import type { ReactNode } from "react";
import { DashboardLayout } from "./dashboard/components/DashboardLayout";

/**
 * Dashboard Layout - Wraps all user-facing authenticated routes
 *
 * Provides the standard app sidebar and header for routes like
 * dashboard, vault, family, wisdom, etc.
 */
export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
