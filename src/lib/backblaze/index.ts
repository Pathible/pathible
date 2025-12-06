/**
 * Backblaze B2 Storage Library
 *
 * This library provides two ways to interact with Backblaze B2:
 *
 * 1. S3-Compatible API (Recommended) - Modern approach with presigned URLs
 * 2. Native B2 API (Legacy) - Original implementation
 *
 * @example Using S3-Compatible API (Recommended)
 * ```typescript
 * import { getBackblazeS3Client } from '@/lib/backblaze';
 *
 * const client = getBackblazeS3Client();
 *
 * // Generate presigned upload URL
 * const { uploadUrl, key } = await client.getPresignedUploadUrl(
 *   'household_123/document.pdf',
 *   'application/pdf'
 * );
 *
 * // Client uploads directly to B2 using fetch
 * await fetch(uploadUrl, {
 *   method: 'PUT',
 *   body: fileData,
 *   headers: { 'Content-Type': 'application/pdf' }
 * });
 *
 * // Generate presigned download URL
 * const { downloadUrl } = await client.getPresignedDownloadUrl(key);
 * window.location.href = downloadUrl;
 * ```
 *
 * @example Using Native B2 API (Legacy)
 * ```typescript
 * import { getBackblazeClient } from '@/lib/backblaze';
 *
 * const client = getBackblazeClient();
 * const uploadData = await client.getUploadUrl();
 * // ... requires custom headers and CORS configuration
 * ```
 */

// Native B2 API (Legacy)
export { BackblazeClient, getBackblazeClient } from "./client";
// Configuration
export {
  B2_CONSTANTS,
  type BackblazeConfig,
  type BackblazeS3Config,
  generateB2FileName,
  getBackblazeConfig,
  getS3Config,
  validateUploadParams,
} from "./config";
// S3-Compatible API (Recommended)
export {
  BackblazeS3Client,
  getBackblazeS3Client,
  type PresignedDownloadResult,
  type PresignedUploadResult,
  type PresignedUrlOptions,
  resetBackblazeS3Client,
} from "./s3-client";

// Types
export type {
  B2AuthorizeAccountResponse,
  B2DeleteFileVersionResponse,
  B2DownloadAuthorizationResponse,
  B2Error,
  B2FileInfo,
  B2GetUploadUrlResponse,
  B2UploadFileResponse,
  DownloadUrlData,
  UploadResult,
  UploadUrlData,
} from "./types";
