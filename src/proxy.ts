/**
 * Next.js 16 Proxy - Authentication & Route Protection
 *
 * Uses Clerk's clerkMiddleware to handle authentication.
 * See: https://clerk.com/docs/reference/nextjs/clerk-middleware
 *
 * Protection layers:
 * 1. Middleware (this file) - Fast edge checks for auth & subscription
 * 2. Layout (/app/(auth)/layout.tsx) - Server-side onboarding checks
 *
 * Note: Middleware cannot make Convex calls, so onboarding checks
 * (which require querying the Convex database for profile/household)
 * are done in the layout for protected routes.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { checkHasActivePlan } from "@/lib/subscription-plans";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/api/webhooks(.*)",
]);

// Routes that require auth but NOT subscription
// These are steps in the user journey before subscription
const isAuthOnlyRoute = createRouteMatcher(["/onboarding(.*)", "/select-plan(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, has } = await auth();

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

  // Protected routes require active subscription
  const hasActivePlan = checkHasActivePlan(has);

  if (!hasActivePlan) {
    // Redirect to plan selection page
    const url = new URL("/select-plan", request.url);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
