import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

/**
 * Better Auth API Routes
 *
 * This catch-all route handles all Better Auth requests.
 * It proxies requests to the Convex Better Auth component.
 */
export const { GET, POST } = nextJsHandler();
