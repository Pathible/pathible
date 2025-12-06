import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { getServerSession } from "@/lib/auth-session";
import { generateB2FileName, validateUploadParams, B2_CONSTANTS } from "@/lib/backblaze/config";
import { getBackblazeS3Client } from "@/lib/backblaze/s3-client";

/**
 * POST /api/vault/upload-url
 * Generate a presigned upload URL for Backblaze B2 (S3-compatible API)
 *
 * This endpoint:
 * 1. Verifies the user is authenticated
 * 2. Validates upload parameters (file size, name, etc.)
 * 3. Generates a unique B2 file key
 * 4. Returns a presigned URL for direct browser upload
 *
 * The presigned URL allows the browser to upload directly to B2
 * without CORS issues or exposing credentials.
 */
export async function POST(request: Request) {
  try {
    // Step 0: Validate origin for CSRF protection
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      process.env.SITE_URL,
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    ].filter(Boolean);

    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      console.error("[Upload URL] Invalid origin:", origin);
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    // Step 1: Verify authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    // Get JWT token for Convex queries
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Token unavailable" }, { status: 401 });
    }

    // Step 2: Parse request body
    const body = await request.json();
    const { householdId, fileName, fileType, fileSize } = body;

    // Validate required fields
    if (!householdId || typeof householdId !== "string") {
      return NextResponse.json({ error: "householdId is required" }, { status: 400 });
    }

    // Step 2.5: CRITICAL SECURITY - Verify user is a member of the household
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("[Upload URL] NEXT_PUBLIC_CONVEX_URL not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const convexClient = new ConvexHttpClient(convexUrl);
    convexClient.setAuth(token);

    try {
      // Use households.get which verifies membership via requireHouseholdAccess
      const household = await convexClient.query(api.households.get, {
        householdId: householdId as Id<"households">,
      });

      if (!household) {
        return NextResponse.json(
          { error: "Access denied: Not a member of this household" },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("[Upload URL] Household access check failed:", error);
      return NextResponse.json(
        { error: "Access denied: Unable to verify household membership" },
        { status: 403 }
      );
    }

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    if (!fileType || typeof fileType !== "string") {
      return NextResponse.json({ error: "fileType is required" }, { status: 400 });
    }

    if (!fileSize || typeof fileSize !== "number") {
      return NextResponse.json(
        { error: "fileSize is required and must be a number" },
        { status: 400 },
      );
    }

    // Step 3: Validate upload parameters
    try {
      validateUploadParams({
        fileName,
        fileSize,
        fileType,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid upload parameters";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Step 4: Generate unique B2 file key
    const b2FileName = generateB2FileName(householdId, fileName);

    // Step 5: Get presigned upload URL using S3-compatible API
    try {
      const s3Client = getBackblazeS3Client();
      // Security: Reduced URL expiration from 1 hour to 15 minutes
      const { uploadUrl, key, expiresIn } = await s3Client.getPresignedUploadUrl(
        b2FileName,
        fileType,
        { expiresIn: B2_CONSTANTS.UPLOAD_URL_EXPIRATION },
      );

      return NextResponse.json({
        uploadUrl,
        b2FileName: key,
        // Security: Removed bucketName from response to avoid exposing infrastructure details
        expiresIn,
        // Note: With S3 presigned URLs, the client just needs to PUT the file
        // to uploadUrl with Content-Type header - no authorization header needed
      });
    } catch (error) {
      console.error("[Upload URL] Failed to get presigned upload URL:", error);
      return NextResponse.json(
        { error: "Failed to generate upload URL. Please try again." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[Upload URL] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
