"use node";

import { convex as convexPlugin } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { getEmailVerificationOTPEmail } from "../lib/email-templates/otp-email-verification";
import { getPasswordResetOTPEmail } from "../lib/email-templates/otp-password-reset";
import { getSignInOTPEmail } from "../lib/email-templates/otp-sign-in";
import { authComponent } from "./auth";

/**
 * Better Auth Configuration for Convex (Node.js runtime)
 *
 * This file contains the Better Auth setup that requires Node.js APIs.
 * It's separated from auth.ts to allow queries/mutations to run in the
 * default Convex runtime while HTTP routes run in Node.js.
 */

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Create the Better Auth instance with Convex adapter
 */
// Note: ctx type uses unknown and type assertion because Better Auth's adapter
// expects GenericCtx but we need to accept various Convex context types
export const createAuth = (ctx: unknown) =>
  betterAuth({
    database: authComponent.adapter(ctx as Parameters<typeof authComponent.adapter>[0]),
    // CRITICAL: baseURL is required for Convex JWT token validation
    // This must point to your Convex site URL
    baseURL: process.env.CONVEX_SITE_URL,
    // Add trustedOrigins to allow requests from Next.js app
    // Note: Convex env vars are separate from Next.js .env.local
    trustedOrigins: [
      process.env.CONVEX_SITE_URL || "",
      process.env.SITE_URL || "http://localhost:3000",
      "http://localhost:3001",
    ],
    emailAndPassword: {
      enabled: false, // We use email OTP instead
    },
    plugins: [
      // CRITICAL: convex() plugin is required for JWT token generation
      // and OIDC endpoint configuration. Without this, Convex cannot
      // validate JWT tokens and ctx.auth.getUserIdentity() returns null
      convexPlugin({
        jwtExpirationSeconds: 60 * 15, // 15 minutes
      }),
      emailOTP({
        expiresIn: 300, // 5 minutes - explicitly documented
        otpLength: 6, // 6-digit codes
        allowedAttempts: 3, // Maximum 3 verification attempts per OTP
        storeOTP: "encrypted", // Encrypt OTPs in database for security
        async sendVerificationOTP({ email, otp, type }) {
          const emailFrom = process.env.EMAIL_FROM_ADDRESS || "noreply@pathible.com";
          const emailFromName = process.env.EMAIL_FROM_NAME || "Pathible";

          // Get the appropriate email template based on type
          const emailTemplate =
            type === "sign-in"
              ? getSignInOTPEmail(otp)
              : type === "email-verification"
                ? getEmailVerificationOTPEmail(otp)
                : getPasswordResetOTPEmail(otp);

          if (resend) {
            try {
              await resend.emails.send({
                from: `${emailFromName} <${emailFrom}>`,
                to: email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text,
              });
              console.log(`[Auth] OTP sent to ${email}`);
            } catch (error) {
              console.error(`[Auth] Failed to send OTP to ${email}:`, error);
              throw new Error("Failed to send verification code");
            }
          } else {
            // Development mode - log OTP to console
            console.log(`[Auth] OTP for ${email}: ${otp} (type: ${type})`);
          }
        },
      }),
    ],
  });
