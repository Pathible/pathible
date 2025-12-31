/**
 * Tour System Types
 *
 * Defines the data structures for the guided tour system.
 */

export interface TourStep {
  id: string;
  tourId: string;
  stepKey: string;
  order: number;
  route: string;
  anchorSelector: string; // CSS selector or data-testid/data-tour reference
  title: string;
  body: string;
  position?: TooltipPosition;
}

export interface Tour {
  id: string;
  key: string;
  name: string;
  description?: string;
  version: number;
  priority: number;
  steps: TourStep[];
}

export interface TourState {
  activeTour: Tour | null;
  currentStepIndex: number;
  isActive: boolean;
  completedStepKeys: string[];
  dismissedTourIds: string[];
}

export type TooltipPosition =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end"
  | "auto";

export interface TourContextValue {
  // State
  state: TourState;
  currentStep: TourStep | null;
  targetElement: HTMLElement | null;

  // Actions
  startTour: (tour: Tour) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  goToStep: (index: number) => void;

  // Utilities
  isStepComplete: (stepKey: string) => boolean;
  isTourDismissed: (tourId: string) => boolean;
}

export interface ElementInfo {
  selector: string;
  tagName: string;
  id?: string;
  testId?: string;
  tourKey?: string;
  ariaLabel?: string;
  textContent?: string;
  rect: DOMRect;
  computedKey: string;
}

export interface SelectionModeState {
  isActive: boolean;
  hoveredElement: ElementInfo | null;
  selectedElement: ElementInfo | null;
  highlightedElements: ElementInfo[];
  currentRoute: string;
}
