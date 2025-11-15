# OTP Authentication Testing Guide

This guide explains how to test the email OTP authentication in development and production.

## Development Testing

### Prerequisites
- Start the development servers: `pnpm dev`
- Open your browser console and Convex backend terminal

### Testing Flow

1. **Request OTP**:
   ```typescript
   // In your client-side code (e.g., React component)
   import { authClient } from "@/lib/auth-client";

   await authClient.signIn.email({
     email: "test@example.com"
   });
   ```

2. **Check Console for OTP**:
   Look in the terminal where `pnpm dev:backend` is running. You'll see:
   ```
   ==============================================
   📧 OTP Email (Development Mode)
   ==============================================
   To: test@example.com
   Type: sign-in
   OTP Code: 123456
   ==============================================
   ```

3. **Verify OTP**:
   ```typescript
   await authClient.verifyEmail({
     email: "test@example.com",
     otp: "123456" // Copy from console
   });
   ```

4. **Check Session**:
   ```typescript
   import { useSession } from "better-auth/react";

   const { data: session } = useSession();
   console.log(session); // Should show authenticated user
   ```

## Production Setup

### Email Service Configuration

1. **Choose an email service provider**:
   - [Resend](https://resend.com/) (Recommended for Next.js)
   - [SendGrid](https://sendgrid.com/)
   - [AWS SES](https://aws.amazon.com/ses/)
   - [Postmark](https://postmarkapp.com/)

2. **Get API credentials** from your provider

3. **Set environment variables** in production:
   ```bash
   EMAIL_SERVICE_API_KEY=your-api-key
   EMAIL_FROM_ADDRESS=noreply@pathible.com
   EMAIL_FROM_NAME=Pathible
   ```

### Implementation Example (Resend)

1. **Install Resend** (if using Resend):
   ```bash
   pnpm add resend
   ```

2. **Update `src/convex/auth.ts`** (lines 47-64):
   Replace the production TODO section with:
   ```typescript
   // Production: Send via email service
   const { Resend } = require('resend');
   const resend = new Resend(process.env.EMAIL_SERVICE_API_KEY);

   await resend.emails.send({
     from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
     to: email,
     subject: `Your ${type} verification code`,
     html: `
       <div style="font-family: Arial, sans-serif; padding: 20px;">
         <h2>Your Verification Code</h2>
         <p>Enter this code to complete your ${type}:</p>
         <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; text-align: center; font-weight: bold;">
           ${otp}
         </div>
         <p style="color: #666; font-size: 14px; margin-top: 20px;">
           This code will expire in 5 minutes.
         </p>
       </div>
     `,
   });
   ```

## Testing Checklist

- [ ] Development server starts without errors
- [ ] OTP request logs to console in development
- [ ] OTP verification works with console code
- [ ] Session is created after successful verification
- [ ] OTP expires after 5 minutes
- [ ] Invalid OTP shows error message
- [ ] Type checking passes: `pnpm exec convex typecheck`

## Troubleshooting

### OTP not appearing in console
- Ensure `NODE_ENV` is not set to "production" in development
- Check Convex backend terminal (not Next.js terminal)
- Restart development servers: `pnpm dev`

### "Email sending not configured" error in production
- Set `EMAIL_SERVICE_API_KEY` environment variable
- Set `EMAIL_FROM_ADDRESS` environment variable
- Implement email sending in `src/convex/auth.ts` production section

### Type errors after changes
- Run `pnpm generate` to regenerate Convex types
- Run `pnpm exec convex typecheck` to verify

## API Reference

### Client-side Methods

```typescript
import { authClient } from "@/lib/auth-client";

// Request OTP
await authClient.signIn.email({ email: string });

// Verify OTP
await authClient.verifyEmail({ email: string, otp: string });

// Sign out
await authClient.signOut();
```

### React Hooks

```typescript
import { useSession } from "better-auth/react";

const { data: session, isPending, error } = useSession();
```

## Security Notes

- OTPs are 6 digits long
- OTPs expire after 5 minutes
- OTPs are single-use (cannot be reused)
- Rate limiting is handled by Better Auth
- Email verification is required for sign-in
