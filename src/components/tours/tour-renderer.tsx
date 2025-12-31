"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useTourOptional } from "./tour-context";
import type { TooltipPosition } from "./types";

interface TooltipStyles {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  transform?: string;
}

function calculateTooltipPosition(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  position: TooltipPosition = "auto",
  padding = 12,
): { styles: TooltipStyles; actualPosition: TooltipPosition } {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Auto-detect best position
  let actualPosition = position;
  if (position === "auto") {
    const spaceAbove = targetRect.top;
    const spaceBelow = viewport.height - targetRect.bottom;
    const spaceLeft = targetRect.left;
    const spaceRight = viewport.width - targetRect.right;

    // Prefer bottom, then top, then right, then left
    if (spaceBelow >= tooltipRect.height + padding * 2) {
      actualPosition = "bottom";
    } else if (spaceAbove >= tooltipRect.height + padding * 2) {
      actualPosition = "top";
    } else if (spaceRight >= tooltipRect.width + padding * 2) {
      actualPosition = "right";
    } else if (spaceLeft >= tooltipRect.width + padding * 2) {
      actualPosition = "left";
    } else {
      actualPosition = "bottom"; // Fallback
    }
  }

  const styles: TooltipStyles = {};
  const centerX = targetRect.left + targetRect.width / 2;
  const centerY = targetRect.top + targetRect.height / 2;

  switch (actualPosition) {
    case "top":
    case "top-start":
    case "top-end":
      styles.bottom = viewport.height - targetRect.top + padding;
      if (actualPosition === "top-start") {
        styles.left = targetRect.left;
      } else if (actualPosition === "top-end") {
        styles.left = targetRect.right - tooltipRect.width;
      } else {
        styles.left = centerX;
        styles.transform = "translateX(-50%)";
      }
      break;

    case "bottom":
    case "bottom-start":
    case "bottom-end":
      styles.top = targetRect.bottom + padding;
      if (actualPosition === "bottom-start") {
        styles.left = targetRect.left;
      } else if (actualPosition === "bottom-end") {
        styles.left = targetRect.right - tooltipRect.width;
      } else {
        styles.left = centerX;
        styles.transform = "translateX(-50%)";
      }
      break;

    case "left":
    case "left-start":
    case "left-end":
      styles.right = viewport.width - targetRect.left + padding;
      if (actualPosition === "left-start") {
        styles.top = targetRect.top;
      } else if (actualPosition === "left-end") {
        styles.top = targetRect.bottom - tooltipRect.height;
      } else {
        styles.top = centerY;
        styles.transform = "translateY(-50%)";
      }
      break;

    case "right":
    case "right-start":
    case "right-end":
      styles.left = targetRect.right + padding;
      if (actualPosition === "right-start") {
        styles.top = targetRect.top;
      } else if (actualPosition === "right-end") {
        styles.top = targetRect.bottom - tooltipRect.height;
      } else {
        styles.top = centerY;
        styles.transform = "translateY(-50%)";
      }
      break;
  }

  // Clamp to viewport
  if (typeof styles.left === "number") {
    styles.left = Math.max(
      padding,
      Math.min(styles.left, viewport.width - tooltipRect.width - padding),
    );
  }
  if (typeof styles.top === "number") {
    styles.top = Math.max(
      padding,
      Math.min(styles.top, viewport.height - tooltipRect.height - padding),
    );
  }

  return { styles, actualPosition };
}

export function TourRenderer() {
  const tour = useTourOptional();
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipStyles>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate tooltip position when target or tooltip changes
  useEffect(() => {
    if (!tour?.targetElement || !tooltipRef) return;

    const targetElement = tour.targetElement;

    const updatePosition = () => {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.getBoundingClientRect();
      const { styles } = calculateTooltipPosition(
        targetRect,
        tooltipRect,
        tour.currentStep?.position ?? "auto",
      );
      setTooltipPosition(styles);
    };

    updatePosition();

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [tour?.targetElement, tooltipRef, tour?.currentStep?.position]);

  if (!mounted || !tour) return null;

  const { state, currentStep, targetElement, nextStep, prevStep, skipTour } = tour;

  if (!state.isActive || !currentStep) return null;

  const totalSteps = state.activeTour?.steps.length ?? 0;
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === totalSteps - 1;

  const targetRect = targetElement?.getBoundingClientRect();

  return createPortal(
    <AnimatePresence mode="wait">
      {state.isActive && (
        <>
          {/* Backdrop overlay with spotlight cutout */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-9998 pointer-events-none"
            style={{
              background: targetRect
                ? `radial-gradient(ellipse ${targetRect.width + 32}px ${
                    targetRect.height + 32
                  }px at ${targetRect.left + targetRect.width / 2}px ${
                    targetRect.top + targetRect.height / 2
                  }px, transparent 0%, rgba(0, 0, 0, 0.75) 100%)`
                : "rgba(0, 0, 0, 0.75)",
            }}
          />

          {/* Clickable backdrop to prevent interaction */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop overlay intentionally blocks clicks */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Backdrop overlay intentionally blocks clicks */}
          <div
            className="fixed inset-0 z-9998"
            onClick={(e) => {
              // Allow clicks on the target element
              if (targetElement?.contains(e.target as Node)) {
                return;
              }
              e.preventDefault();
              e.stopPropagation();
            }}
          />

          {/* Spotlight ring around target */}
          {targetRect && (
            <motion.div
              key="spotlight"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed z-9999 pointer-events-none rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-background"
              style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            key={`tooltip-${currentStep.stepKey}`}
            ref={setTooltipRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed z-10000 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            style={tooltipPosition}
          >
            {/* Header with progress */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {state.currentStepIndex + 1} of {totalSteps}
                </span>
                {/* Progress dots */}
                <div className="flex gap-1">
                  {state.activeTour?.steps.map((step, i) => (
                    <div
                      key={step.stepKey}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === state.currentStepIndex
                          ? "bg-primary"
                          : i < state.currentStepIndex
                            ? "bg-primary/50"
                            : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={skipTour}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close tour</span>
              </Button>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.body}</p>
            </div>

            {/* Footer with navigation */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip tour
              </Button>
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={prevStep}>
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={nextStep}>
                  {isLastStep ? (
                    "Finish"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
