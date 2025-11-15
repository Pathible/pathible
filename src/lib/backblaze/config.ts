/**
 * Backblaze B2 Configuration
 *
 * Environment variables and validation for B2 storage
 */

export interface BackblazeConfig {
  keyId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
}

/**
 * Get validated Backblaze configuration from environment variables
 * Throws error if any required variable is missing
 */
export function getBackblazeConfig(): BackblazeConfig {
  const keyId = process.env.BACKBLAZE_KEY_ID;
  const applicationKey = process.env.BACKBLAZE_APPLICATION_KEY;
  const bucketId = process.env.BACKBLAZE_BUCKET_ID;
  const bucketName = process.env.BACKBLAZE_BUCKET_NAME;

  if (!keyId) {
    throw new Error("BACKBLAZE_KEY_ID environment variable is not set");
  }

  if (!applicationKey) {
    throw new Error("BACKBLAZE_APPLICATION_KEY environment variable is not set");
  }

  if (!bucketId) {
    throw new Error("BACKBLAZE_BUCKET_ID environment variable is not set");
  }

  if (!bucketName) {
    throw new Error("BACKBLAZE_BUCKET_NAME environment variable is not set");
  }

  return {
    keyId,
    applicationKey,
    bucketId,
    bucketName,
  };
}

/**
 * Validate file upload parameters
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

  // Validate file size (max 2GB)
  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes
  if (fileSize <= 0) {
    throw new Error("File size must be greater than 0");
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("File size exceeds maximum allowed size of 2GB");
  }

  // Validate file type
  if (!fileType || fileType.trim().length === 0) {
    throw new Error("File type is required");
  }
}

/**
 * Generate a unique file name for B2 storage
 * Format: household_<householdId>/<timestamp>_<uuid>_<sanitized-filename>
 */
export function generateB2FileName(householdId: string, originalFileName: string): string {
  // Sanitize filename - remove special characters, keep alphanumeric, dots, dashes, underscores
  const sanitized = originalFileName
    .replace(/[^a-zA-Z0-9.-_]/g, "_")
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .toLowerCase();

  // Generate unique identifier
  const timestamp = Date.now();
  const uuid = crypto.randomUUID().split("-")[0]; // Use first segment of UUID

  return `household_${householdId}/${timestamp}_${uuid}_${sanitized}`;
}

/**
 * Constants for B2 integration
 */
export const B2_CONSTANTS = {
  // Signed URL expiration (in seconds)
  DOWNLOAD_URL_EXPIRATION: 3600, // 1 hour

  // Upload URL expiration (in seconds)
  UPLOAD_URL_EXPIRATION: 3600, // 1 hour

  // API URLs
  B2_API_URL: "https://api.backblazeb2.com",
  B2_API_VERSION: "v2",
} as const;
