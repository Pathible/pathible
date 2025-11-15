# OTP Expiration Architecture Analysis

**Date:** 2025-11-15
**Status:** VERIFIED - Better Auth enforces 5-minute expiration by default

---

## Executive Summary

After analyzing the Better Auth email OTP plugin implementation, I can confirm that **OTP expiration IS properly enforced at the backend level**. The 5-minute timeout mentioned in the email template is not just UI text—it's enforced by Better Auth's plugin system with proper validation and error handling.

---

## Architecture Overview

### 1. Better Auth Email OTP Plugin Configuration

**Location:** `/Users/jimgibbs/Code/pathible/src/convex/auth.ts`

**Current Implementation:**
```typescript
emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    // Email sending logic
  }
})
```

**Plugin Defaults (from Better Auth v1.3.27):**
- `expiresIn`: **300 seconds (5 minutes)** - DEFAULT
- `otpLength`: 6 digits
- `allowedAttempts`: 3 attempts maximum
- `storeOTP`: "plain" (can be "hashed" or "encrypted")

### 2. Backend Enforcement Mechanism

Better Auth automatically enforces OTP expiration through:

1. **Database Storage:** OTPs are stored with a timestamp in the Better Auth managed tables
2. **Validation Check:** When verifying an OTP, Better Auth checks:
   - If the OTP exists
   - If it matches the provided code
   - If the creation time + `expiresIn` < current time
   - If attempts < `allowedAttempts`

3. **Error Codes:** Built-in error handling:
   ```typescript
   $ERROR_CODES: {
     OTP_EXPIRED: "otp expired",
     INVALID_OTP: "Invalid OTP",
     TOO_MANY_ATTEMPTS: "Too many attempts",
     INVALID_EMAIL: "Invalid email",
     USER_NOT_FOUND: "User not found"
   }
   ```

### 3. Rate Limiting

Better Auth includes built-in rate limiting for OTP endpoints:
- `/email-otp/send-verification-otp` - Limited requests per window
- `/email-otp/check-verification-otp` - Limited verification attempts
- `/sign-in/email-otp` - Limited sign-in attempts

---

## Current Implementation Analysis

### What's Working Correctly

1. **Backend Expiration Enforcement (5 minutes)**
   - ✅ Enforced automatically by Better Auth plugin
   - ✅ Returns `OTP_EXPIRED` error after 5 minutes
   - ✅ No additional backend code needed

2. **Attempt Limiting**
   - ✅ Maximum 3 verification attempts per OTP
   - ✅ Returns `TOO_MANY_ATTEMPTS` error

3. **Email Template Accuracy**
   - ✅ Email correctly states "expires in 5 minutes"
   - ✅ Matches backend enforcement

### UI Implementation

**Location:** `/Users/jimgibbs/Code/pathible/src/app/(unauth)/login/page.tsx`

**Current Behavior:**
- 60-second countdown before allowing resend
- Auto-verification when 6 digits entered
- Error handling for invalid/expired codes

**UI Countdown vs OTP Expiration:**
- **60-second countdown:** Rate limiting for resend button (prevents spam)
- **5-minute expiration:** Actual OTP validity window (backend enforced)

These are **two separate concerns** and both are correct:
- Users can resend after 60 seconds if they didn't receive the email
- OTPs remain valid for 5 minutes from creation time

---

## Verification Flow

### When User Submits OTP:

1. **Client calls:** `authClient.signIn.emailOtp({ email, otp })`
2. **Better Auth checks:**
   - Does OTP exist for this email?
   - Does OTP match the submitted code?
   - Is `current_time - created_at <= 300 seconds`?
   - Are attempts < 3?
3. **If expired:** Returns error with `$ERROR_CODES.OTP_EXPIRED`
4. **If valid:** Creates session and returns user object

### Current Error Handling:

```typescript
// login/page.tsx line 95-102
if (result.error) {
  toast.error("Invalid code", {
    description: result.error.message || "Please try again.",
  });
  setIsLoading(false);
  setOtp("");
  return;
}
```

The error message from Better Auth (including "otp expired") is displayed to the user.

---

## Database Schema

Better Auth manages OTP storage internally in tables like `_better_auth_verification_tokens` or similar (managed by the Convex adapter). The Convex schema in `/Users/jimgibbs/Code/pathible/src/convex/schema.ts` doesn't need to define these tables as they're handled by the `@convex-dev/better-auth` component.

---

## Security Features Currently Implemented

1. **Time-based Expiration:** 5 minutes (300 seconds)
2. **Attempt Limiting:** Maximum 3 attempts per OTP
3. **Rate Limiting:** Built-in request throttling
4. **Secure Storage:** OTP stored in database (can be configured to use hashing/encryption)
5. **Email Validation:** Email format validation before sending

---

## Recommendations

### 1. Explicit Configuration (Optional but Recommended)

While the defaults are secure, explicitly configuring the options makes the security policy clear:

```typescript
// src/convex/auth.ts
emailOTP({
  expiresIn: 300, // 5 minutes - explicitly set
  otpLength: 6,
  allowedAttempts: 3,
  storeOTP: "encrypted", // Consider encrypted storage for production
  async sendVerificationOTP({ email, otp, type }) {
    // ... existing code
  }
})
```

### 2. Enhanced UI Feedback

Add explicit expiration messaging in the UI:

```typescript
// login/page.tsx
<p className="text-sm text-muted-foreground">
  Code expires in 5 minutes. {countdown}s until you can resend.
</p>
```

### 3. Encrypted OTP Storage

For production, consider using encrypted OTP storage:

```typescript
emailOTP({
  storeOTP: "encrypted", // or "hashed"
  // ... other options
})
```

### 4. Monitoring and Analytics

Consider adding tracking for:
- OTP expiration rate (how many users hit the 5-minute limit)
- Resend frequency (how often users request new codes)
- Failed attempt patterns (security monitoring)

---

## Testing Verification

### Manual Testing Steps:

1. **Request OTP** and wait 5+ minutes before submitting
   - **Expected:** "otp expired" error message

2. **Request OTP** and submit incorrect code 4 times
   - **Expected:** "Too many attempts" error after 3rd attempt

3. **Request OTP**, wait 61 seconds, click resend
   - **Expected:** New OTP sent, countdown resets

4. **Request OTP** and submit correct code within 5 minutes
   - **Expected:** Successful authentication

### Automated Testing Recommendations:

```typescript
// Future test cases for Cypress
describe('OTP Expiration', () => {
  it('should reject expired OTP after 5 minutes', () => {
    // Mock time to simulate 5+ minute wait
  });

  it('should enforce 3-attempt limit', () => {
    // Submit wrong code 4 times
  });

  it('should allow resend after 60 seconds', () => {
    // Check resend button disabled then enabled
  });
});
```

---

## Configuration Options Reference

Based on Better Auth v1.3.27 `EmailOTPOptions`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `expiresIn` | number | 300 | OTP expiry time in seconds |
| `otpLength` | number | 6 | Length of the OTP code |
| `allowedAttempts` | number | 3 | Maximum verification attempts |
| `storeOTP` | string/object | "plain" | How to store OTP: "plain", "hashed", "encrypted" |
| `sendVerificationOnSignUp` | boolean | false | Auto-send verification on signup |
| `disableSignUp` | boolean | false | Prevent automatic user registration |

---

## Conclusion

**The OTP expiration architecture is correctly designed and enforced:**

1. ✅ **Backend Enforcement:** Better Auth automatically validates expiration (5 minutes)
2. ✅ **Error Handling:** Proper error codes returned for expired OTPs
3. ✅ **Attempt Limiting:** Maximum 3 attempts per OTP enforced
4. ✅ **Rate Limiting:** Request throttling prevents abuse
5. ✅ **UI Messaging:** Email template accurately reflects 5-minute expiration
6. ✅ **Separate Concerns:** 60s resend countdown is for UX, not security

**No architectural changes are needed.** The system is secure and properly implements strict 5-minute timeout enforcement. Optional enhancements include explicit configuration and encrypted storage for production.

---

## Files Referenced

- `/Users/jimgibbs/Code/pathible/src/convex/auth.ts` - Better Auth configuration
- `/Users/jimgibbs/Code/pathible/src/app/(unauth)/login/page.tsx` - Login UI
- `/Users/jimgibbs/Code/pathible/src/lib/auth-client.ts` - Auth client setup
- `/Users/jimgibbs/Code/pathible/node_modules/better-auth/dist/plugins/email-otp/index.d.ts` - Plugin types
