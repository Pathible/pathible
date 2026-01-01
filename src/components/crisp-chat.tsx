"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $crisp: unknown[];
    CRISP_WEBSITE_ID: string;
  }
}

const CRISP_WEBSITE_ID = "ec7ba752-2dc7-4607-b93b-a55f5be7e64e";

/**
 * Crisp Chat Widget
 *
 * Loads the Crisp live chat widget for customer support.
 * Add this component to the root layout to enable chat site-wide.
 *
 * @see https://crisp.chat
 */
export function CrispChat() {
  useEffect(() => {
    // Initialize Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    // Load the Crisp script
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      // Remove the script if component unmounts
      const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}
