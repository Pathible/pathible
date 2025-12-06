import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Note: baseURL is not needed here - the convexClient plugin handles token fetching
// Auth requests go through Next.js API routes which proxy to Convex
export const authClient = createAuthClient({
  plugins: [convexClient(), emailOTPClient()],
});
