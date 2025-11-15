# OTP Configuration Examples

This document provides practical examples for configuring the Better Auth email OTP plugin with different security and UX requirements.

---

## Current Configuration (Implicit Defaults)

**File:** `/Users/jimgibbs/Code/pathible/src/convex/auth.ts`

```typescript
emailOTP({
  async sendVerificationOTP({ email, otp, type }) {
    // Email sending logic only
  }
})
```

**Effective Settings:**
- Expiration: 5 minutes (300 seconds)
- OTP Length: 6 digits
- Allowed Attempts: 3
- Storage: Plain text in database

---

## Recommended: Explicit Configuration

### Standard Security (Recommended for Most Applications)

```typescript
import { emailOTP } from "better-auth/plugins";

emailOTP({
  // Security settings
  expiresIn: 300, // 5 minutes (explicit)
  otpLength: 6,
  allowedAttempts: 3,
  storeOTP: "encrypted", // Encrypted storage for production

  // Email sending
  async sendVerificationOTP({ email, otp, type }) {
    const emailFrom = process.env.EMAIL_FROM_ADDRESS || "noreply@pathible.com";
    const emailFromName = process.env.EMAIL_FROM_NAME || "Pathible";

    if (resend) {
      try {
        await resend.emails.send({
          from: `${emailFromName} <${emailFrom}>`,
          to: email,
          subject:
            type === "sign-in"
              ? "Your Pathible Sign-In Code"
              : type === "email-verification"
              ? "Verify Your Pathible Email"
              : "Reset Your Pathible Password",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4B7F52;">Pathible</h1>
              <h2>Your verification code is:</h2>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
                <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p style="color: #666; margin-top: 20px;">
                This code will expire in 5 minutes. You have 3 attempts to enter it correctly.
              </p>
              <p style="color: #999; font-size: 12px;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
          `,
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
  }
})
```

---

## High-Security Configuration

For applications with strict security requirements (financial, healthcare, etc.):

```typescript
emailOTP({
  // Stricter security settings
  expiresIn: 180, // 3 minutes (shorter window)
  otpLength: 8, // 8-digit codes (more combinations)
  allowedAttempts: 3,
  storeOTP: "encrypted", // Always encrypted

  // Optional: Custom OTP generation with additional entropy
  generateOTP: ({ email, type }) => {
    // Generate cryptographically secure random OTP
    const length = 8;
    const chars = '0123456789';
    let otp = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      otp += chars[array[i] % chars.length];
    }
    return otp;
  },

  async sendVerificationOTP({ email, otp, type }) {
    // ... email sending logic with 3-minute expiration message
  }
})
```

---

## Relaxed Configuration (Not Recommended for Production)

For development or low-security scenarios only:

```typescript
emailOTP({
  expiresIn: 600, // 10 minutes (longer for development)
  otpLength: 4, // 4-digit codes (easier for testing)
  allowedAttempts: 5, // More attempts for dev
  storeOTP: "plain", // Plain text for debugging

  async sendVerificationOTP({ email, otp, type }) {
    // Development: just log to console
    console.log(`[DEV] OTP for ${email}: ${otp} (expires in 10 min)`);
  }
})
```

---

## Custom Hashing/Encryption

### Using Custom Hash Function

```typescript
import { hash, compare } from 'bcrypt';

emailOTP({
  expiresIn: 300,
  storeOTP: {
    hash: async (otp: string) => {
      return await hash(otp, 10); // Bcrypt with 10 rounds
    }
  },
  // Note: Better Auth handles comparison automatically
  async sendVerificationOTP({ email, otp, type }) {
    // ... email sending logic
  }
})
```

### Using Custom Encryption

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.OTP_ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

emailOTP({
  expiresIn: 300,
  storeOTP: {
    encrypt: async (otp: string) => {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY),
        iv
      );
      let encrypted = cipher.update(otp);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    },
    decrypt: async (encryptedOTP: string) => {
      const parts = encryptedOTP.split(':');
      const iv = Buffer.from(parts.shift()!, 'hex');
      const encryptedText = Buffer.from(parts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY),
        iv
      );
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    }
  },
  async sendVerificationOTP({ email, otp, type }) {
    // ... email sending logic
  }
})
```

---

## Configuration for Different Use Cases

### 1. Consumer Application (Pathible Current Use Case)

```typescript
emailOTP({
  expiresIn: 300, // 5 minutes - good balance
  otpLength: 6, // Standard
  allowedAttempts: 3,
  storeOTP: "encrypted",
  sendVerificationOnSignUp: false, // Verify after profile setup
})
```

### 2. Enterprise/B2B Application

```typescript
emailOTP({
  expiresIn: 300,
  otpLength: 6,
  allowedAttempts: 3,
  storeOTP: "encrypted",
  sendVerificationOnSignUp: true, // Require verification immediately
  disableSignUp: true, // Admin-controlled user creation only
})
```

### 3. High-Frequency Access Application

```typescript
emailOTP({
  expiresIn: 600, // 10 minutes - reduce friction
  otpLength: 6,
  allowedAttempts: 5, // More forgiving
  storeOTP: "encrypted",
})
```

### 4. Multi-Tenant SaaS

```typescript
emailOTP({
  expiresIn: 300,
  otpLength: 6,
  allowedAttempts: 3,
  storeOTP: "encrypted",

  async sendVerificationOTP({ email, otp, type }, request) {
    // Extract tenant from request headers or subdomain
    const tenant = request?.headers.get('X-Tenant-ID');

    // Use tenant-specific email configuration
    const tenantConfig = await getTenantEmailConfig(tenant);

    // Send email with tenant branding
    await sendEmail({
      from: tenantConfig.fromEmail,
      to: email,
      subject: `${tenantConfig.brandName} - Your Verification Code`,
      html: generateTenantBrandedEmail(otp, tenantConfig),
    });
  }
})
```

---

## Environment-Based Configuration

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

emailOTP({
  // Dynamic configuration based on environment
  expiresIn: isDevelopment ? 600 : 300, // 10 min dev, 5 min prod
  otpLength: isDevelopment ? 4 : 6, // Easier testing in dev
  allowedAttempts: isDevelopment ? 5 : 3,
  storeOTP: isProduction ? "encrypted" : "plain",

  async sendVerificationOTP({ email, otp, type }) {
    if (isDevelopment) {
      // Development: log to console
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    } else {
      // Production: send real email
      await resend.emails.send({
        // ... production email config
      });
    }
  }
})
```

---

## Migration Path

If you want to update your current configuration:

### Step 1: Add Explicit Configuration (No Behavior Change)

```typescript
// This matches current implicit defaults
emailOTP({
  expiresIn: 300,
  otpLength: 6,
  allowedAttempts: 3,
  storeOTP: "plain",
  async sendVerificationOTP({ email, otp, type }) {
    // ... existing code
  }
})
```

### Step 2: Enable Encryption (Recommended)

```typescript
emailOTP({
  expiresIn: 300,
  otpLength: 6,
  allowedAttempts: 3,
  storeOTP: "encrypted", // <-- Only change
  async sendVerificationOTP({ email, otp, type }) {
    // ... existing code
  }
})
```

Note: Changing `storeOTP` will invalidate existing OTPs in the database, but since they expire in 5 minutes anyway, this is safe to deploy.

---

## Testing Configuration Changes

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('OTP Configuration', () => {
  it('should expire OTP after configured time', async () => {
    // Mock Better Auth with custom config
    const auth = createAuth({
      emailOTP: {
        expiresIn: 10, // 10 seconds for testing
      }
    });

    // Send OTP
    await auth.api.sendVerificationOTP({
      email: 'test@example.com',
      type: 'sign-in'
    });

    // Wait 11 seconds
    await new Promise(resolve => setTimeout(resolve, 11000));

    // Attempt to verify
    const result = await auth.api.signInEmailOTP({
      email: 'test@example.com',
      otp: '123456'
    });

    expect(result.error).toBe('otp expired');
  });
});
```

---

## Monitoring and Metrics

Consider tracking these metrics with your configuration:

```typescript
emailOTP({
  expiresIn: 300,
  otpLength: 6,
  allowedAttempts: 3,
  storeOTP: "encrypted",

  async sendVerificationOTP({ email, otp, type }) {
    // Track OTP generation
    await analytics.track('otp_generated', {
      email_domain: email.split('@')[1],
      type,
      timestamp: Date.now(),
    });

    try {
      await resend.emails.send({
        // ... email config
      });

      await analytics.track('otp_sent', {
        email_domain: email.split('@')[1],
        type,
      });
    } catch (error) {
      await analytics.track('otp_send_failed', {
        email_domain: email.split('@')[1],
        type,
        error: error.message,
      });
      throw error;
    }
  }
})
```

Monitor in your verification handler:
- Expiration rate (% of OTPs that expire unused)
- Attempt distribution (how many attempts before success)
- Time to verification (how long users take to enter code)
- Resend frequency (how often users request new codes)

---

## Best Practices Summary

1. **Always use encrypted or hashed storage in production**
2. **Keep expiration time reasonable** (5 minutes is standard)
3. **Limit attempts to prevent brute force** (3-5 attempts)
4. **Use environment-based configuration** for dev vs prod
5. **Monitor OTP metrics** to identify UX issues
6. **Include expiration time in email template**
7. **Implement proper error handling** for expired/invalid OTPs
8. **Test configuration changes thoroughly** before deployment

---

## Additional Resources

- [Better Auth Email OTP Documentation](https://better-auth.com/docs/plugins/email-otp)
- [OWASP Authentication Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
