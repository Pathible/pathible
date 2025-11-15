# Resend Email Configuration

This guide walks through setting up Resend for OTP email delivery in Pathible.

## Prerequisites

- Resend account (sign up at https://resend.com)
- A domain you own (for production) or use Resend's test domain (for development)

## Setup Steps

### 1. Create Resend Account

1. Go to https://resend.com and sign up
2. Verify your email address

### 2. Get API Key

1. Navigate to API Keys in the Resend dashboard
2. Click "Create API Key"
3. Name it "Pathible Production" or "Pathible Development"
4. Select permission: "Sending access"
5. Copy the API key (starts with `re_`)

### 3. Configure Domain (Production Only)

For production, you need to verify your domain:

1. Go to Domains in the Resend dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `pathible.com`)
4. Add the provided DNS records to your domain registrar:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
5. Wait for verification (usually takes a few minutes)

For development, you can skip this and use Resend's test domain.

### 4. Update Environment Variables

Add to your `.env.local` file:

```bash
# Resend API Key (Required)
RESEND_API_KEY=re_your_actual_api_key_here

# Email Configuration
EMAIL_FROM_ADDRESS=noreply@pathible.com
EMAIL_FROM_NAME=Pathible
```

**Important**:
- For development, use test address: `onboarding@resend.dev`
- For production, use your verified domain address

### 5. Test Email Sending

Start your development server:

```bash
pnpm dev
```

The OTP system will automatically use Resend when `RESEND_API_KEY` is configured.

## Development Testing

Without `RESEND_API_KEY`:
- OTPs are printed to the console
- No emails are actually sent
- Perfect for local development

With `RESEND_API_KEY` (using test domain):
- Emails sent to `delivered@resend.dev` will show in Resend dashboard
- Other addresses won't receive emails (test mode)
- Good for staging/testing

## Production Deployment

1. ✅ Verify your domain in Resend
2. ✅ Set `EMAIL_FROM_ADDRESS` to your verified domain
3. ✅ Add `RESEND_API_KEY` to production environment variables
4. ✅ Test with a real email address
5. ✅ Monitor Resend dashboard for delivery status

## Troubleshooting

### Emails not sending

1. Check console for error messages
2. Verify `RESEND_API_KEY` is set correctly
3. Confirm sender domain is verified in Resend
4. Check Resend dashboard for failed deliveries

### Domain verification issues

1. Double-check DNS records match exactly
2. Wait 24-48 hours for DNS propagation
3. Use Resend's verification checker tool
4. Contact Resend support if issues persist

### Rate limiting

Resend free tier limits:
- 100 emails per day
- 3,000 emails per month

Upgrade to paid plan for production use.

## Email Template Customization

Email templates are located in `src/lib/email-templates/`:
- `otp-sign-in.ts` - Sign in OTP emails
- `otp-email-verification.ts` - Email verification OTP emails
- `otp-password-reset.ts` - Password reset OTP emails

Customize HTML/CSS styling to match your brand.

## Support

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- Pathible Issues: GitHub issues
