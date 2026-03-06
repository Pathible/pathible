"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { api } from "@/convex/_generated/api";

interface EstateMode {
  isEstateMode: boolean;
  executorName: string | null;
  isExecutor: boolean;
  hasExecutorPurchase: boolean;
  hasPlanningAccess: boolean;
  isLoading: boolean;
}

const EstateModeContext = createContext<EstateMode | null>(null);

/**
 * Provider that subscribes to estate mode data once at the layout level.
 *
 * Wrap a layout with this provider so that all descendants calling
 * useEstateMode() share the same Convex subscriptions instead of
 * each component creating its own.
 */
export function EstateModeProvider({ children }: { children: ReactNode }) {
  const value = useEstateModeQuery();
  return <EstateModeContext.Provider value={value}>{children}</EstateModeContext.Provider>;
}

/**
 * Hook to access estate mode state.
 *
 * When used inside an EstateModeProvider, reads from shared context (zero extra queries).
 * When used outside a provider, falls back to its own Convex subscriptions.
 *
 * Used across vault/financial/legacy/wisdom pages to:
 * - Hide create/edit/delete buttons when estate mode is active
 * - Show contextual banners explaining read-only state
 * - Identify whether the current user is the executor
 */
export function useEstateMode(): EstateMode {
  const context = useContext(EstateModeContext);
  const hasProvider = context !== null;
  const fallback = useEstateModeQuery(hasProvider);
  return context ?? fallback;
}

/**
 * Internal hook that performs the actual Convex queries.
 * Called once by EstateModeProvider, or directly by useEstateMode as fallback.
 *
 * When `skip` is true (inside an EstateModeProvider), all queries use "skip"
 * to avoid creating redundant Convex subscriptions.
 */
function useEstateModeQuery(skip = false): EstateMode {
  const { user, isLoaded: isUserLoaded } = useUser();

  const households = useQuery(api.households.list, !skip && isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const members = useQuery(
    api.households.listMembers,
    !skip && householdId ? { householdId } : "skip",
  );

  const profile = useQuery(api.profiles.get, !skip && isUserLoaded && user ? {} : "skip");

  const isEstateMode = household?.estateMode === true;

  return useMemo(() => {
    if (skip) {
      return {
        isEstateMode: false,
        executorName: null,
        isExecutor: false,
        hasExecutorPurchase: false,
        hasPlanningAccess: false,
        isLoading: true,
      };
    }

    // Find current user's membership to check executor role
    const currentMembership = members?.find((m) => m.userId === profile?._id);
    const isExecutor = currentMembership?.role === "executor";

    // Find the executor member to get their name (for banner display)
    const executorMember = members?.find((m) => m.role === "executor");
    const executorName = executorMember
      ? `${executorMember.profile.firstName} ${executorMember.profile.lastName}`
      : null;

    const hasExecutorPurchase = household?.executorPurchased === true;
    const hasPlanningAccess = household?.subscriptionStatus === "active";
    const isLoading = !isUserLoaded || households === undefined || members === undefined;

    return {
      isEstateMode,
      executorName,
      isExecutor,
      hasExecutorPurchase,
      hasPlanningAccess,
      isLoading: Boolean(isLoading),
    };
  }, [
    skip,
    isEstateMode,
    members,
    profile?._id,
    isUserLoaded,
    households,
    household?.executorPurchased,
    household?.subscriptionStatus,
  ]);
}
