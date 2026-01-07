"use client";

/**
 * AddressDisplay Component
 *
 * A simple component that formats and displays addresses.
 * Supports both inline (single line) and multiline formats.
 *
 * @example
 * ```tsx
 * <AddressDisplay
 *   address="123 Main St"
 *   city="Springfield"
 *   state="CA"
 *   zipCode="90210"
 *   format="inline"
 * />
 * // Output: "123 Main St, Springfield, CA 90210"
 * ```
 *
 * @example Multiline format
 * ```tsx
 * <AddressDisplay
 *   address="123 Main St"
 *   city="Springfield"
 *   state="CA"
 *   zipCode="90210"
 *   format="multiline"
 * />
 * // Output:
 * // 123 Main St
 * // Springfield, CA 90210
 * ```
 */

import { formatAddressLines, formatFullAddress } from "@/lib/person-utils";
import { cn } from "@/lib/utils";

export interface AddressDisplayProps {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  format?: "inline" | "multiline";
  className?: string;
}

export function AddressDisplay({
  address,
  city,
  state,
  zipCode,
  format = "inline",
  className,
}: AddressDisplayProps) {
  // Check if we have any address data to display
  if (!address && !city && !state && !zipCode) {
    return null;
  }

  if (format === "inline") {
    const fullAddress = formatFullAddress({ address, city, state, zipCode });
    if (!fullAddress) return null;

    return <span className={cn("text-sm text-muted-foreground", className)}>{fullAddress}</span>;
  }

  // Multiline format
  const lines = formatAddressLines({ address, city, state, zipCode });
  if (lines.length === 0) return null;

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
