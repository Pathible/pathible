"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TourProvider } from "./tour-context";
import { TourRenderer } from "./tour-renderer";
import type { Tour } from "./types";

interface TourManagerProps {
  children: React.ReactNode;
}

/**
 * TourManager
 *
 * Integrates the tour system with Convex backend.
 * Fetches published tours and manages user tour state.
 *
 * Place this component in your authenticated layout to enable tours.
 */
export function TourManager({ children }: TourManagerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [previewShown, setPreviewShown] = useState(false);

  // Check if we're in tour builder mode (element selection popup) - skip tour loading
  const isTourBuilderMode = searchParams.get("tour_builder") === "1";

  // Check if we're in E2E test mode (Cypress) - skip tour loading to prevent overlay interference
  const isE2EMode =
    typeof window !== "undefined" && ("Cypress" in window || searchParams.get("e2e") === "1");

  // Check if we're in preview mode (showing a single step preview)
  const isPreviewMode = searchParams.get("tour_preview") === "1";
  const previewAnchor = searchParams.get("anchor");

  // Only fetch tours when user is authenticated (skip in builder mode, E2E mode, or when not authenticated)
  const shouldSkipQueries = isTourBuilderMode || isE2EMode || !isUserLoaded || !user;

  // Fetch published tours with their steps
  const publishedTours = useQuery(
    api.tours.listPublishedWithSteps,
    shouldSkipQueries ? "skip" : {},
  );

  // Fetch user tour states
  const userTourStates = useQuery(api.tours.getUserTourStates, shouldSkipQueries ? "skip" : {});

  // Mutations for tour state
  const completeStep = useMutation(api.tours.completeStep);
  const dismissTourMutation = useMutation(api.tours.dismissTour);

  // Transform Convex tour data to our Tour type
  const transformTour = useCallback(
    (
      convexTour: NonNullable<typeof publishedTours>[number],
      steps: NonNullable<typeof publishedTours>[number]["steps"],
    ): Tour => ({
      id: convexTour._id,
      key: convexTour.key,
      name: convexTour.name,
      description: convexTour.description,
      version: convexTour.version,
      priority: convexTour.priority,
      steps: steps.map((step) => ({
        id: step._id,
        tourId: convexTour._id,
        stepKey: step.stepKey,
        order: step.order,
        route: step.route,
        anchorSelector: step.anchorKey,
        title: step.title,
        body: step.body,
      })),
    }),
    [],
  );

  // Find and start the next applicable tour
  useEffect(() => {
    if (!publishedTours || !userTourStates || hasInitialized || activeTour) return;

    // Find a tour that:
    // 1. Has steps on the current route
    // 2. User hasn't dismissed
    // 3. Has new steps user hasn't seen
    for (const tour of publishedTours) {
      const userState = userTourStates.find((s) => s.tourId === tour._id);

      // Skip if user dismissed this tour and we're at their last seen version
      if (userState?.dismissed && userState.lastSeenVersion >= tour.version) {
        continue;
      }

      // Check if tour has steps for current route
      const stepsForRoute = tour.steps.filter((step) => {
        // Match route exactly or with pattern
        if (step.route === pathname) return true;
        // Handle dynamic routes (e.g., /family/[unitId])
        if (step.route.includes("[") && pathname.startsWith(step.route.split("[")[0])) {
          return true;
        }
        return false;
      });

      if (stepsForRoute.length > 0) {
        // Filter to only steps user hasn't completed
        const uncompletedSteps = stepsForRoute.filter(
          (step) => !userState?.completedStepKeys.includes(step.stepKey),
        );

        if (uncompletedSteps.length > 0) {
          // Start this tour
          const transformedTour = transformTour(tour, uncompletedSteps);
          setActiveTour(transformedTour);
          break;
        }
      }
    }

    setHasInitialized(true);
  }, [publishedTours, userTourStates, pathname, hasInitialized, activeTour, transformTour]);

  // Reset initialization when route changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally reset on pathname change
  useEffect(() => {
    setHasInitialized(false);
    setActiveTour(null);
  }, [pathname]);

  // Handle preview mode - create a synthetic tour to preview a single step
  useEffect(() => {
    // Don't show preview if already shown, or if there's an active tour
    if (!isPreviewMode || !previewAnchor || activeTour || previewShown) return;

    // Create a synthetic preview tour
    const previewTour: Tour = {
      id: "preview",
      key: "preview",
      name: "Step Preview",
      version: 1,
      priority: 1,
      steps: [
        {
          id: "preview-step",
          tourId: "preview",
          stepKey: "preview",
          order: 0,
          route: pathname,
          anchorSelector: previewAnchor,
          title: "Preview",
          body: "This is a preview of how this step will appear to users.",
        },
      ],
    };

    // Small delay to ensure page is rendered
    const timer = setTimeout(() => {
      setActiveTour(previewTour);
      setPreviewShown(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isPreviewMode, previewAnchor, pathname, activeTour, previewShown]);

  const handleStepComplete = useCallback(
    async (tourId: string, stepKey: string) => {
      // Skip Convex calls for preview tours
      if (tourId === "preview") return;

      try {
        await completeStep({
          tourId: tourId as Id<"tours">,
          stepKey,
        });
      } catch (error) {
        console.error("Failed to mark step complete:", error);
      }
    },
    [completeStep],
  );

  const handleTourComplete = useCallback(async (_tourId: string) => {
    setActiveTour(null);
    // All steps completed - no additional action needed
    // The step completions have already been tracked
  }, []);

  const handleTourDismiss = useCallback(
    async (tourId: string) => {
      // Skip Convex calls for preview tours
      if (tourId === "preview") {
        setActiveTour(null);
        return;
      }

      try {
        await dismissTourMutation({
          tourId: tourId as Id<"tours">,
        });
      } catch (error) {
        console.error("Failed to dismiss tour:", error);
      }
      setActiveTour(null);
    },
    [dismissTourMutation],
  );

  return (
    <TourProvider
      onStepComplete={handleStepComplete}
      onTourComplete={handleTourComplete}
      onTourDismiss={handleTourDismiss}
    >
      {children}
      <TourRenderer />
      {/* Auto-start tour when active */}
      {activeTour && <TourAutoStart tour={activeTour} />}
    </TourProvider>
  );
}

/**
 * Component to auto-start a tour
 */
function TourAutoStart({ tour }: { tour: Tour }) {
  const { startTour } = useTourFromContext();

  useEffect(() => {
    // Small delay to ensure page is rendered
    const timer = setTimeout(() => {
      startTour(tour);
    }, 500);

    return () => clearTimeout(timer);
  }, [tour, startTour]);

  return null;
}

// Import useTour at the bottom to avoid circular deps
import { useTour as useTourFromContext } from "./tour-context";
