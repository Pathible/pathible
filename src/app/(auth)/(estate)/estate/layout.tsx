import type { ReactNode } from "react";

/**
 * Shared estate page wrapper
 *
 * Provides consistent spacing and max-width for estate pages.
 * Authentication and sidebar are handled by parent layouts.
 */
export default function EstatePageLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl">{children}</div>;
}
