"use client";

import { useEffect, useState } from "react";

const ENCOURAGING_MESSAGES = [
  "Every step forward is a gift to your family.",
  "There is no rush. Thoughtful planning takes time.",
  "You are building something that will outlast you.",
  "This is an act of love for those you care about most.",
  "Small steps today create lasting impact tomorrow.",
  "Your intentionality today shapes generations to come.",
];

/**
 * Footer component showing gentle, rotating encouragement messages
 * Helps maintain the peaceful, unhurried tone of the learning experience
 */
export function EncouragingMessage() {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Select a random message on mount (client-side only to avoid hydration mismatch)
    const randomIndex = Math.floor(Math.random() * ENCOURAGING_MESSAGES.length);
    setMessage(ENCOURAGING_MESSAGES[randomIndex]);
  }, []);

  // Don't render until client-side message is selected
  if (!message) {
    return (
      <p className="text-center text-sm text-muted-foreground italic max-w-md mx-auto h-5">
        {/* Placeholder for SSR */}
      </p>
    );
  }

  return (
    <p className="text-center text-sm text-muted-foreground italic max-w-md mx-auto">{message}</p>
  );
}
