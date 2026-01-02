# Clerk Webhook Migration Guide

This guide covers migrating from the Next.js API route webhook handler to the Convex HTTP endpoint.

## Why This Change?

- **Direct path**: Clerk → Convex (instead of Clerk → Next.js → Convex)
- **Better security**: Uses `internal.*` mutations that can only be called from within Convex
- **Single source of truth**: All business logic lives in Convex

## Prerequisites

- Access to [Clerk Dashboard](https://dashboard.clerk.com)
- Access to Convex CLI (`npx convex`)
- The `CLERK_WEBHOOK_SECRET` from your current webhook configuration

---

## Step 1: Set Environment Variable in Convex

The webhook secret must be available in the Convex runtime.

```bash
# Set the webhook secret in Convex
npx convex env set CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Verify it's set:

```bash
npx convex env list
```

You should see `CLERK_WEBHOOK_SECRET` in the output.

> **Note**: You can find your current webhook secret in Clerk Dashboard → Webhooks → [Your Webhook] → Signing Secret

---

## Step 2: Update Webhook URL in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** in the left sidebar
3. Click on your existing webhook (or create a new one)
4. Update the **Endpoint URL**:

| Environment | Old URL (Next.js) | New URL (Convex) |
|-------------|-------------------|------------------|
| Production | `https://pathible.com/api/webhooks/clerk` | `https://quaint-loris-658.convex.site/clerk-webhook` |
| Development | `https://[ngrok-url]/api/webhooks/clerk` | `https://quaint-loris-658.convex.site/clerk-webhook` |

> **Tip**: The Convex site URL follows the pattern `https://[deployment-name].convex.site`

---

## Step 3: Verify Webhook Events

Ensure these events are selected in Clerk Dashboard → Webhooks → Events:

- [x] `user.updated`
- [x] `subscription.created` (if using Clerk Billing)
- [x] `subscription.updated` (if using Clerk Billing)

---

## Step 4: Test the Webhook

### Option A: Use Clerk's Test Feature

1. In Clerk Dashboard → Webhooks → [Your Webhook]
2. Click **"Send test webhook"** or similar
3. Select an event type (e.g., `user.updated`)
4. Send the test

### Option B: Trigger a Real Event

1. Update a user's metadata in Clerk Dashboard
2. Or make a subscription change

### Verify in Convex Logs

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to **Logs**
3. Look for entries containing `[Clerk Webhook]`:
   - `[Clerk Webhook] Processing event: user.updated`
   - `[Clerk Webhook] Synced subscription for user: user_xxx`

---

## Troubleshooting

### "Webhook secret not configured" (500 error)

The `CLERK_WEBHOOK_SECRET` is not set in Convex.

```bash
npx convex env set CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### "Missing svix headers" (400 error)

The request is not coming from Clerk. Verify the webhook URL is correct in Clerk Dashboard.

### "Webhook verification failed" (400 error)

The signing secret doesn't match. Ensure:
1. You copied the full secret including the `whsec_` prefix
2. The secret in Convex matches the one in Clerk Dashboard

### "Timestamp too old or in future"

The webhook request took too long to reach Convex (>5 minutes). This usually indicates network issues. Clerk will retry automatically.

---

## Rollback Plan

If you need to revert to the Next.js route:

1. Update Clerk webhook URL back to: `https://pathible.com/api/webhooks/clerk`
2. Ensure `CLERK_WEBHOOK_SECRET` is set in Vercel environment variables
3. The Next.js route (`src/app/api/webhooks/clerk/route.ts`) will forward to Convex

> **Note**: The current Next.js route acts as a proxy to Convex, so both approaches ultimately use the Convex logic.

---

## Architecture Reference

### Before (Next.js Route)

```
Clerk Webhook
     ↓
Next.js API Route (/api/webhooks/clerk)
     ↓
ConvexHttpClient
     ↓
api.subscriptions.syncFromClerk (public mutation)
```

### After (Convex HTTP)

```
Clerk Webhook
     ↓
Convex HTTP Endpoint (/clerk-webhook)
     ↓
internal.subscriptions.syncFromClerk (internal mutation)
```

---

## Checklist

- [ ] Set `CLERK_WEBHOOK_SECRET` in Convex environment
- [ ] Update webhook URL in Clerk Dashboard
- [ ] Verify correct events are selected
- [ ] Send test webhook
- [ ] Check Convex logs for successful processing
- [ ] Verify subscription data syncs to households table
