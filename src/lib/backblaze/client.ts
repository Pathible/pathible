/**
 * Backblaze B2 Client
 *
 * Lightweight client for B2 API operations needed for Heritage Vault
 * Follows KISS and YAGNI principles - only implements what we need
 */

import { B2_CONSTANTS, getBackblazeConfig } from "./config";
import type {
  B2AuthorizeAccountResponse,
  B2DeleteFileVersionResponse,
  B2Error,
  B2GetUploadUrlResponse,
  B2UploadFileResponse,
} from "./types";

export class BackblazeClient {
  private authToken: string | null = null;
  private apiUrl: string | null = null;
  private downloadUrl: string | null = null;
  private authExpiry: number = 0;
  private config = getBackblazeConfig();

  /**
   * Authorize with B2 API
   * Caches the authorization token for reuse
   */
  private async authorize(): Promise<void> {
    // Check if we have a valid cached token (expires in 23 hours, we refresh after 22)
    const now = Date.now();
    if (this.authToken && this.apiUrl && this.authExpiry > now) {
      return;
    }

    const authString = Buffer.from(`${this.config.keyId}:${this.config.applicationKey}`).toString(
      "base64",
    );

    const response = await fetch(
      `${B2_CONSTANTS.B2_API_URL}/${B2_CONSTANTS.B2_API_VERSION}/b2_authorize_account`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${authString}`,
        },
      },
    );

    if (!response.ok) {
      const error: B2Error = await response.json();
      throw new Error(`B2 authorization failed: ${error.message}`);
    }

    const data: B2AuthorizeAccountResponse = await response.json();
    this.authToken = data.authorizationToken;
    this.apiUrl = data.apiUrl;
    this.downloadUrl = data.downloadUrl;
    // Token expires in 24 hours, refresh after 22 hours
    this.authExpiry = now + 22 * 60 * 60 * 1000;
  }

  /**
   * Ensure we have valid auth credentials
   * Returns auth token after ensuring authorization
   */
  private async ensureAuth(): Promise<{ authToken: string; apiUrl: string }> {
    await this.authorize();
    if (!this.authToken || !this.apiUrl) {
      throw new Error("Authorization failed: authToken or apiUrl not set");
    }
    return { authToken: this.authToken, apiUrl: this.apiUrl };
  }

  /**
   * Get upload URL for a file
   */
  async getUploadUrl(): Promise<B2GetUploadUrlResponse> {
    const { authToken, apiUrl } = await this.ensureAuth();

    const response = await fetch(`${apiUrl}/${B2_CONSTANTS.B2_API_VERSION}/b2_get_upload_url`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: this.config.bucketId,
      }),
    });

    if (!response.ok) {
      const error: B2Error = await response.json();
      throw new Error(`Failed to get upload URL: ${error.message}`);
    }

    return response.json();
  }

  /**
   * Upload a file to B2
   * Note: This is typically called from client-side, but included for server-side uploads if needed
   */
  async uploadFile(
    uploadUrl: string,
    uploadToken: string,
    fileName: string,
    fileData: Buffer | Uint8Array,
    contentType: string,
    sha1Hash?: string,
  ): Promise<B2UploadFileResponse> {
    // Calculate SHA1 if not provided
    const hash = sha1Hash || (await this.calculateSHA1(fileData)).toString("hex");

    // Convert Buffer to Uint8Array for fetch compatibility
    const bodyData = Buffer.isBuffer(fileData) ? new Uint8Array(fileData) : fileData;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadToken,
        "Content-Type": contentType,
        "Content-Length": fileData.length.toString(),
        "X-Bz-File-Name": encodeURIComponent(fileName),
        "X-Bz-Content-Sha1": hash,
      },
      body: bodyData as BodyInit,
    });

    if (!response.ok) {
      const error: B2Error = await response.json();
      throw new Error(`File upload failed: ${error.message}`);
    }

    return response.json();
  }

  /**
   * Get download authorization for a file
   * Returns an authorization token that can be used to download files
   */
  async getDownloadAuthorization(
    fileNamePrefix: string,
    validDurationInSeconds: number = B2_CONSTANTS.DOWNLOAD_URL_EXPIRATION,
  ): Promise<string> {
    const { authToken, apiUrl } = await this.ensureAuth();

    const response = await fetch(
      `${apiUrl}/${B2_CONSTANTS.B2_API_VERSION}/b2_get_download_authorization`,
      {
        method: "POST",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: this.config.bucketId,
          fileNamePrefix,
          validDurationInSeconds,
        }),
      },
    );

    if (!response.ok) {
      const error: B2Error = await response.json();
      throw new Error(`Failed to get download authorization: ${error.message}`);
    }

    const data = await response.json();
    return data.authorizationToken;
  }

  /**
   * Generate download URL and authorization token for a file
   * Returns both URL and auth token - client must include token in Authorization header
   */
  async getDownloadUrl(fileName: string): Promise<{ url: string; authToken: string }> {
    await this.authorize();

    // For private buckets, we need download authorization
    const authToken = await this.getDownloadAuthorization(fileName);

    // Construct download URL (auth token goes in Authorization header, not query params)
    const encodedFileName = encodeURIComponent(fileName);
    const url = `${this.downloadUrl}/file/${this.config.bucketName}/${encodedFileName}`;

    return { url, authToken };
  }

  /**
   * Delete a file from B2
   */
  async deleteFile(fileName: string, fileId: string): Promise<B2DeleteFileVersionResponse> {
    const { authToken, apiUrl } = await this.ensureAuth();

    const response = await fetch(
      `${apiUrl}/${B2_CONSTANTS.B2_API_VERSION}/b2_delete_file_version`,
      {
        method: "POST",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          fileId,
        }),
      },
    );

    if (!response.ok) {
      const error: B2Error = await response.json();
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    return response.json();
  }

  /**
   * Calculate SHA1 hash of file data
   */
  private async calculateSHA1(data: Buffer | Uint8Array): Promise<Buffer> {
    const crypto = await import("node:crypto");
    return crypto.createHash("sha1").update(data).digest();
  }

  /**
   * Get the configured bucket name
   */
  getBucketName(): string {
    return this.config.bucketName;
  }

  /**
   * Get the configured bucket ID
   */
  getBucketId(): string {
    return this.config.bucketId;
  }
}

/**
 * Singleton instance of BackblazeClient
 * Reuses authorization tokens across requests
 */
let clientInstance: BackblazeClient | null = null;

export function getBackblazeClient(): BackblazeClient {
  if (!clientInstance) {
    clientInstance = new BackblazeClient();
  }
  return clientInstance;
}
