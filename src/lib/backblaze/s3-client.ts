/**
 * Backblaze B2 S3-Compatible API Client
 *
 * This client uses the S3-compatible API instead of the native B2 API
 * to leverage presigned URLs for direct browser uploads/downloads without CORS issues.
 *
 * Key differences from Native B2 API:
 * - Uses AWS SDK v3 (@aws-sdk/client-s3)
 * - Generates presigned URLs that work seamlessly with browsers
 * - No need for custom authorization headers or CORS configuration
 * - Standard S3 API semantics (PutObject, GetObject, DeleteObject)
 * - Compatible with all S3 tooling and libraries
 *
 * Architecture:
 * - S3Client configured with Backblaze B2 endpoint and credentials
 * - Presigned URLs generated using @aws-sdk/s3-request-presigner
 * - Signature v4 authentication (standard AWS signature method)
 * - forcePathStyle: true for B2 compatibility
 */

import {
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  GetObjectCommand,
  type GetObjectCommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Config } from "./config";

/**
 * Result of presigned URL generation for uploads
 */
export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  expiresIn: number;
  fields?: Record<string, string>; // For future multipart upload support
}

/**
 * Result of presigned URL generation for downloads
 */
export interface PresignedDownloadResult {
  downloadUrl: string;
  expiresIn: number;
}

/**
 * Options for generating presigned URLs
 */
export interface PresignedUrlOptions {
  expiresIn?: number; // Expiration time in seconds (default: 3600)
}

/**
 * S3-Compatible client for Backblaze B2
 * Uses presigned URLs for secure, direct browser uploads/downloads
 */
export class BackblazeS3Client {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const config = getS3Config();

    console.log("[B2 S3 Client] Initializing with config:", {
      endpoint: config.endpoint,
      region: config.region,
      bucketName: config.bucketName,
      hasAccessKeyId: !!config.accessKeyId,
      hasSecretAccessKey: !!config.secretAccessKey,
    });

    this.bucketName = config.bucketName;

    // Initialize S3 client with Backblaze B2 endpoint
    this.s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      // Required for B2 compatibility - uses path-style URLs (bucket.name/key vs bucket-name.domain/key)
      forcePathStyle: true,
    });
  }

  /**
   * Generate a presigned URL for uploading a file to B2
   *
   * This URL can be used directly from the browser to upload files
   * without exposing credentials or requiring server-side proxy.
   *
   * @param key - Object key (file path) in the bucket
   * @param contentType - MIME type of the file (e.g., "image/jpeg")
   * @param options - Optional configuration (expiresIn, etc.)
   * @returns Presigned upload URL and metadata
   *
   * @example
   * const { uploadUrl, key } = await client.getPresignedUploadUrl(
   *   "household_123/document.pdf",
   *   "application/pdf",
   *   { expiresIn: 3600 }
   * );
   *
   * // Client-side upload:
   * await fetch(uploadUrl, {
   *   method: 'PUT',
   *   body: fileData,
   *   headers: { 'Content-Type': 'application/pdf' }
   * });
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    options: PresignedUrlOptions = {},
  ): Promise<PresignedUploadResult> {
    const expiresIn = options.expiresIn || 3600; // Default: 1 hour

    console.log("[B2 S3 Client] Generating presigned upload URL:", {
      bucket: this.bucketName,
      key,
      contentType,
      expiresIn,
    });

    try {
      // Create PutObject command
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      } as PutObjectCommandInput);

      // Generate presigned URL
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      console.log("[B2 S3 Client] Presigned upload URL generated successfully", {
        key,
        urlLength: uploadUrl.length,
        expiresIn,
      });

      return {
        uploadUrl,
        key,
        expiresIn,
      };
    } catch (error) {
      console.error("[B2 S3 Client] Failed to generate presigned upload URL:", {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to generate presigned upload URL: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Generate a presigned URL for downloading a file from B2
   *
   * This URL can be used directly from the browser to download files
   * without exposing credentials or requiring server-side proxy.
   *
   * @param key - Object key (file path) in the bucket
   * @param options - Optional configuration (expiresIn, etc.)
   * @returns Presigned download URL and metadata
   *
   * @example
   * const { downloadUrl } = await client.getPresignedDownloadUrl(
   *   "household_123/document.pdf",
   *   { expiresIn: 3600 }
   * );
   *
   * // Client-side download:
   * window.location.href = downloadUrl;
   * // or
   * const response = await fetch(downloadUrl);
   * const blob = await response.blob();
   */
  async getPresignedDownloadUrl(
    key: string,
    options: PresignedUrlOptions = {},
  ): Promise<PresignedDownloadResult> {
    const expiresIn = options.expiresIn || 3600; // Default: 1 hour

    console.log("[B2 S3 Client] Generating presigned download URL:", {
      bucket: this.bucketName,
      key,
      expiresIn,
    });

    try {
      // Create GetObject command
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      } as GetObjectCommandInput);

      // Generate presigned URL
      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      console.log("[B2 S3 Client] Presigned download URL generated successfully", {
        key,
        urlLength: downloadUrl.length,
        expiresIn,
      });

      return {
        downloadUrl,
        expiresIn,
      };
    } catch (error) {
      console.error("[B2 S3 Client] Failed to generate presigned download URL:", {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to generate presigned download URL: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Delete an object from B2 storage
   *
   * Note: This operation does not use presigned URLs as it's a server-side operation.
   * The client uses direct S3 API calls with credentials.
   *
   * @param key - Object key (file path) to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * await client.deleteObject("household_123/old-document.pdf");
   */
  async deleteObject(key: string): Promise<void> {
    console.log("[B2 S3 Client] Deleting object:", {
      bucket: this.bucketName,
      key,
    });

    try {
      // Create DeleteObject command
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      } as DeleteObjectCommandInput);

      // Execute delete operation
      await this.s3Client.send(command);

      console.log("[B2 S3 Client] Object deleted successfully", { key });
    } catch (error) {
      console.error("[B2 S3 Client] Failed to delete object:", {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to delete object: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get the configured bucket name
   */
  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Test the S3 connection by attempting to generate a presigned URL
   * Useful for verifying configuration during setup
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("[B2 S3 Client] Testing connection...");

      // Try to generate a presigned URL for a test key
      await this.getPresignedUploadUrl("connection-test/test.txt", "text/plain", { expiresIn: 60 });

      console.log("[B2 S3 Client] Connection test successful");
      return true;
    } catch (error) {
      console.error("[B2 S3 Client] Connection test failed:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

/**
 * Singleton instance of BackblazeS3Client
 * Reuses the S3 client configuration across requests
 */
let s3ClientInstance: BackblazeS3Client | null = null;

/**
 * Get or create the singleton S3 client instance
 *
 * @returns BackblazeS3Client instance
 *
 * @example
 * const client = getBackblazeS3Client();
 * const { uploadUrl } = await client.getPresignedUploadUrl(...);
 */
export function getBackblazeS3Client(): BackblazeS3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new BackblazeS3Client();
  }
  return s3ClientInstance;
}

/**
 * Reset the singleton instance (useful for testing or reconfiguration)
 */
export function resetBackblazeS3Client(): void {
  s3ClientInstance = null;
}
