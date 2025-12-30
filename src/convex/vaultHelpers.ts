/**
 * Vault Helpers - Shared utilities for vault operations
 *
 * This module contains shared helper functions used by both vault.ts (mutations/queries)
 * and vaultActions.ts (actions). Centralizing these prevents code drift and ensures
 * consistent behavior across the vault system.
 */

import type { Id } from "./_generated/dataModel";

/**
 * Document access level types
 */
export type AccessLevel = "household" | "admins" | "custom";

/**
 * Membership role types
 */
export type MembershipRole = "owner" | "steward" | "viewer" | "executor";

/**
 * Document shape for access checking
 */
export interface DocumentForAccessCheck {
  accessLevel: AccessLevel;
  uploadedBy: Id<"profiles">;
  sharedWithUsers: Id<"profiles">[];
}

/**
 * Check if a user has access to a specific document based on access level
 *
 * Access rules:
 * - "household": All household members have access
 * - "admins": Only owners and stewards have access
 * - "custom": Only the uploader or users in sharedWithUsers list have access
 *
 * @param document - The document to check access for
 * @param profileId - The user's profile ID
 * @param membershipRole - The user's role in the household
 * @returns true if the user has access, false otherwise
 *
 * @example
 * const hasAccess = checkDocumentAccess(document, profile._id, membership.role);
 * if (!hasAccess) {
 *   throw new Error("Access denied");
 * }
 */
export function checkDocumentAccess(
  document: DocumentForAccessCheck,
  profileId: Id<"profiles">,
  membershipRole: MembershipRole,
): boolean {
  switch (document.accessLevel) {
    case "household":
      // All household members have access
      return true;

    case "admins":
      // Only owners and stewards have access
      return membershipRole === "owner" || membershipRole === "steward";

    case "custom":
      // Check if user is in the shared list or is the uploader
      return (
        document.uploadedBy === profileId || document.sharedWithUsers.some((id) => id === profileId)
      );

    default: {
      const _exhaustive: never = document.accessLevel;
      console.error("Unknown access level", _exhaustive);
      return false;
    }
  }
}

/**
 * Check if a role has admin privileges (owner or steward)
 *
 * @param role - The membership role to check
 * @returns true if the role has admin privileges
 */
export function isAdminRole(role: MembershipRole): boolean {
  return role === "owner" || role === "steward";
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/** Maximum length for document names */
const MAX_NAME_LENGTH = 255;

/** Maximum length for document descriptions */
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Validate document name
 *
 * @param name - The document name to validate
 * @param isRequired - If true, empty names throw an error. If false, undefined/empty is allowed.
 * @returns The trimmed name
 * @throws Error if validation fails
 */
export function validateDocumentName(name: string | undefined, isRequired: boolean): string {
  if (name === undefined) {
    if (isRequired) {
      throw new Error("Document name is required");
    }
    return "";
  }

  const trimmed = name.trim();

  if (isRequired && !trimmed) {
    throw new Error("Document name is required");
  }

  if (!isRequired && !trimmed) {
    throw new Error("Document name cannot be empty");
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new Error(`Document name is too long (max ${MAX_NAME_LENGTH} characters)`);
  }

  return trimmed;
}

/**
 * Validate document description
 *
 * @param description - The description to validate (can be undefined)
 * @returns The trimmed description or undefined
 * @throws Error if description exceeds max length
 */
export function validateDocumentDescription(description: string | undefined): string | undefined {
  if (!description) {
    return description;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Description is too long (max ${MAX_DESCRIPTION_LENGTH} characters)`);
  }

  return description.trim();
}

// ============================================================================
// CATEGORY VALIDATION HELPERS
// ============================================================================

/** Maximum length for category names */
const MAX_CATEGORY_NAME_LENGTH = 50;

/** Maximum length for category descriptions */
const MAX_CATEGORY_DESCRIPTION_LENGTH = 200;

/**
 * Validate category name
 *
 * @param name - The category name to validate
 * @returns The trimmed name
 * @throws Error if validation fails
 */
export function validateCategoryName(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error("Category name cannot be empty");
  }

  if (trimmed.length > MAX_CATEGORY_NAME_LENGTH) {
    throw new Error(`Category name is too long (max ${MAX_CATEGORY_NAME_LENGTH} characters)`);
  }

  return trimmed;
}

/**
 * Validate category description
 *
 * @param description - The description to validate (can be undefined)
 * @returns The trimmed description or undefined
 * @throws Error if description exceeds max length
 */
export function validateCategoryDescription(description: string | undefined): string | undefined {
  if (!description) {
    return description;
  }

  if (description.length > MAX_CATEGORY_DESCRIPTION_LENGTH) {
    throw new Error(`Description is too long (max ${MAX_CATEGORY_DESCRIPTION_LENGTH} characters)`);
  }

  return description.trim();
}
