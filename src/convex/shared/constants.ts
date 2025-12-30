/**
 * Shared Constants - Common values used across Convex modules
 *
 * This module contains constants that are used by multiple Convex files
 * to prevent code duplication and ensure consistency.
 */

// ============================================================================
// STORAGE CONSTANTS
// ============================================================================

/** Bytes per gigabyte constant */
export const BYTES_PER_GB = 1024 * 1024 * 1024;

/** Sentinel value for unlimited resources */
export const UNLIMITED = Number.MAX_SAFE_INTEGER;

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format bytes as human-readable GB string
 */
export function formatBytesAsGB(bytes: number): string {
  if (bytes === UNLIMITED) return "unlimited";
  return (bytes / BYTES_PER_GB).toFixed(2);
}

/**
 * Format a limit value for display
 */
export function formatLimit(value: number): string {
  return value === UNLIMITED ? "unlimited" : value.toString();
}
