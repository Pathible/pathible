# Backblaze B2 Integration Refactor: Convex Actions → Next.js API Routes

## Summary

Successfully refactored the Heritage Vault's Backblaze B2 integration from Convex actions to Next.js API routes, following the correct architecture pattern where:
- **Next.js/Vercel** handles all server-side logic and external service integrations
- **Convex** serves as database-only (queries/mutations for CRUD operations)

## Changes Made

### 1. New Next.js API Routes Created

#### `/src/app/api/vault/upload-url/route.ts`
- **Purpose**: Generate signed B2 upload URLs
- **Authentication**: Verifies Better Auth session via `getServerSession()`
- **Authorization**: Checks household membership via Convex `households.list` query
- **Validation**: Validates file parameters (size, name, type)
- **Response**: Returns B2 upload URL, auth token, and generated file name

#### `/src/app/api/vault/download-url/route.ts`
- **Purpose**: Generate signed B2 download URLs
- **Authentication**: Verifies Better Auth session
- **Authorization**: Uses Convex `vault.get` query (which includes permission checks)
- **Response**: Returns B2 download URL, auth token, and expiration time

#### `/src/app/api/vault/delete/route.ts`
- **Purpose**: Delete files from B2 storage
- **Authentication**: Verifies Better Auth session
- **Authorization**: Checks admin/uploader permissions via Convex queries
- **Action**: Deletes file from B2 (metadata deletion handled separately by Convex)
- **Response**: Returns success/error status

### 2. Frontend Components Updated

#### `/src/app/(auth)/vault/components/upload-button.tsx`
- **Changed**: Removed `useAction(api.vaultActions.generateUploadUrl)`
- **Added**: Fetch call to `/api/vault/upload-url`
- **Flow**: API route → B2 upload → Convex mutation for metadata

#### `/src/app/(auth)/vault/components/document-list.tsx`
- **Changed**: Removed `useAction(api.vaultActions.generateDownloadUrl)`
- **Added**: Fetch call to `/api/vault/download-url`
- **Flow**: API route → B2 download URL → Client download

#### `/src/app/(auth)/vault/components/document-detail-modal.tsx`
- **Changed**: Added B2 deletion via `/api/vault/delete` before Convex mutation
- **Flow**: API route deletes from B2 → Convex mutation removes metadata

### 3. Convex Files Modified

#### `/src/convex/vault.ts`
- **Updated**: Comments to reference new API routes instead of `vaultActions`
- **Lines**: 146, 182, 190, 493-495
- **No logic changes**: All database operations remain unchanged

#### `/src/convex/auth.ts`
- **Removed**: `requireAuthInternal` internal query (no longer needed)
- **Removed**: `requireHouseholdAccessInternal` internal query (no longer needed)
- **Removed**: `getDocumentInternal` internal query (no longer needed)
- **Removed**: `internalQuery` import (no longer used)
- **Added**: Comment explaining removal

### 4. Files to Delete Manually

The following file should be deleted as it's no longer used:
```bash
rm /Users/jimgibbs/Code/pathible/src/convex/vaultActions.ts
```

**Verification**: No code imports found, only documentation references exist.

## Architecture Benefits

### Before (WRONG)
```
Frontend → Convex Actions → Backblaze B2
                ↓
           Convex DB (metadata)
```

### After (CORRECT)
```
Frontend → Next.js API Routes → Backblaze B2
                ↓
           Convex Queries/Mutations (database only)
```

### Key Improvements

1. **Proper Separation of Concerns**
   - Next.js handles external service integrations (B2)
   - Convex focuses solely on database operations
   - No `"use node"` directives in Convex

2. **Better Authentication Flow**
   - API routes use Better Auth sessions directly
   - Convex queries handle authorization checks
   - No complex internal query passing between actions

3. **Simplified Deployment**
   - Backblaze credentials only in Next.js environment
   - Convex doesn't need B2 environment variables
   - Clearer responsibility boundaries

4. **Easier Testing & Debugging**
   - API routes can be tested with standard HTTP tools
   - Convex functions are pure database operations
   - Clearer error handling and logging

## Authentication & Authorization Pattern

All API routes follow this pattern:

```typescript
export async function POST(request: Request) {
  // 1. Verify authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse and validate input
  const body = await request.json();
  // ... validation logic

  // 3. Verify authorization via Convex
  const convexClient = new ConvexHttpClient(convexUrl);
  convexClient.setAuth(request.headers.get("cookie"));
  // ... check permissions via Convex queries

  // 4. Perform B2 operation
  const b2Client = getBackblazeClient();
  // ... B2 API calls

  // 5. Return response
  return NextResponse.json({ ... });
}
```

## Environment Variables

No changes required. Backblaze credentials remain in `.env.local`:
- `BACKBLAZE_KEY_ID`
- `BACKBLAZE_APPLICATION_KEY`
- `BACKBLAZE_BUCKET_ID`
- `BACKBLAZE_BUCKET_NAME`

These are accessed by Next.js API routes via `getBackblazeConfig()`.

## Testing Checklist

- [ ] Upload document: Verify `/api/vault/upload-url` generates valid B2 URL
- [ ] Download document: Verify `/api/vault/download-url` generates valid B2 URL
- [ ] Delete document: Verify `/api/vault/delete` removes file from B2
- [ ] Permission checks: Verify non-members cannot access household documents
- [ ] Error handling: Verify appropriate error messages for auth/permission failures
- [ ] File size limits: Verify 100MB limit is enforced
- [ ] Session handling: Verify authentication works across all endpoints

## Rollback Plan

If issues arise, the old implementation is preserved in git history:
1. Restore `/src/convex/vaultActions.ts`
2. Restore internal queries in `/src/convex/auth.ts`
3. Revert frontend component changes
4. Delete API route files

## Next Steps

1. **Delete old file**: `rm src/convex/vaultActions.ts`
2. **Run tests**: Verify upload/download/delete flows work end-to-end
3. **Update documentation**: Update B2 integration docs to reference new API routes
4. **Monitor**: Check logs for any authentication or permission issues

## Files Modified

### Created (3 files)
- `/src/app/api/vault/upload-url/route.ts`
- `/src/app/api/vault/download-url/route.ts`
- `/src/app/api/vault/delete/route.ts`

### Modified (5 files)
- `/src/app/(auth)/vault/components/upload-button.tsx`
- `/src/app/(auth)/vault/components/document-list.tsx`
- `/src/app/(auth)/vault/components/document-detail-modal.tsx`
- `/src/convex/vault.ts`
- `/src/convex/auth.ts`

### To Delete (1 file)
- `/src/convex/vaultActions.ts`

## Notes

- All Backblaze B2 client code in `/src/lib/backblaze/` remains unchanged and reusable
- Convex schema remains unchanged
- Frontend UI/UX remains identical to users
- No breaking changes to existing documents in the vault
- Migration is transparent - no data migration needed

---

**Refactor completed**: December 6, 2025
**Architecture**: Next.js + Convex + Backblaze B2 (correct pattern)
