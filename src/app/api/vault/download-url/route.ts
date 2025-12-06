import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { getBackblazeS3Client } from "@/lib/backblaze/s3-client";

/**
 * POST /api/vault/download-url
 * Generate a presigned download URL for a document in Backblaze B2 (S3-compatible API)
 *
 * This endpoint:
 * 1. Verifies the user is authenticated
 * 2. Fetches the document from Convex
 * 3. Verifies household membership (handled by Convex query)
 * 4. Generates and returns a presigned download URL
 *
 * The presigned URL allows the browser to download directly from B2
 * without CORS issues or exposing credentials.
 */
export async function POST(request: Request) {
  try {
    // Step 0: Validate origin for CSRF protection
    const origin = request.headers.get("origin");
    const allowedOrigins = [process.env.SITE_URL, process.env.NEXT_PUBLIC_CONVEX_SITE_URL].filter(
      Boolean,
    );

    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      console.error("[Download URL] Invalid origin:", origin);
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    // Step 1: Get JWT token for authentication
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Parse request body
    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    // Step 3: Setup Convex client with JWT token
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("[API] NEXT_PUBLIC_CONVEX_URL not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const convexClient = new ConvexHttpClient(convexUrl);
    convexClient.setAuth(token);

    // Step 4: Get document from Convex
    let document: { b2FileName: string } | null = null;
    try {
      document = await convexClient.query(api.vault.get, {
        documentId: documentId as Id<"vaultDocuments">,
      });

      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
    } catch (error) {
      console.error("[API] Failed to fetch document:", error);
      // The vault.get query already checks permissions and throws appropriate errors
      const errorMessage = error instanceof Error ? error.message : "Failed to access document";
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }

    // Step 5: Generate presigned download URL using S3-compatible API
    try {
      const s3Client = getBackblazeS3Client();
      const { downloadUrl, expiresIn } = await s3Client.getPresignedDownloadUrl(
        document.b2FileName,
      );

      return NextResponse.json({
        url: downloadUrl,
        expiresIn,
        // Note: With S3 presigned URLs, client just fetches the URL directly
        // No authorization header needed
      });
    } catch (error) {
      console.error("[API] Failed to generate presigned download URL:", error);
      return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] Unexpected error in download-url:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
