/**
 * Shared validators used across Convex modules.
 */

/**
 * Basic email validation regex used for form input checks.
 * NOTE: This intentionally matches the lightweight pattern already used across the app.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * US state code regex - exactly 2 letters (case insensitive)
 */
export const STATE_CODE_REGEX = /^[A-Za-z]{2}$/;

/**
 * US ZIP code regex - 5 digits or 9 digits with optional hyphen
 * Matches: 12345, 12345-6789, 123456789
 */
export const ZIP_CODE_REGEX = /^\d{5}(-?\d{4})?$/;

/**
 * Validate and normalize a US state code.
 * Returns the normalized uppercase state code, or undefined if empty/null.
 * Throws an error if the state code is invalid.
 *
 * @param state - The state code to validate (e.g., "ca", "CA", "ny")
 * @returns The normalized uppercase state code, or undefined if empty
 * @throws Error if state is not a valid 2-letter code
 */
export function validateStateCode(state: string | undefined | null): string | undefined {
  if (!state) return undefined;
  const trimmed = state.trim().toUpperCase();
  if (trimmed.length === 0) return undefined;
  if (!STATE_CODE_REGEX.test(trimmed)) {
    throw new Error("State must be a 2-letter code (e.g., CA, NY)");
  }
  return trimmed;
}

/**
 * Validate and normalize a US ZIP code.
 * Returns the normalized ZIP code (whitespace removed), or undefined if empty/null.
 * Throws an error if the ZIP code is invalid.
 *
 * @param zipCode - The ZIP code to validate (e.g., "12345", "12345-6789")
 * @returns The normalized ZIP code, or undefined if empty
 * @throws Error if ZIP code is not valid (5 or 9 digits)
 */
export function validateZipCode(zipCode: string | undefined | null): string | undefined {
  if (!zipCode) return undefined;
  const trimmed = zipCode.trim().replace(/\s/g, "");
  if (trimmed.length === 0) return undefined;
  if (!ZIP_CODE_REGEX.test(trimmed)) {
    throw new Error("ZIP code must be 5 digits or 9 digits (e.g., 12345 or 12345-6789)");
  }
  return trimmed;
}
