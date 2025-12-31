"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Tour, TourContextValue, TourState, TourStep } from "./types";

const initialState: TourState = {
  activeTour: null,
  currentStepIndex: 0,
  isActive: false,
  completedStepKeys: [],
  dismissedTourIds: [],
};

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

export function useTourOptional() {
  return useContext(TourContext);
}

interface TourProviderProps {
  children: React.ReactNode;
  onStepComplete?: (tourId: string, stepKey: string) => void;
  onTourComplete?: (tourId: string) => void;
  onTourDismiss?: (tourId: string) => void;
}

export function TourProvider({
  children,
  onStepComplete,
  onTourComplete,
  onTourDismiss,
}: TourProviderProps) {
  const [state, setState] = useState<TourState>(initialState);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  // Get current step
  const currentStep = useMemo<TourStep | null>(() => {
    if (!state.activeTour || !state.isActive) return null;
    return state.activeTour.steps[state.currentStepIndex] ?? null;
  }, [state.activeTour, state.currentStepIndex, state.isActive]);

  // Find and track target element
  useEffect(() => {
    if (!currentStep) {
      setTargetElement(null);
      return;
    }

    const findElement = () => {
      // Try multiple selector strategies
      const selectors = [
        currentStep.anchorSelector,
        `[data-tour="${currentStep.anchorSelector}"]`,
        `[data-testid="${currentStep.anchorSelector}"]`,
        `#${currentStep.anchorSelector}`,
      ];

      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element instanceof HTMLElement) {
            return element;
          }
        } catch {
          // Invalid selector, try next
        }
      }
      return null;
    };

    // Initial find
    const element = findElement();
    setTargetElement(element);

    // Set up MutationObserver to detect when element appears
    if (!element) {
      const observer = new MutationObserver(() => {
        const el = findElement();
        if (el) {
          setTargetElement(el);
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-tour", "data-testid", "id"],
      });

      return () => observer.disconnect();
    }
  }, [currentStep]);

  // Scroll target element into view
  useEffect(() => {
    if (targetElement && state.isActive) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [targetElement, state.isActive]);

  const startTour = useCallback((tour: Tour) => {
    setState((prev) => ({
      ...prev,
      activeTour: tour,
      currentStepIndex: 0,
      isActive: true,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (!prev.activeTour) return prev;

      const currentStep = prev.activeTour.steps[prev.currentStepIndex];
      const nextIndex = prev.currentStepIndex + 1;
      const isLastStep = nextIndex >= prev.activeTour.steps.length;

      // Mark current step as complete
      if (currentStep) {
        onStepComplete?.(prev.activeTour.id, currentStep.stepKey);
      }

      if (isLastStep) {
        // Tour complete
        onTourComplete?.(prev.activeTour.id);
        return {
          ...prev,
          isActive: false,
          activeTour: null,
          currentStepIndex: 0,
          completedStepKeys: currentStep
            ? [...prev.completedStepKeys, currentStep.stepKey]
            : prev.completedStepKeys,
        };
      }

      return {
        ...prev,
        currentStepIndex: nextIndex,
        completedStepKeys: currentStep
          ? [...prev.completedStepKeys, currentStep.stepKey]
          : prev.completedStepKeys,
      };
    });
  }, [onStepComplete, onTourComplete]);

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (!prev.activeTour || prev.currentStepIndex === 0) return prev;
      return {
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1,
      };
    });
  }, []);

  const skipTour = useCallback(() => {
    setState((prev) => {
      if (prev.activeTour) {
        onTourDismiss?.(prev.activeTour.id);
      }
      return {
        ...prev,
        isActive: false,
        activeTour: null,
        currentStepIndex: 0,
        dismissedTourIds: prev.activeTour
          ? [...prev.dismissedTourIds, prev.activeTour.id]
          : prev.dismissedTourIds,
      };
    });
  }, [onTourDismiss]);

  const completeTour = useCallback(() => {
    setState((prev) => {
      if (prev.activeTour) {
        onTourComplete?.(prev.activeTour.id);
      }
      return {
        ...prev,
        isActive: false,
        activeTour: null,
        currentStepIndex: 0,
      };
    });
  }, [onTourComplete]);

  const goToStep = useCallback((index: number) => {
    setState((prev) => {
      if (!prev.activeTour) return prev;
      const maxIndex = prev.activeTour.steps.length - 1;
      const safeIndex = Math.max(0, Math.min(index, maxIndex));
      return {
        ...prev,
        currentStepIndex: safeIndex,
      };
    });
  }, []);

  const isStepComplete = useCallback(
    (stepKey: string) => state.completedStepKeys.includes(stepKey),
    [state.completedStepKeys],
  );

  const isTourDismissed = useCallback(
    (tourId: string) => state.dismissedTourIds.includes(tourId),
    [state.dismissedTourIds],
  );

  const value = useMemo<TourContextValue>(
    () => ({
      state,
      currentStep,
      targetElement,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      completeTour,
      goToStep,
      isStepComplete,
      isTourDismissed,
    }),
    [
      state,
      currentStep,
      targetElement,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      completeTour,
      goToStep,
      isStepComplete,
      isTourDismissed,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
