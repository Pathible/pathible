/**
 * Next.js 16 Proxy - Authentication & Route Protection
 *
 * Uses Clerk's clerkMiddleware to handle authentication.
 * See: https://clerk.com/docs/reference/nextjs/clerk-middleware
 *
 * Protection layers:
 * 1. Middleware (this file) - Authentication at the edge
 * 2. Layout (/app/(auth)/layout.tsx) - Server-side onboarding checks
 *
 * Note: Middleware cannot make Convex calls, so onboarding checks
 * (which require querying the Convex database for profile/household)
 * are done in the layout for protected routes.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { normalizeReferralSource } from "@/lib/referral";

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
  "/share/(.*)",
  "/api/share/(.*)",
  "/unsubscribe(.*)",
  // SEO routes - must be accessible to crawlers and social media bots
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect();
  const response = NextResponse.next();
  const referral = normalizeReferralSource(request.nextUrl.searchParams.get("ref"));
  if (referral) {
    response.cookies.set("pathible_ref", referral, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
