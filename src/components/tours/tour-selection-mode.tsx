"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, MousePointer2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ElementInfo } from "./types";

/**
 * Generates a unique key for an element based on available attributes
 */
function generateElementKey(element: HTMLElement): string {
  // Priority order for key generation
  if (element.dataset.tour) return element.dataset.tour;
  if (element.dataset.testid) return element.dataset.testid;
  if (element.id) return element.id;
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) {
    return ariaLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Generate from text content and element type
  const text = element.textContent?.trim().slice(0, 30) || "";
  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute("role") || "";

  const baseKey = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (baseKey) {
    return `${tag}-${baseKey}`;
  }

  if (role) {
    return `${role}-${Date.now().toString(36)}`;
  }

  return `${tag}-${Date.now().toString(36)}`;
}

/**
 * Gets information about an element for display and selection
 */
function getElementInfo(element: HTMLElement): ElementInfo {
  const rect = element.getBoundingClientRect();
  return {
    selector: generateSelector(element),
    tagName: element.tagName.toLowerCase(),
    id: element.id || undefined,
    testId: element.dataset.testid,
    tourKey: element.dataset.tour,
    ariaLabel: element.getAttribute("aria-label") || undefined,
    textContent: element.textContent?.trim().slice(0, 50),
    rect,
    computedKey: generateElementKey(element),
  };
}

/**
 * Generates a CSS selector for an element
 */
function generateSelector(element: HTMLElement): string {
  if (element.dataset.tour) return `[data-tour="${element.dataset.tour}"]`;
  if (element.dataset.testid) return `[data-testid="${element.dataset.testid}"]`;
  if (element.id) return `#${element.id}`;
  if (element.getAttribute("aria-label")) {
    return `[aria-label="${element.getAttribute("aria-label")}"]`;
  }
  // Fallback to a unique selector path
  return generateUniquePath(element);
}

function generateUniquePath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.dataset.testid) {
      selector = `[data-testid="${current.dataset.testid}"]`;
      path.unshift(selector);
      break;
    }

    const parentEl: HTMLElement | null = current.parentElement;
    if (parentEl) {
      const currentTagName = current.tagName;
      const siblings = Array.from(parentEl.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.tagName === currentTagName,
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = parentEl;
  }

  return path.join(" > ");
}

/**
 * Checks if an element should be highlightable as a tour target
 */
function isInteractiveElement(element: HTMLElement): boolean {
  // Always include elements with tour/testid attributes
  if (element.dataset.tour || element.dataset.testid) return true;

  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute("role");

  // Interactive elements
  const interactiveTags = ["button", "a", "input", "select", "textarea"];
  if (interactiveTags.includes(tag)) return true;

  // Elements with interactive roles
  const interactiveRoles = ["button", "link", "tab", "menuitem", "option", "checkbox", "radio"];
  if (role && interactiveRoles.includes(role)) return true;

  // Clickable elements
  if (element.onclick || element.getAttribute("onclick")) return true;

  // Elements with cursor pointer (likely clickable)
  const style = window.getComputedStyle(element);
  if (style.cursor === "pointer") return true;

  // Cards and other semantic containers with IDs
  if (
    element.id &&
    ["div", "section", "article", "aside", "nav", "header", "footer"].includes(tag)
  ) {
    return true;
  }

  return false;
}

interface TourSelectionModeProps {
  isActive: boolean;
  onSelect: (info: ElementInfo & { route: string }) => void;
  onClose: () => void;
}

export function TourSelectionMode({ isActive, onSelect, onClose }: TourSelectionModeProps) {
  const pathname = usePathname();
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<ElementInfo | null>(null);
  const [highlightedElements, setHighlightedElements] = useState<HTMLElement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scan for interactive elements
  useEffect(() => {
    if (!isActive) {
      setHighlightedElements([]);
      return;
    }

    const scanElements = () => {
      const elements = Array.from(document.querySelectorAll("*")).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && isInteractiveElement(el),
      );
      setHighlightedElements(elements);
    };

    scanElements();

    // Rescan on DOM changes
    const observer = new MutationObserver(scanElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [isActive]);

  // Handle mouse movement to track hovered element
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return;

      const target = e.target as HTMLElement;
      const interactiveTarget = findInteractiveParent(target);

      if (interactiveTarget && interactiveTarget !== hoveredElement) {
        setHoveredElement(interactiveTarget);
        setHoveredInfo(getElementInfo(interactiveTarget));
      } else if (!interactiveTarget) {
        setHoveredElement(null);
        setHoveredInfo(null);
      }
    },
    [isActive, hoveredElement],
  );

  // Handle click to select element
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      const interactiveTarget = findInteractiveParent(target);

      if (interactiveTarget) {
        const info = getElementInfo(interactiveTarget);
        onSelect({ ...info, route: pathname });
      }
    },
    [isActive, pathname, onSelect],
  );

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onClose]);

  // Add event listeners
  useEffect(() => {
    if (!isActive) return;

    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isActive, handleMouseMove, handleClick]);

  if (!mounted || !isActive) return null;

  return createPortal(
    <>
      {/* Instruction bar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-10001 bg-primary text-primary-foreground shadow-lg"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MousePointer2 className="h-5 w-5" />
            <span className="font-medium">
              Click on any highlighted element to select it as a tour step target
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-80">
              {highlightedElements.length} elements available
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Highlight overlays for all interactive elements */}
      {highlightedElements.map((element, index) => {
        const rect = element.getBoundingClientRect();
        const isHovered = element === hoveredElement;
        // Generate a stable key from element properties
        const elementKey =
          element.dataset.tour ||
          element.dataset.testid ||
          element.id ||
          `element-${index}-${rect.left}-${rect.top}`;

        return (
          <motion.div
            key={elementKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`fixed pointer-events-none rounded transition-all duration-150 ${
              isHovered
                ? "ring-2 ring-primary ring-offset-2 bg-primary/20 z-10000"
                : "ring-1 ring-primary/30 bg-primary/5 z-9999"
            }`}
            style={{
              top: rect.top - 2,
              left: rect.left - 2,
              width: rect.width + 4,
              height: rect.height + 4,
            }}
          />
        );
      })}

      {/* Hover info tooltip */}
      <AnimatePresence>
        {hoveredElement && hoveredInfo && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-10002 bg-popover border border-border rounded-lg shadow-xl p-3 max-w-sm"
            style={{
              top: hoveredInfo.rect.bottom + 8,
              left: Math.min(hoveredInfo.rect.left, window.innerWidth - 320),
            }}
          >
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {hoveredInfo.textContent || hoveredInfo.tagName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Key: <code className="bg-muted px-1 rounded">{hoveredInfo.computedKey}</code>
                </p>
                {hoveredInfo.testId && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    data-testid: <code className="bg-muted px-1 rounded">{hoveredInfo.testId}</code>
                  </p>
                )}
                {hoveredInfo.tourKey && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    data-tour: <code className="bg-muted px-1 rounded">{hoveredInfo.tourKey}</code>
                  </p>
                )}
                <p className="text-xs text-primary mt-2 font-medium">Click to select</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}

/**
 * Finds the nearest interactive parent element
 */
function findInteractiveParent(element: HTMLElement | null): HTMLElement | null {
  while (element && element !== document.body) {
    if (isInteractiveElement(element)) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}
