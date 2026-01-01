import { type ReactNode, Suspense } from "react";
import { SubscriptionStatusBanner } from "@/components/subscription-status-banner";
import { TourBuilderWrapper, TourManager } from "@/components/tours";
import { DashboardLayout } from "./dashboard/components/DashboardLayout";

/**
 * Dashboard Layout - Wraps all user-facing authenticated routes
 *
 * Provides the standard app sidebar and header for routes like
 * dashboard, vault, family, wisdom, etc.
 *
 * Also includes:
 * - SubscriptionStatusBanner for expired/inactive subscription warnings
 * - TourManager for guided onboarding tours
 * - TourBuilderWrapper for visual tour element selection (admin)
 */
export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <SubscriptionStatusBanner />
        <TourManager>
          {children}
          {/* Tour builder for visual element selection (activated via ?tour_builder=1) */}
          <TourBuilderWrapper />
        </TourManager>
      </Suspense>
    </DashboardLayout>
  );
}
