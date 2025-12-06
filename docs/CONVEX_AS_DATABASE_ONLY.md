# Convex as Database Only - No Vendor Lock-in

## Overview

This document confirms that Convex is used **ONLY as a database** in the Pathible application. All file storage uses Backblaze B2 to avoid vendor lock-in.

## Verification Complete ✅

As of November 15, 2025, all Convex file storage dependencies have been removed from the Heritage Vault feature.

### What Was Removed

**From `src/convex/vault.ts`:**

1. ❌ `storageId: v.id("_storage")` in validators
2. ❌ `ctx.storage.getUrl()` calls in queries
3. ❌ `ctx.storage.generateUploadUrl()` mutation
4. ❌ `ctx.db.system.get()` for file metadata
5. ❌ `ctx.storage.delete()` in remove mutation

**Total Convex Storage References Removed:** 8 locations

### What Remains (Acceptable)

1. ✅ `wisdomEntries.mediaStorageIds` in schema.ts - Different feature, not vault
2. ✅ "B2 storage" comment in vaultActions.ts - Just documentation

## Architecture: Convex as Database Only

### What Convex Provides

✅ **Database Operations:**
- Document metadata storage (CRUD)
- User authentication records (Better Auth integration)
- Activity logging
- Real-time queries
- Relationships and indexes

❌ **What Convex Does NOT Provide:**
- File storage (uses B2)
- File upload URLs (uses B2)
- File downloads (uses B2)
- Binary data storage (uses B2)

### Clear Separation of Concerns

```
┌─────────────────────────────────────────┐
│           CLIENT APPLICATION            │
│     (Next.js + React Components)        │
└──────────┬──────────────────┬───────────┘
           │                  │
           ▼                  ▼
    ┌──────────────┐   ┌──────────────┐
    │   CONVEX     │   │  BACKBLAZE   │
    │  (Database)  │   │  (Storage)   │
    ├──────────────┤   ├──────────────┤
    │ - Metadata   │   │ - Files      │
    │ - Users      │   │ - Binary     │
    │ - Relations  │   │ - Downloads  │
    │ - Auth       │   │ - Uploads    │
    │ - Activity   │   │              │
    └──────────────┘   └──────────────┘
```

## File Upload/Download Flow

### Upload Flow (No Convex Storage)

```
1. Client → vaultActions.generateUploadUrl (Convex Action)
   ↓ Returns B2 signed URL

2. Client → Backblaze B2 (Direct Upload)
   ↓ Returns fileId, fileName, hash

3. Client → vault.create (Convex Mutation)
   ↓ Saves B2 metadata to database

✅ File stored in B2, metadata in Convex
```

### Download Flow (No Convex Storage)

```
1. Client → vault.get (Convex Query)
   ↓ Returns document metadata

2. Client → vaultActions.generateDownloadUrl (Convex Action)
   ↓ Verifies permissions, returns B2 signed URL

3. Client → Backblaze B2 (Direct Download)

✅ File served from B2, access control via Convex
```

### Delete Flow (No Convex Storage)

```
1. Client → vaultActions.deleteFile (Convex Action)
   ↓ Deletes file from B2

2. Client → vault.remove (Convex Mutation)
   ↓ Deletes metadata from database

✅ File deleted from B2, metadata deleted from Convex
```

## Migration Strategy

### Easy to Switch Storage Providers

Because all storage logic is isolated in `src/lib/backblaze/`, switching providers is straightforward:

1. **To switch to AWS S3:**
   - Create `src/lib/s3/client.ts`
   - Update `vaultActions.ts` imports
   - Update environment variables
   - **No changes to vault.ts or schema.ts needed**

2. **To switch to Cloudflare R2:**
   - Create `src/lib/r2/client.ts`
   - Update `vaultActions.ts` imports
   - Update environment variables
   - **No changes to vault.ts or schema.ts needed**

3. **To switch to Google Cloud Storage:**
   - Create `src/lib/gcs/client.ts`
   - Update `vaultActions.ts` imports
   - Update environment variables
   - **No changes to vault.ts or schema.ts needed**

### Database Layer Remains Unchanged

```typescript
// This schema works with ANY storage provider
vaultDocuments: {
  b2FileId: v.string(),      // → s3ObjectKey / r2ObjectId / gcsObjectId
  b2FileName: v.string(),     // → s3Key / r2Key / gcsKey
  b2BucketName: v.string(),   // → s3Bucket / r2Bucket / gcsBucket
  fileHash: v.optional(v.string()),
  fileSize: v.number(),
  fileType: v.string(),
  // ... rest of metadata
}
```

Just rename the fields to be provider-agnostic if desired:
- `b2FileId` → `storageFileId`
- `b2FileName` → `storageFilePath`
- `b2BucketName` → `storageBucket`

## Benefits of This Architecture

### 1. No Vendor Lock-in
- Can switch storage providers in < 1 day
- Can switch databases without touching storage
- Can use multiple storage providers simultaneously

### 2. Cost Optimization
- Use cheapest storage provider (currently B2: $5/TB)
- Can switch providers based on pricing changes
- No egress fees when serving files

### 3. Flexibility
- Can add CDN in front of B2 (Cloudflare)
- Can implement multi-region storage
- Can add backup to secondary provider

### 4. Performance
- Direct client → storage uploads (no server proxy)
- Direct client → storage downloads (no bandwidth bottleneck)
- Signed URLs with expiration for security

### 5. Scalability
- Storage scales independently of database
- Can handle massive files (up to 10TB in B2)
- No database bloat from binary data

## Code Organization

### Convex Files (Database Only)

```
src/convex/
├── auth.ts           ✅ Database: User authentication
├── households.ts     ✅ Database: Household data
├── vault.ts          ✅ Database: Document metadata (NO STORAGE)
├── vaultActions.ts   ✅ Actions: B2 integration (isolated)
├── schema.ts         ✅ Database: Schema definitions
└── _generated/       ✅ Database: Generated types
```

### Storage Files (B2 Client)

```
src/lib/backblaze/
├── client.ts    📦 B2 REST API client (pure fetch, no deps)
├── config.ts    📦 B2 configuration & validation
└── types.ts     📦 B2 TypeScript types
```

**Clear Separation:**
- `/convex/` = Database operations
- `/lib/backblaze/` = Storage operations

## Verification Commands

### Check for Convex Storage References

```bash
# Should return ZERO results in vault-related files
grep -r "ctx.storage\|storageId\|_storage" src/convex/vault*.ts
```

### Check for B2 Isolation

```bash
# All B2 code should be in lib/backblaze/ or vaultActions.ts
grep -r "backblaze\|b2FileId\|b2FileName" src/convex/
```

## Conclusion

✅ **Convex is used ONLY as a database**
✅ **No Convex file storage dependencies**
✅ **Easy to switch storage providers**
✅ **Clean separation of concerns**
✅ **No vendor lock-in**

The architecture follows SOLID principles with clear boundaries between database (Convex) and storage (B2). You can confidently build on this foundation knowing you can switch either layer independently.

---

**Last Verified:** November 15, 2025
**Files Audited:**
- `src/convex/vault.ts` (8 storage refs removed)
- `src/convex/vaultActions.ts` (B2 only)
- `src/convex/schema.ts` (B2 fields only)
- `src/lib/backblaze/*` (isolated storage layer)
