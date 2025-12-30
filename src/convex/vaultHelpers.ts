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
  uploadedBy: Id<"profiles"> | string;
  sharedWithUsers: (Id<"profiles"> | string)[];
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
  profileId: Id<"profiles"> | string,
  membershipRole: string,
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

    default:
      // Unknown access level - fail secure
      return false;
  }
}

/**
 * Check if a role has admin privileges (owner or steward)
 *
 * @param role - The membership role to check
 * @returns true if the role has admin privileges
 */
export function isAdminRole(role: string): boolean {
  return role === "owner" || role === "steward";
}
