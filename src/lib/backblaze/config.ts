/**
 * Backblaze B2 Configuration
 *
 * Environment variables and validation for B2 storage
 *
 * This file supports both:
 * 1. Native B2 API (legacy) - Used by BackblazeClient
 * 2. S3-Compatible API (recommended) - Used by BackblazeS3Client
 *
 * The S3-Compatible API is preferred for new implementations due to:
 * - Better CORS support with presigned URLs
 * - Standard S3 API semantics
 * - Compatibility with AWS SDK tooling
 * - No custom authorization headers needed in browser
 */

/**
 * Configuration for Native B2 API
 * @deprecated Use S3-Compatible API instead (BackblazeS3Config)
 */
export interface BackblazeConfig {
  keyId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
}

/**
 * Configuration for S3-Compatible API
 * This is the recommended approach for new implementations
 */
export interface BackblazeS3Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

/**
 * Get validated S3-Compatible API configuration from environment variables
 * Throws error if any required variable is missing
 *
 * Required environment variables:
 * - B2_S3_ENDPOINT: S3-compatible endpoint URL (e.g., https://s3.us-west-004.backblazeb2.com)
 * - B2_S3_REGION: AWS region format (e.g., us-west-004)
 * - B2_S3_ACCESS_KEY_ID: Your B2 key ID (same as BACKBLAZE_KEY_ID)
 * - B2_S3_SECRET_ACCESS_KEY: Your B2 application key (same as BACKBLAZE_APPLICATION_KEY)
 * - B2_S3_BUCKET_NAME: Your bucket name
 */
export function getS3Config(): BackblazeS3Config {
  const endpoint = process.env.B2_S3_ENDPOINT;
  const region = process.env.B2_S3_REGION;
  const accessKeyId = process.env.B2_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.B2_S3_SECRET_ACCESS_KEY;
  const bucketName = process.env.B2_S3_BUCKET_NAME;

  // Log available env vars for debugging (without exposing values)
  console.log("[B2 S3 Config] Environment variables check:", {
    hasEndpoint: !!endpoint,
    hasRegion: !!region,
    hasAccessKeyId: !!accessKeyId,
    hasSecretAccessKey: !!secretAccessKey,
    hasBucketName: !!bucketName,
    endpoint: endpoint || "undefined",
    region: region || "undefined",
    accessKeyIdPrefix: accessKeyId ? `${accessKeyId.substring(0, 8)}...` : "undefined",
    bucketName: bucketName || "undefined",
  });

  if (!endpoint) {
    throw new Error(
      "B2_S3_ENDPOINT environment variable is not set. Please add it to .env.local (e.g., https://s3.us-west-004.backblazeb2.com)",
    );
  }

  if (!region) {
    throw new Error(
      "B2_S3_REGION environment variable is not set. Please add it to .env.local (e.g., us-west-004)",
    );
  }

  if (!accessKeyId) {
    throw new Error(
      "B2_S3_ACCESS_KEY_ID environment variable is not set. Please add it to .env.local (same value as BACKBLAZE_KEY_ID)",
    );
  }

  if (!secretAccessKey) {
    throw new Error(
      "B2_S3_SECRET_ACCESS_KEY environment variable is not set. Please add it to .env.local (same value as BACKBLAZE_APPLICATION_KEY)",
    );
  }

  if (!bucketName) {
    throw new Error(
      "B2_S3_BUCKET_NAME environment variable is not set. Please add it to .env.local",
    );
  }

  return {
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    bucketName,
  };
}

/**
 * Get validated Backblaze configuration from environment variables
 * Throws error if any required variable is missing
 *
 * @deprecated Use getS3Config() for new implementations
 */
export function getBackblazeConfig(): BackblazeConfig {
  const keyId = process.env.BACKBLAZE_KEY_ID;
  const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY;
  const bucketId = process.env.BACKBLAZE_BUCKET_ID;
  const bucketName = process.env.BACKBLAZE_BUCKET_NAME;

  // Log available env vars for debugging (without exposing values)
  console.log("[B2 Config] Environment variables check:", {
    hasKeyId: !!keyId,
    hasApplicationKey: !!applicationKey,
    hasBucketId: !!bucketId,
    hasBucketName: !!bucketName,
    keyIdPrefix: keyId ? `${keyId.substring(0, 8)}...` : "undefined",
    bucketId: bucketId || "undefined",
    bucketName: bucketName || "undefined",
  });

  if (!keyId) {
    throw new Error(
      "BACKBLAZE_KEY_ID environment variable is not set. Please add it to .env.local",
    );
  }

  if (!applicationKey) {
    throw new Error(
      "BACKBLAZE_APPLICATION_KEY environment variable is not set. Please add it to .env.local",
    );
  }

  if (!bucketId) {
    throw new Error(
      "BACKBLAZE_BUCKET_ID environment variable is not set. Please add it to .env.local",
    );
  }

  if (!bucketName) {
    throw new Error(
      "BACKBLAZE_BUCKET_NAME environment variable is not set. Please add it to .env.local",
    );
  }

  return {
    keyId,
    applicationKey,
    bucketId,
    bucketName,
  };
}

/**
 * Validate file upload parameters with security checks
 */
export function validateUploadParams(params: {
  fileName: string;
  fileSize: number;
  fileType: string;
}): void {
  const { fileName, fileSize, fileType } = params;

  // Validate file name
  if (!fileName || fileName.trim().length === 0) {
    throw new Error("File name is required");
  }

  if (fileName.length > 255) {
    throw new Error("File name is too long (max 255 characters)");
  }

  // Security: Check for blocked file extensions
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  if (BLOCKED_EXTENSIONS.has(extension)) {
    throw new Error(`File type ".${extension}" is not allowed for security reasons`);
  }

  // Validate file size
  if (fileSize <= 0) {
    throw new Error("File size must be greater than 0");
  }

  if (fileSize > B2_CONSTANTS.MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed size of ${B2_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }

  // Validate file type
  if (!fileType || fileType.trim().length === 0) {
    throw new Error("File type is required");
  }

  // Security: Validate MIME type against allowlist
  if (!ALLOWED_MIME_TYPES.has(fileType)) {
    throw new Error(
      `File type "${fileType}" is not allowed. Please upload documents, images, audio, or video files.`
    );
  }
}

/**
 * Generate a unique file name for B2 storage
 * Format: household_<householdId>/<timestamp>_<uuid>.<extension>
 *
 * Security improvements:
 * - Removes any path components to prevent traversal attacks
 * - Removes leading dots to prevent hidden files
 * - Extracts and validates extension separately
 * - Enforces maximum filename length
 * - Uses only the extension from original name, generates safe prefix
 */
export function generateB2FileName(householdId: string, originalFileName: string): string {
  // Security: Remove any path components (prevent path traversal)
  const basename = originalFileName.replace(/^.*[\\/]/, "");

  // Security: Remove leading dots (prevent hidden files)
  const cleanBasename = basename.replace(/^\.+/, "");

  // Extract extension safely
  const parts = cleanBasename.split(".");
  const extension = parts.length > 1
    ? parts.pop()?.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") || "bin"
    : "bin";

  // Enforce max extension length (prevent abuse)
  const safeExtension = extension.slice(0, 10);

  // Generate unique identifier
  const timestamp = Date.now();
  const uuid = crypto.randomUUID().split("-")[0]; // Use first segment of UUID

  // Security: Validate householdId contains only safe characters
  const safeHouseholdId = householdId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeHouseholdId) {
    throw new Error("Invalid household ID");
  }

  return `household_${safeHouseholdId}/${timestamp}_${uuid}.${safeExtension}`;
}

/**
 * Allowed MIME types for file uploads (security allowlist)
 */
export const ALLOWED_MIME_TYPES = new Set([
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/rtf",
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/tiff",
  "image/bmp",
  "image/heic",
  "image/heif",
  // Audio
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  // Video
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives (common for document bundles)
  "application/zip",
  "application/x-zip-compressed",
]);

/**
 * Blocked file extensions (security blocklist)
 */
export const BLOCKED_EXTENSIONS = new Set([
  "exe", "dll", "bat", "cmd", "com", "scr", "vbs", "vbe",
  "js", "jse", "ws", "wsf", "wsc", "wsh",
  "ps1", "psd1", "psm1", "psc1", "psc2",
  "msi", "msp", "mst",
  "jar", "class",
  "sh", "bash", "zsh", "csh", "ksh",
  "app", "dmg", "pkg",
  "deb", "rpm",
  "php", "phtml", "php3", "php4", "php5", "php7", "phps",
  "asp", "aspx", "cer", "csr",
  "py", "pyc", "pyo", "pyw",
  "pl", "pm", "cgi",
  "rb", "rbw",
  "html", "htm", "xhtml", "svg", // Can contain scripts
  "swf", "fla",
]);

/**
 * Constants for B2 integration
 */
export const B2_CONSTANTS = {
  // File size limits
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB in bytes (aligned with frontend validation)

  // Signed URL expiration (in seconds) - reduced for security
  DOWNLOAD_URL_EXPIRATION: 300, // 5 minutes (reduced from 1 hour)

  // Upload URL expiration (in seconds) - reduced for security
  UPLOAD_URL_EXPIRATION: 900, // 15 minutes (reduced from 1 hour)

  // API URLs
  B2_API_BASE_URL: "https://api.backblazeb2.com",
  B2_API_PATH_PREFIX: "/b2api",
  B2_API_VERSION: "v2",
} as const;
