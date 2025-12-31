"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TourSelectionMode } from "./tour-selection-mode";
import type { ElementInfo } from "./types";

/**
 * TourBuilderWrapper
 *
 * This component wraps the app and enables tour builder selection mode
 * when the URL contains ?tour_builder=1
 *
 * Usage: Include this component in your main layout.
 */
export function TourBuilderWrapper() {
  const searchParams = useSearchParams();
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    const tourBuilder = searchParams.get("tour_builder");
    setIsSelectionMode(tourBuilder === "1");
  }, [searchParams]);

  const handleSelect = useCallback((info: ElementInfo & { route: string }) => {
    // Send selection back to opener window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "TOUR_ELEMENT_SELECTED",
          payload: info,
        },
        window.location.origin,
      );
      // Close this window after selection
      window.close();
    }
  }, []);

  const handleClose = useCallback(() => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "TOUR_SELECTION_CANCELLED",
        },
        window.location.origin,
      );
      window.close();
    } else {
      // If no opener, just navigate back
      window.history.back();
    }
  }, []);

  if (!isSelectionMode) return null;

  return (
    <TourSelectionMode isActive={isSelectionMode} onSelect={handleSelect} onClose={handleClose} />
  );
}
