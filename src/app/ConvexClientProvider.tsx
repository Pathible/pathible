"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { type ReactNode, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
}

const convex = new ConvexReactClient(convexUrl);

// Type for exposed test helpers
interface ConvexTestHelpers {
  resetTestUser: () => Promise<unknown>;
  isCleanState: () => Promise<unknown>;
  grantAdminRole: () => Promise<{ success: boolean; message: string }>;
  cleanupTestArticles: () => Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }>;
  setTestSubscriptionTier: (tier: "foundations" | "heritage" | "legacy" | "founders") => Promise<{
    success: boolean;
    message: string;
  }>;
  getTestHouseholdId: () => Promise<string | null>;
  activateEstateForTesting: (householdId: string) => Promise<{
    success: boolean;
    message: string;
    activationId?: string;
  }>;
  cleanupEstateData: (householdId: string) => Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }>;
}

// Expose Convex test helpers for E2E testing (Cypress)
// Only in browser environment and when Cypress is detected
function exposeTestHelpers() {
  if (typeof window === "undefined") return;

  const isCypressTest = !!(window as unknown as { Cypress?: unknown }).Cypress;
  const isTestEnv =
    process.env.NODE_ENV === "test" || process.env.NEXT_PUBLIC_E2E_TESTING === "true";
  const isDevMode = process.env.NODE_ENV === "development";

  if (isCypressTest || isTestEnv || isDevMode) {
    // Expose helper functions that call Convex mutations
    (window as unknown as { __CONVEX_TEST_HELPERS__: ConvexTestHelpers }).__CONVEX_TEST_HELPERS__ =
      {
        resetTestUser: () => convex.mutation(api.testing.resetTestUser, {}),
        isCleanState: () => convex.mutation(api.testing.isCleanState, {}),
        grantAdminRole: () => convex.mutation(api.testing.grantAdminRole, {}),
        cleanupTestArticles: () => convex.mutation(api.testing.cleanupTestArticles, {}),
        setTestSubscriptionTier: (tier: "foundations" | "heritage" | "legacy" | "founders") =>
          convex.mutation(api.testing.setTestSubscriptionTier, { tier }),
        getTestHouseholdId: () => convex.mutation(api.testing.getTestHouseholdId, {}),
        activateEstateForTesting: (householdId: string) =>
          convex.mutation(api.testing.activateEstateForTesting, {
            householdId: householdId as Id<"households">,
          }),
        cleanupEstateData: (householdId: string) =>
          convex.mutation(api.testing.cleanupEstateData, {
            householdId: householdId as Id<"households">,
          }),
      };
  }
}

// Initial exposure
exposeTestHelpers();

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Re-expose on mount in case window check happened before Cypress loaded
  useEffect(() => {
    exposeTestHelpers();
  }, []);

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
