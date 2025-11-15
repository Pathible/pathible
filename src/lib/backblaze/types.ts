/**
 * TypeScript types for Backblaze B2 API
 */

export interface B2AuthorizeAccountResponse {
  accountId: string;
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  recommendedPartSize: number;
  absoluteMinimumPartSize: number;
  s3ApiUrl: string;
}

export interface B2GetUploadUrlResponse {
  bucketId: string;
  uploadUrl: string;
  authorizationToken: string;
}

export interface B2UploadFileResponse {
  fileId: string;
  fileName: string;
  accountId: string;
  bucketId: string;
  contentLength: number;
  contentSha1: string;
  contentType: string;
  fileInfo: Record<string, string>;
  action: string;
  uploadTimestamp: number;
}

export interface B2FileInfo {
  fileId: string;
  fileName: string;
  contentLength: number;
  contentType: string;
  contentSha1: string;
  fileInfo: Record<string, string>;
  action: string;
  uploadTimestamp: number;
}

export interface B2DownloadAuthorizationResponse {
  bucketId: string;
  fileNamePrefix: string;
  authorizationToken: string;
}

export interface B2DeleteFileVersionResponse {
  fileId: string;
  fileName: string;
}

export interface B2Error {
  status: number;
  code: string;
  message: string;
}

/**
 * Upload URL data returned to client
 */
export interface UploadUrlData {
  uploadUrl: string;
  authorizationToken: string;
  b2FileName: string;
  bucketId: string;
  bucketName: string;
}

/**
 * Upload result from client after uploading to B2
 */
export interface UploadResult {
  fileId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  contentSha1: string;
}

/**
 * Download URL data returned to client
 */
export interface DownloadUrlData {
  url: string;
  expiresIn: number; // seconds
}
