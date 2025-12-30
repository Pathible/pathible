"use node";

/**
 * Heritage Vault - Backblaze B2 Actions
 *
 * Convex actions for file upload/download operations with B2 storage.
 * Uses "use node" directive to access Node.js APIs for B2 client.
 *
 * SECURITY: All operations require:
 * 1. Active subscription (not cancelled/past_due)
 * 2. Storage quota validation for uploads
 * 3. Household membership verification
 */

import { v } from "convex/values";
import { getBackblazeClient } from "../lib/backblaze/client";
import { B2_CONSTANTS, generateB2FileName, validateUploadParams } from "../lib/backblaze/config";
import type { UploadUrlData } from "../lib/backblaze/types";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { isAdminRole } from "./vaultHelpers";

/**
 * Generate a signed upload URL for B2
 * Client will use this URL to upload the file directly to B2
 *
 * SECURITY: Enforces storage quota limits by tier:
 * - Foundations: 5GB max
 * - Heritage: 25GB max
 * - Legacy: Unlimited
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

    // SECURITY: Check subscription status and storage quota
    const storageCheck = await ctx.runQuery(internal.vault.checkStorageQuotaInternal, {
      householdId: args.householdId,
      additionalBytes: args.fileSize,
    });

    if (!storageCheck.allowed) {
      throw new Error(storageCheck.error || "Storage quota exceeded");
    }

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
 *
 * SECURITY: Uses atomic auth+access check to prevent TOCTOU race conditions
 * SECURITY: Requires active subscription for downloads
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
    // SECURITY: Atomic document fetch + auth + access check (prevents TOCTOU race)
    const result = await ctx.runQuery(internal.auth.getDocumentWithAccessInternal, {
      documentId: args.documentId,
    });

    if (!result) {
      throw new Error("Document not found or access denied");
    }

    const { document } = result;

    // SECURITY: Check subscription status (reusing storage check which validates status)
    const subscriptionCheck = await ctx.runQuery(internal.vault.checkStorageQuotaInternal, {
      householdId: document.householdId,
      additionalBytes: 0, // No additional storage needed for downloads
    });

    // Only check subscription status, not quota (downloads don't consume quota)
    if (subscriptionCheck.error?.includes("Subscription is")) {
      throw new Error(subscriptionCheck.error);
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
 *
 * SECURITY: Uses atomic auth+access check to prevent TOCTOU race conditions
 * SECURITY: Requires active subscription for deletions
 */
export const deleteFile = action({
  args: {
    documentId: v.id("vaultDocuments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // SECURITY: Atomic document fetch + auth + access check (prevents TOCTOU race)
    const result = await ctx.runQuery(internal.auth.getDocumentWithAccessInternal, {
      documentId: args.documentId,
    });

    if (!result) {
      throw new Error("Document not found or access denied");
    }

    const { document, membership, profile } = result;

    // SECURITY: Check subscription status
    const subscriptionCheck = await ctx.runQuery(internal.vault.checkStorageQuotaInternal, {
      householdId: document.householdId,
      additionalBytes: 0,
    });

    if (subscriptionCheck.error?.includes("Subscription is")) {
      throw new Error(subscriptionCheck.error);
    }

    // Only admins or the uploader can delete
    const hasDeletePermission = isAdminRole(membership.role) || document.uploadedBy === profile._id;

    if (!hasDeletePermission) {
      throw new Error("Access denied: You do not have permission to delete this document");
    }

    // Delete from B2
    const b2Client = getBackblazeClient();
    await b2Client.deleteFile(document.b2FileName, document.b2FileId);

    return null;
  },
});
