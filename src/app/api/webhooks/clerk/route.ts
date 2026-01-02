import { headers } from "next/headers";

/**
 * Clerk Webhook Handler (Next.js Route)
 *
 * DEPRECATED: This route forwards requests to the Convex HTTP endpoint.
 * For new setups, configure Clerk to send webhooks directly to:
 *   https://[your-convex-deployment].convex.site/clerk-webhook
 *
 * This route is kept for backwards compatibility during migration.
 *
 * ## Production Setup (Recommended)
 *
 * Configure Clerk Dashboard to send webhooks directly to Convex:
 * - URL: https://[your-convex-deployment].convex.site/clerk-webhook
 * - Events: user.updated, subscription.*
 *
 * ## Legacy Setup (This Route)
 *
 * If you prefer to use the Next.js route:
 * - URL: https://yourdomain.com/api/webhooks/clerk
 * - Events: user.subscription.created, user.subscription.updated
 * - Set CLERK_WEBHOOK_SECRET in both Vercel and Convex
 */

export async function POST(req: Request) {
  // Get Convex site URL from deployment URL
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("[Clerk Webhook] NEXT_PUBLIC_CONVEX_URL not configured");
    return new Response("Convex URL not configured", { status: 500 });
  }

  // Convert cloud URL to site URL
  // e.g., https://hushed-horse-302.convex.cloud -> https://hushed-horse-302.convex.site
  const convexSiteUrl = convexUrl.replace(".convex.cloud", ".convex.site");

  // Forward the request to Convex HTTP endpoint
  const headerPayload = await headers();
  const body = await req.text();

  try {
    const response = await fetch(`${convexSiteUrl}/clerk-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": headerPayload.get("svix-id") || "",
        "svix-timestamp": headerPayload.get("svix-timestamp") || "",
        "svix-signature": headerPayload.get("svix-signature") || "",
      },
      body,
    });

    const responseText = await response.text();
    return new Response(responseText, { status: response.status });
  } catch (error) {
    console.error("[Clerk Webhook] Error forwarding to Convex:", error);
    return new Response("Error forwarding webhook", { status: 500 });
  }
}
