/**
 * Shared validators used across Convex modules.
 */

/**
 * String length limits for common field types.
 */
export const STRING_LIMITS = {
  name: 100,
  description: 500,
  notes: 1000,
  address: 200,
  city: 100,
  email: 254,
} as const;

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

/**
 * Validate a required string field.
 * Trims the value and validates it is not empty and within max length.
 *
 * @param value - The string value to validate
 * @param fieldName - The name of the field (used in error messages)
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns The trimmed string value
 * @throws Error if the value is empty or exceeds max length
 */
export function validateRequiredString(
  value: string,
  fieldName: string,
  maxLength: number = 100,
): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${fieldName} is required`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long (max ${maxLength} characters)`);
  }
  return trimmed;
}

/**
 * Validate an optional string field.
 * If undefined or empty after trimming, returns undefined.
 * If present, validates max length and returns trimmed value.
 *
 * @param value - The string value to validate (or undefined)
 * @param fieldName - The name of the field (used in error messages)
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns The trimmed string value, or undefined if empty/not provided
 * @throws Error if the value exceeds max length
 */
export function validateOptionalString(
  value: string | undefined,
  fieldName: string,
  maxLength: number = 100,
): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long (max ${maxLength} characters)`);
  }
  return trimmed;
}
