"use node";

/**
 * Heritage Vault - Backblaze B2 Actions
 *
 * Convex actions for file upload/download operations with B2 storage.
 * Uses "use node" directive to access Node.js APIs for B2 client.
 */

import { v } from "convex/values";
import { getBackblazeClient } from "../lib/backblaze/client";
import { B2_CONSTANTS, generateB2FileName, validateUploadParams } from "../lib/backblaze/config";
import type { UploadUrlData } from "../lib/backblaze/types";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

/**
 * Generate a signed upload URL for B2
 * Client will use this URL to upload the file directly to B2
 */
export const generateUploadUrl = action({
  args: {
    householdId: v.id("households"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  returns: v.object({
    uploadUrl: v.string(),
    authorizationToken: v.string(),
    b2FileName: v.string(),
    bucketId: v.string(),
    bucketName: v.string(),
  }),
  handler: async (ctx, args): Promise<UploadUrlData> => {
    // Verify authentication and household access
    await ctx.runQuery(internal.auth.requireHouseholdAccessInternal, {
      householdId: args.householdId,
    });

    // Validate upload parameters
    validateUploadParams({
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
    });

    // Generate unique B2 file name
    const b2FileName = generateB2FileName(args.householdId, args.fileName);

    // Get B2 client and upload URL
    const b2Client = getBackblazeClient();
    const uploadData = await b2Client.getUploadUrl();

    return {
      uploadUrl: uploadData.uploadUrl,
      authorizationToken: uploadData.authorizationToken,
      b2FileName,
      bucketId: b2Client.getBucketId(),
      bucketName: b2Client.getBucketName(),
    };
  },
});

/**
 * Generate a signed download URL for a document
 * Verifies access permissions before generating URL
 */
export const generateDownloadUrl = action({
  args: {
    documentId: v.id("vaultDocuments"),
  },
  returns: v.object({
    url: v.string(),
    authToken: v.string(),
    expiresIn: v.number(),
  }),
  handler: async (ctx, args) => {
    // Get document using internal query
    const document = await ctx.runQuery(internal.auth.getDocumentInternal, {
      documentId: args.documentId,
    });

    if (!document) {
      throw new Error("Document not found");
    }

    // Verify household access
    const membership = await ctx.runQuery(internal.auth.requireHouseholdAccessInternal, {
      householdId: document.householdId,
    });
    const { profile } = await ctx.runQuery(internal.auth.requireAuthInternal);

    // Check document-level access
    const hasAccess = checkDocumentAccess(document, profile._id, membership.role);

    if (!hasAccess) {
      throw new Error("Access denied: You do not have permission to view this document");
    }

    // Generate download URL and authorization token
    const b2Client = getBackblazeClient();
    const { url, authToken } = await b2Client.getDownloadUrl(document.b2FileName);

    return {
      url,
      authToken,
      expiresIn: B2_CONSTANTS.DOWNLOAD_URL_EXPIRATION,
    };
  },
});

/**
 * Delete a file from B2 storage
 * Called by vault.remove mutation
 */
export const deleteFile = action({
  args: {
    documentId: v.id("vaultDocuments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get document using internal query
    const document = await ctx.runQuery(internal.auth.getDocumentInternal, {
      documentId: args.documentId,
    });

    if (!document) {
      throw new Error("Document not found");
    }

    // Verify household access and permissions
    const membership = await ctx.runQuery(internal.auth.requireHouseholdAccessInternal, {
      householdId: document.householdId,
    });
    const { profile } = await ctx.runQuery(internal.auth.requireAuthInternal);

    // Only admins or the uploader can delete
    const isAdmin = membership.role === "owner" || membership.role === "steward";
    const isUploader = document.uploadedBy === profile._id;

    if (!isAdmin && !isUploader) {
      throw new Error("Access denied: You do not have permission to delete this document");
    }

    // Delete from B2
    const b2Client = getBackblazeClient();
    await b2Client.deleteFile(document.b2FileName, document.b2FileId);

    return null;
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a user has access to a specific document based on access level
 * Extracted from vault.ts for reuse
 */
function checkDocumentAccess(
  document: {
    accessLevel: "household" | "admins" | "custom";
    uploadedBy: string;
    sharedWithUsers: string[];
  },
  profileId: string,
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
      return document.uploadedBy === profileId || document.sharedWithUsers.includes(profileId);

    default:
      return false;
  }
}
