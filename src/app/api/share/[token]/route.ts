import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api, internal } from "@/convex/_generated/api";
import { getBackblazeS3Client } from "@/lib/backblaze/s3-client";

/**
 * Public Share API - Document sharing for estate administration
 *
 * GET  /api/share/[token] - Get share metadata (document name, status, expiry)
 * POST /api/share/[token] - Download action (generates presigned B2 URL)
 *
 * Metadata uses token-based access. Downloads require the verified recipient email.
 * Rate limited to 5 requests per token per minute.
 */

async function checkRateLimit(token: string): Promise<boolean> {
  const client = getAdminConvexClient();
  return await (
    client as unknown as { mutation: (fn: unknown, args: unknown) => Promise<boolean> }
  ).mutation(internal.estateDocuments.checkShareRateLimit, { token });
}

function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL not configured");
  }
  return new ConvexHttpClient(convexUrl);
}

function getAdminConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  if (!convexUrl || !deployKey) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL or CONVEX_DEPLOY_KEY not configured");
  }
  const client = new ConvexHttpClient(convexUrl);
  // setAdminAuth exists at runtime but is missing from type declarations in convex@1.31.x
  (client as unknown as { setAdminAuth: (token: string) => void }).setAdminAuth(deployKey);
  return client;
}

const SECURITY_HEADERS = {
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

/**
 * GET /api/share/[token]
 * Returns share metadata: document name, recipient, expiry, status.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  try {
    const { token } = await params;

    if (!token || token.length < 20 || token.length > 128) {
      return NextResponse.json(
        { error: "Invalid share link" },
        { status: 400, headers: SECURITY_HEADERS },
      );
    }

    if (!(await checkRateLimit(token))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: SECURITY_HEADERS },
      );
    }

    const convexClient = getConvexClient();
    const share = await convexClient.query(api.estateDocuments.getShareByToken, { token });

    if (!share) {
      return NextResponse.json(
        { error: "Share link not found or has been removed" },
        { status: 404, headers: SECURITY_HEADERS },
      );
    }

    // Check status conditions
    if (share.status === "revoked") {
      return NextResponse.json(
        { error: "This share link has been revoked", status: "revoked" },
        { status: 410, headers: SECURITY_HEADERS },
      );
    }

    if (share.status === "expired" || share.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: "This share link has expired", status: "expired" },
        { status: 410, headers: SECURITY_HEADERS },
      );
    }

    if (share.status === "exhausted" || share.downloadCount >= share.maxDownloads) {
      return NextResponse.json(
        { error: "This share link has reached its download limit", status: "exhausted" },
        { status: 410, headers: SECURITY_HEADERS },
      );
    }

    // Log the view access
    try {
      await convexClient.mutation(api.estateDocuments.logShareAccess, {
        shareToken: token,
        action: "viewed",
      });
    } catch {
      // Non-critical: don't fail the request if logging fails
    }

    return NextResponse.json(
      {
        documentName: share.documentName,
        recipientName: share.recipientName,
        expiresAt: share.expiresAt,
        status: share.status,
        downloadsRemaining: share.maxDownloads - share.downloadCount,
      },
      { headers: SECURITY_HEADERS },
    );
  } catch (error) {
    console.error("[Share API] GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: SECURITY_HEADERS },
    );
  }
}

/**
 * POST /api/share/[token]
 * Generate a temporary download URL for the shared document.
 * Expects JSON body: { action: "download" }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  try {
    const { token } = await params;

    if (!token || token.length < 20 || token.length > 128) {
      return NextResponse.json(
        { error: "Invalid share link" },
        { status: 400, headers: SECURITY_HEADERS },
      );
    }

    if (!(await checkRateLimit(token))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: SECURITY_HEADERS },
      );
    }

    const body = await request.json();
    if (body.action !== "download") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400, headers: SECURITY_HEADERS },
      );
    }

    // Validate share is still active via the public query
    const convexClient = getConvexClient();
    const share = await convexClient.query(api.estateDocuments.getShareByToken, { token });

    if (!share) {
      return NextResponse.json(
        { error: "Share link not found or has been removed" },
        { status: 404, headers: SECURITY_HEADERS },
      );
    }

    if (share.status !== "active") {
      return NextResponse.json(
        { error: `This share link is ${share.status}` },
        { status: 410, headers: SECURITY_HEADERS },
      );
    }

    if (share.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: "This share link has expired" },
        { status: 410, headers: SECURITY_HEADERS },
      );
    }

    if (share.downloadCount >= share.maxDownloads) {
      return NextResponse.json(
        { error: "This share link has reached its download limit" },
        { status: 410, headers: SECURITY_HEADERS },
      );
    }

    const user = await currentUser();
    const verifiedEmails =
      user?.emailAddresses
        .filter((email) => email.verification?.status === "verified")
        .map((email) => email.emailAddress.toLowerCase()) ?? [];
    if (!verifiedEmails.length)
      return NextResponse.json(
        { error: "Sign in with the recipient email to download this document." },
        { status: 401, headers: SECURITY_HEADERS },
      );

    // Get B2 file info via internal query (requires admin auth with deploy key)
    const adminClient = getAdminConvexClient();
    // Admin-authed client can call internal functions; cast through unknown to satisfy TS
    const docInfo = (await (
      adminClient as unknown as {
        query: (fn: unknown, args: unknown) => Promise<unknown>;
      }
    ).query(internal.estateDocuments.getShareDocumentB2Info, {
      token,
    })) as {
      recipientEmail: string;
      b2FileName: string;
      documentName: string;
      fileType: string;
    } | null;

    if (!docInfo) {
      return NextResponse.json(
        { error: "Document no longer available" },
        { status: 404, headers: SECURITY_HEADERS },
      );
    }

    if (!verifiedEmails.includes(docInfo.recipientEmail.toLowerCase()))
      return NextResponse.json(
        { error: "This document was shared with a different email address." },
        { status: 403, headers: SECURITY_HEADERS },
      );

    // Generate presigned download URL (valid for 1 hour)
    const s3Client = getBackblazeS3Client();
    const { downloadUrl, expiresIn } = await s3Client.getPresignedDownloadUrl(docInfo.b2FileName, {
      expiresIn: 3600,
    });

    const consumed = await (
      adminClient as unknown as { mutation: (fn: unknown, args: unknown) => Promise<boolean> }
    ).mutation(internal.estateDocuments.consumeShareDownload, { token, verifiedEmails });
    if (!consumed)
      return NextResponse.json(
        { error: "This share link is no longer available." },
        { status: 410, headers: SECURITY_HEADERS },
      );

    return NextResponse.json(
      {
        downloadUrl,
        documentName: docInfo.documentName,
        fileType: docInfo.fileType,
        expiresIn,
      },
      { headers: SECURITY_HEADERS },
    );
  } catch (error) {
    console.error("[Share API] POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: SECURITY_HEADERS },
    );
  }
}
