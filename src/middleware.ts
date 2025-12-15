/**
 * TODO: Migrate to Next.js 16 "proxy" convention
 *
 * The "middleware" file convention is deprecated in Next.js 16.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Migration blocked until Clerk provides updated documentation for the
 * new proxy convention. Monitor Clerk's Next.js 16 migration guide.
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
