import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getBackblazeS3Client } from "@/lib/backblaze/s3-client";

/**
 * POST /api/vault/delete
 * Delete a file from Backblaze B2 storage (S3-compatible API)
 *
 * This endpoint:
 * 1. Verifies the user is authenticated
 * 2. Fetches the document from Convex
 * 3. Verifies the user has permission to delete (admin or uploader)
 * 4. Deletes the file from B2
 * 5. Returns success (Convex mutation handles DB cleanup separately)
 */
export async function POST(request: Request) {
  try {
    // Step 0: Validate origin for CSRF protection
    const origin = request.headers.get("origin");
    const allowedOrigins = [process.env.SITE_URL, process.env.NEXT_PUBLIC_CONVEX_SITE_URL].filter(
      Boolean,
    );

    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      console.error("[Delete] Invalid origin:", origin);
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    // Step 1: Get JWT token for authentication
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });
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

    // Step 4: Get document from Convex to verify access and get B2 details
    let document: {
      b2FileName: string;
      householdId: Id<"households">;
      uploadedBy: string;
    } | null = null;
    try {
      document = await convexClient.query(api.vault.get, {
        documentId: documentId as Id<"vaultDocuments">,
      });

      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
    } catch (error) {
      console.error("[API] Failed to fetch document:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to access document";
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }

    // Step 5: Get current user profile and household membership to verify delete permissions
    // We need to check if user is admin or the uploader
    try {
      const userProfile = await convexClient.query(api.auth.getCurrentUserWithProfile, {});

      if (!userProfile?.profile) {
        return NextResponse.json({ error: "User profile not found" }, { status: 403 });
      }

      // Get household membership to check role
      const households = await convexClient.query(api.households.list, {});
      const household = households?.find(
        (h: { _id: Id<"households"> }) => h._id === document.householdId,
      );

      if (!household) {
        return NextResponse.json(
          { error: "Access denied: Not a member of this household" },
          { status: 403 },
        );
      }

      // Get membership details
      const memberships = await convexClient.query(api.households.listMembers, {
        householdId: document.householdId,
      });
      const userMembership = memberships?.find(
        (m: { userId: Id<"profiles"> }) => m.userId === userProfile.profile._id,
      );

      if (!userMembership) {
        return NextResponse.json(
          { error: "Access denied: Not a member of this household" },
          { status: 403 },
        );
      }

      // Check permissions: only admins or the uploader can delete
      const isAdmin = userMembership.role === "owner" || userMembership.role === "steward";
      const isUploader = document.uploadedBy === userProfile.profile._id;

      if (!isAdmin && !isUploader) {
        return NextResponse.json(
          { error: "Access denied: You do not have permission to delete this document" },
          { status: 403 },
        );
      }
    } catch (error) {
      console.error("[API] Failed to verify permissions:", error);
      return NextResponse.json({ error: "Failed to verify permissions" }, { status: 500 });
    }

    // Step 6: Delete from B2 using S3-compatible API
    try {
      const s3Client = getBackblazeS3Client();
      await s3Client.deleteObject(document.b2FileName);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[API] Failed to delete file from B2:", error);
      return NextResponse.json({ error: "Failed to delete file from storage" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] Unexpected error in delete:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
