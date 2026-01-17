"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Authentication error types
 */
export type AuthError = "not-authenticated" | "connection-failed" | "no-household" | null;

/**
 * Hook return type
 */
export interface AuthenticatedHouseholdResult {
  /** The first household ID for the user, or null if not available */
  householdId: Id<"households"> | null;
  /** The authenticated Clerk user */
  user: ReturnType<typeof useUser>["user"];
  /** True while auth is loading or retrying */
  isLoading: boolean;
  /** Error state after all retries exhausted */
  error: AuthError;
}

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 500;

/**
 * Hook to handle authentication and household resolution with retry logic
 *
 * This hook consolidates the auth/retry/error handling pattern used across
 * dashboard content components (vault, financial, etc.).
 *
 * @example
 * ```tsx
 * function MyContent() {
 *   const { householdId, isLoading, error } = useAuthenticatedHousehold();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error === "not-authenticated") return <SignInRequiredCard />;
 *   if (error === "connection-failed") return <ConnectionErrorCard />;
 *   if (error === "no-household") return <SetupRequiredCard />;
 *
 *   // householdId is guaranteed to be non-null here
 *   return <MyContentUI householdId={householdId} />;
 * }
 * ```
 */
export function useAuthenticatedHousehold(): AuthenticatedHouseholdResult {
  const [retryCount, setRetryCount] = useState(0);

  // Check Clerk session status
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households - run when session is ready
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  // Unified retry logic for auth race conditions
  useEffect(() => {
    const needsRetry = isUserLoaded && retryCount < MAX_RETRIES && (!user || households === null);

    if (needsRetry) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, RETRY_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isUserLoaded, user, households, retryCount]);

  // Determine loading state
  const isAuthLoading = !isUserLoaded || (!user && retryCount < MAX_RETRIES);
  const isHouseholdsLoading =
    households === undefined || (households === null && retryCount < MAX_RETRIES);
  const isLoading = isAuthLoading || (user && isHouseholdsLoading);

  // Derive error state (only after all retries exhausted)
  let error: AuthError = null;
  if (!isLoading) {
    if (!user) {
      error = "not-authenticated";
    } else if (households === null) {
      error = "connection-failed";
    } else if (!households?.[0]?._id) {
      error = "no-household";
    }
  }

  // Use the first household (most users will only have one)
  const householdId = households?.[0]?._id ?? null;

  return {
    householdId,
    user,
    isLoading: Boolean(isLoading),
    error,
  };
}
