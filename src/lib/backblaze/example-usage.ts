/**
 * Example Usage of Backblaze S3-Compatible API
 *
 * This file demonstrates how to use the S3-compatible client
 * for common operations in the Heritage Vault feature.
 *
 * NOTE: This is for reference only - not meant to be executed directly
 */

import { generateB2FileName, getBackblazeS3Client, validateUploadParams } from "./index";

/**
 * Example: Server-side API route for generating upload URL
 * Location: src/app/api/vault/upload-url/route.ts
 */
export async function generateUploadUrlExample(
  householdId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
) {
  try {
    // 1. Validate upload parameters
    validateUploadParams({
      fileName,
      fileSize,
      fileType,
    });

    // 2. Generate unique B2 file name
    const b2FileName = generateB2FileName(householdId, fileName);

    // 3. Get S3 client and generate presigned upload URL
    const client = getBackblazeS3Client();
    const { uploadUrl, key, expiresIn } = await client.getPresignedUploadUrl(
      b2FileName,
      fileType,
      { expiresIn: 3600 }, // 1 hour expiration
    );

    // 4. Return to client
    return {
      success: true,
      data: {
        uploadUrl,
        key,
        expiresIn,
        fileName: b2FileName,
      },
    };
  } catch (error) {
    console.error("[Upload URL Generation] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate upload URL",
    };
  }
}

/**
 * Example: Client-side file upload using presigned URL
 * Location: Client component (e.g., src/app/(auth)/vault/components/FileUploader.tsx)
 */
export async function clientSideUploadExample(file: File, uploadUrl: string) {
  try {
    // Upload file directly to B2 using presigned URL
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
        // Note: No authorization header needed! Presigned URL handles auth
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      message: "File uploaded successfully",
    };
  } catch (error) {
    console.error("[Client Upload] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Example: Server-side API route for generating download URL
 * Location: src/app/api/vault/download-url/route.ts
 */
export async function generateDownloadUrlExample(fileKey: string) {
  try {
    // Get S3 client and generate presigned download URL
    const client = getBackblazeS3Client();
    const { downloadUrl, expiresIn } = await client.getPresignedDownloadUrl(fileKey, {
      expiresIn: 3600, // 1 hour expiration
    });

    return {
      success: true,
      data: {
        downloadUrl,
        expiresIn,
      },
    };
  } catch (error) {
    console.error("[Download URL Generation] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate download URL",
    };
  }
}

/**
 * Example: Client-side file download using presigned URL
 * Location: Client component
 */
export async function clientSideDownloadExample(downloadUrl: string, fileName: string) {
  try {
    // Option 1: Direct download (opens browser download dialog)
    window.location.href = downloadUrl;

    // Option 2: Fetch and create blob URL (for more control)
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("[Client Download] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Download failed",
    };
  }
}

/**
 * Example: Server-side file deletion
 * Location: Server Action or API route
 */
export async function deleteFileExample(fileKey: string) {
  try {
    const client = getBackblazeS3Client();
    await client.deleteObject(fileKey);

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("[File Deletion] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}

/**
 * Example: Complete upload flow with progress tracking
 */
export async function uploadWithProgressExample(
  householdId: string,
  file: File,
  onProgress?: (progress: number) => void,
) {
  try {
    // 1. Generate upload URL from server
    const urlResponse = await fetch("/api/vault/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        householdId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }),
    });

    if (!urlResponse.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { data } = await urlResponse.json();

    // 2. Upload file with XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve({
            success: true,
            key: data.key,
            fileName: data.fileName,
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("PUT", data.uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  } catch (error) {
    console.error("[Upload with Progress] Error:", error);
    throw error;
  }
}

/**
 * Example: Test S3 connection (useful for debugging)
 */
export async function testConnectionExample() {
  try {
    const client = getBackblazeS3Client();
    const isConnected = await client.testConnection();

    return {
      success: isConnected,
      message: isConnected ? "Connection successful" : "Connection failed",
    };
  } catch (error) {
    console.error("[Connection Test] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection test failed",
    };
  }
}
