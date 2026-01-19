/**
 * PostHog Client-Side Initialization
 *
 * This file is automatically loaded by Next.js 15.3+ on the client side.
 * PostHog is initialized here for lightweight, fast integration.
 *
 * After initialization, import posthog from 'posthog-js' anywhere to use:
 * - posthog.capture('event_name', { property: 'value' })
 * - posthog.identify('user_id', { email: '...' })
 *
 * @see https://posthog.com/docs/libraries/next-js
 */
import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (posthogKey && posthogHost) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    // Use the latest defaults for modern best practices
    defaults: "2025-05-24",
    // Capture pageviews automatically
    capture_pageview: true,
    // Capture pageleaves for session duration tracking
    capture_pageleave: true,
    // Disable session recording by default (can enable in PostHog dashboard)
    disable_session_recording: true,
    // Respect Do Not Track browser setting
    respect_dnt: true,
    // Don't persist across subdomains
    cross_subdomain_cookie: false,
  });
}

export { posthog };
