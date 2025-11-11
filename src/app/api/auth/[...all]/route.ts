import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

/**
 * Better Auth API Routes
 *
 * This catch-all route handles all Better Auth requests.
 * It proxies requests to the Convex Better Auth component.
 *
 * The convexSiteUrl must be provided so the handler knows where to
 * forward auth requests (to the Convex HTTP endpoints).
 */
export const { GET, POST } = nextJsHandler({
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
});
