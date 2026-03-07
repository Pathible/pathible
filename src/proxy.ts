/**
 * Next.js 16 Proxy - Authentication & Route Protection
 *
 * Uses Clerk's clerkMiddleware to handle authentication.
 * See: https://clerk.com/docs/reference/nextjs/clerk-middleware
 *
 * Protection layers:
 * 1. Middleware (this file) - Fast edge checks for auth only
 * 2. Layout (/app/(auth)/layout.tsx) - Server-side subscription & onboarding checks
 *
 * Note: Middleware cannot make Convex calls, so subscription and onboarding checks
 * are done in the layout for protected routes. Middleware only handles auth.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/pricing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/help(.*)",
  "/learn(.*)",
  "/for-executors(.*)",
  "/api/webhooks(.*)",
  "/api/stripe(.*)",
  // SEO routes - must be accessible to crawlers and social media bots
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image(.*)",
]);

// Routes that require auth but NOT subscription
// These are steps in the user journey before subscription
const isAuthOnlyRoute = createRouteMatcher(["/onboarding(.*)", "/select-plan(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Public routes - no auth required
  if (isPublicRoute(request)) {
    return;
  }

  // All other routes require authentication
  if (!userId) {
    await auth.protect();
    return;
  }

  // Auth-only routes (onboarding, plan selection) - no subscription check
  if (isAuthOnlyRoute(request)) {
    return;
  }

  // Subscription and onboarding checks are handled by the auth layout
  // which can query Convex for the actual subscription data
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
