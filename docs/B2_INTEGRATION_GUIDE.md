# Backblaze B2 Integration Guide

## Overview

The Heritage Vault uses Backblaze B2 for file storage while maintaining metadata and access control in Convex. This hybrid approach provides:

- **Cost-effective storage**: B2 is significantly cheaper than alternatives
- **Large file support**: Up to 2GB per file with multipart upload support
- **Direct uploads**: Files upload directly to B2 (no proxy = faster)
- **Secure access**: Signed URLs with 1-hour expiration
- **Access control**: Enforced by Convex before generating download URLs

## Architecture Decision: Convex Actions with "use node"

We chose **Convex Actions** over Next.js API routes for these reasons:

### Why Convex Actions?
- Unified backend with all business logic in Convex (KISS principle)
- Built-in authentication leveraging existing `requireAuth()` and `requireHouseholdAccess()`
- Full type safety from database to client
- Simpler deployment (no separate API routes to manage)
- Better error handling with Convex's error propagation
- Actions have 10-minute timeout (sufficient for large file operations)

### Trade-offs Considered
- Next.js API routes would allow proxying downloads for additional privacy
- However, B2's signed URLs provide adequate security with 1-hour expiration
- Direct B2 downloads reduce server load and costs

## File Structure

```
/Users/jimgibbs/Code/pathible/
├── src/
│   ├── lib/
│   │   └── backblaze/
│   │       ├── client.ts              # B2 API client with singleton pattern
│   │       ├── config.ts              # Configuration & validation utilities
│   │       └── types.ts               # TypeScript type definitions
│   │
│   ├── convex/
│   │   ├── schema.ts                  # Updated with B2 fields
│   │   ├── vault.ts                   # Existing queries/mutations (updated)
│   │   └── vaultActions.ts            # NEW: B2 upload/download actions
│   │
│   └── app/(auth)/vault/
│       ├── components/
│       │   └── UploadDialog.tsx       # Upload UI component
│       └── page.tsx
│
└── .env.local
    ├── BACKBLAZE_KEY_ID
    ├── BACKBLAZE_APPLICATION_KEY
    ├── BACKBLAZE_BUCKET_ID
    └── BACKBLAZE_BUCKET_NAME
```

## Database Schema Changes

### Updated `vaultDocuments` Table

```typescript
vaultDocuments: defineTable({
  householdId: v.id("households"),
  uploadedBy: v.id("profiles"),
  name: v.string(),
  description: v.optional(v.string()),

  // Backblaze B2 storage references (replaces storageId)
  b2FileId: v.string(),           // Backblaze file ID
  b2FileName: v.string(),         // Full path in bucket
  b2BucketName: v.string(),       // Bucket name

  fileSize: v.number(),            // bytes
  fileType: v.string(),            // MIME type
  fileHash: v.optional(v.string()), // SHA1 hash for integrity

  categories: v.array(v.string()),
  accessLevel: v.union(...),
  sharedWithUsers: v.array(v.id("profiles")),
  updatedAt: v.number(),
})
  .index("by_household", ["householdId"])
  .index("by_uploadedBy", ["uploadedBy"])
  .index("by_household_and_accessLevel", ["householdId", "accessLevel"])
  .index("by_b2FileId", ["b2FileId"]) // NEW: For cleanup operations
```

### Migration Notes

**IMPORTANT**: The schema has breaking changes:
- Removed: `storageId: v.id("_storage")`
- Added: `b2FileId`, `b2FileName`, `b2BucketName`, `fileHash`

You'll need to migrate existing documents or handle backwards compatibility.

## Upload Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 1. Request upload URL
       │ generateUploadUrl({ householdId, fileName, fileType, fileSize })
       ▼
┌─────────────────┐
│ Convex Action   │ "use node"
│ vaultActions.ts │
└──────┬──────────┘
       │ 2. Validate auth & permissions
       │ 3. Generate unique B2 file name
       │ 4. Get B2 upload authorization
       │ 5. Return { uploadUrl, authToken, b2FileName, ... }
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 6. Upload file directly to B2 using fetch()
       │    POST to uploadUrl with file data
       ▼
┌─────────────┐
│ Backblaze   │
│     B2      │
└──────┬──────┘
       │ 7. Returns { fileId, fileName, contentSha1, ... }
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 8. Create document metadata
       │ createDocument({ ...metadata, b2FileId, b2FileName, fileHash })
       ▼
┌─────────────────┐
│ Convex Mutation │
│    vault.ts     │
└──────┬──────────┘
       │ 9. Save metadata to Convex
       │ 10. Log activity
       ▼
┌─────────────┐
│  Database   │
└─────────────┘
```

## Download Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Request download URL
       │ generateDownloadUrl({ documentId })
       ▼
┌─────────────────┐
│ Convex Action   │
│ vaultActions.ts │
└──────┬──────────┘
       │ 2. Verify document access permissions
       │ 3. Generate signed B2 URL (expires in 1 hour)
       │ 4. Return { url, expiresIn: 3600 }
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 5. Download file from B2 using signed URL
       │    (or open in new tab)
       ▼
┌─────────────┐
│ Backblaze   │
│     B2      │
└─────────────┘
```

## Security Model

### Access Control Layers

1. **Household Membership** (First Layer)
   - User must be an active member of the household
   - Verified via `requireHouseholdAccess()`

2. **Document-Level Access** (Second Layer)
   - `household`: All household members can access
   - `admins`: Only owners and stewards can access
   - `custom`: Only specified users + uploader can access

3. **Signed URLs** (Third Layer)
   - B2 download URLs include authorization token
   - URLs expire after 1 hour
   - Cannot be reused after expiration

### File Naming Convention

Files are stored with structured names to prevent collisions:

```
household_<householdId>/<timestamp>_<uuid>_<sanitized-filename>

Example:
household_j57abc123/1699472831000_a1b2c3d4_estate_planning.pdf
```

Benefits:
- Logical organization by household
- No filename collisions (timestamp + UUID)
- Human-readable filenames preserved

## Environment Variables

Add to `.env.local`:

```bash
# Backblaze B2 Configuration
BACKBLAZE_KEY_ID=your_key_id_here
BACKBLAZE_APPLICATION_KEY=your_application_key_here
BACKBLAZE_BUCKET_ID=your_bucket_id_here
BACKBLAZE_BUCKET_NAME=your_bucket_name_here
```

### How to Get These Values

1. **Create B2 Account**: https://www.backblaze.com/b2/sign-up.html
2. **Create a Bucket**:
   - Go to "Buckets" in B2 dashboard
   - Click "Create a Bucket"
   - Name: `pathible-vault-prod` (or similar)
   - Files: **Private** (important!)
   - Lifecycle: Default
3. **Create Application Key**:
   - Go to "App Keys"
   - Click "Add a New Application Key"
   - Name: `pathible-vault-app-key`
   - Bucket Access: Select your vault bucket
   - Permissions: Read and Write
   - Save the `keyID` and `applicationKey` (shown only once!)

## API Reference

### Convex Actions

#### `generateUploadUrl`

Request an upload URL for a new file.

```typescript
const uploadData = await vaultActions.generateUploadUrl({
  householdId: "j57abc123",
  fileName: "estate-plan.pdf",
  fileType: "application/pdf",
  fileSize: 1024000, // bytes
});

// Returns:
{
  uploadUrl: "https://...",
  authorizationToken: "...",
  b2FileName: "household_j57abc123/1699472831000_a1b2c3d4_estate-plan.pdf",
  bucketId: "...",
  bucketName: "pathible-vault-prod"
}
```

#### `generateDownloadUrl`

Generate a signed download URL for a document.

```typescript
const downloadData = await vaultActions.generateDownloadUrl({
  documentId: "k123abc456",
});

// Returns:
{
  url: "https://...?Authorization=...",
  expiresIn: 3600 // seconds
}
```

#### `deleteFile`

Delete a file from B2 (called internally by `vault.remove`).

```typescript
await vaultActions.deleteFile({
  documentId: "k123abc456",
});
```

### Convex Mutations (Updated)

#### `vault.create`

Create document metadata after uploading to B2.

```typescript
const documentId = await vault.create({
  householdId: "j57abc123",
  name: "Estate Planning Document",
  description: "Updated will and testament",
  b2FileId: "4_...",
  b2FileName: "household_j57abc123/...",
  b2BucketName: "pathible-vault-prod",
  fileSize: 1024000,
  fileType: "application/pdf",
  fileHash: "abc123...", // SHA1 from B2 upload response
  categories: ["Legal", "Estate Planning"],
  accessLevel: "admins",
});
```

## Client-Side Upload Example

```typescript
// 1. Get upload URL from Convex
const uploadData = await convex.action(api.vaultActions.generateUploadUrl, {
  householdId,
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size,
});

// 2. Upload file directly to B2
const response = await fetch(uploadData.uploadUrl, {
  method: "POST",
  headers: {
    Authorization: uploadData.authorizationToken,
    "Content-Type": file.type,
    "X-Bz-File-Name": encodeURIComponent(uploadData.b2FileName),
    "X-Bz-Content-Sha1": "do_not_verify", // Or calculate SHA1
  },
  body: file,
});

if (!response.ok) {
  throw new Error("Upload failed");
}

const b2Response = await response.json();

// 3. Save metadata to Convex
const documentId = await convex.mutation(api.vault.create, {
  householdId,
  name: file.name,
  b2FileId: b2Response.fileId,
  b2FileName: uploadData.b2FileName,
  b2BucketName: uploadData.bucketName,
  fileSize: file.size,
  fileType: file.type,
  fileHash: b2Response.contentSha1,
  categories: selectedCategories,
  accessLevel: "household",
});
```

## File Size Limits

- **Maximum file size**: 2GB (enforced in validation)
- **Large file upload**: B2 automatically handles large files (no multipart needed for single uploads under 5GB)
- **Multipart upload**: B2 supports multipart for files > 100MB (not implemented in v1, YAGNI)

## Error Handling

### Common Errors

1. **Missing Environment Variables**
   - Error: "BACKBLAZE_KEY_ID environment variable is not set"
   - Fix: Add B2 credentials to `.env.local`

2. **File Too Large**
   - Error: "File size exceeds maximum allowed size of 2GB"
   - Fix: Reduce file size or split into multiple files

3. **Authorization Failed**
   - Error: "B2 authorization failed: ..."
   - Fix: Check B2 credentials and bucket permissions

4. **Access Denied**
   - Error: "Access denied: You do not have permission to view this document"
   - Fix: User doesn't have required household role or document access

## Performance Considerations

### Upload Performance
- Direct uploads to B2 bypass Next.js/Convex (no bandwidth limits)
- B2 has good CDN distribution (Cloudflare integration available)
- No timeout issues (client handles upload directly)

### Download Performance
- Signed URLs are cached by B2's CDN
- 1-hour expiration reduces URL regeneration overhead
- Consider implementing client-side URL caching for frequently accessed files

### Token Caching
- `BackblazeClient` caches authorization tokens for 22 hours
- Singleton pattern ensures token reuse across requests
- Reduces API calls to B2 authorization endpoint

## Cost Estimation

### Backblaze B2 Pricing (as of 2024)
- **Storage**: $0.005/GB/month ($5 per TB)
- **Download**: $0.01/GB (first 1GB free per day)
- **API Calls**: First 2,500 free per day, then minimal cost

### Example: 100 Households
- Average 50 documents @ 5MB each = 250MB per household
- Total storage: 25GB = $0.125/month
- Download (assume 10% accessed daily): 2.5GB = $0.025/day = $0.75/month
- **Total: ~$0.88/month for 100 households**

Compare to alternatives:
- AWS S3: ~$2.30/month (same usage)
- Convex Storage: Limited free tier, then $0.20/GB = $5/month

## Migration from Convex Storage

If you have existing documents in Convex storage:

### Option 1: Migrate All at Once

```typescript
// Migration script (run once)
import { BackblazeClient } from "@/lib/backblaze/client";

async function migrateDocument(doc) {
  // 1. Download from Convex
  const fileData = await ctx.storage.get(doc.storageId);

  // 2. Upload to B2
  const b2Client = new BackblazeClient();
  const uploadData = await b2Client.getUploadUrl();
  const b2Response = await b2Client.uploadFile(
    uploadData.uploadUrl,
    uploadData.authorizationToken,
    generateB2FileName(doc.householdId, doc.name),
    fileData,
    doc.fileType
  );

  // 3. Update document record
  await ctx.db.patch(doc._id, {
    b2FileId: b2Response.fileId,
    b2FileName: b2Response.fileName,
    b2BucketName: b2Client.getBucketName(),
    fileHash: b2Response.contentSha1,
  });

  // 4. Delete from Convex storage
  await ctx.storage.delete(doc.storageId);
}
```

### Option 2: Lazy Migration

Add backwards compatibility to handle both storage types:

```typescript
// In vault.ts queries
const url = document.b2FileName
  ? await generateB2DownloadUrl(document.b2FileName)
  : await ctx.storage.getUrl(document.storageId);
```

Migrate documents on-demand when accessed.

## Testing Checklist

- [ ] Upload small file (< 1MB)
- [ ] Upload large file (> 100MB)
- [ ] Upload file at 2GB limit
- [ ] Download file with household access
- [ ] Download file with admin access
- [ ] Download file with custom access
- [ ] Verify access denied for non-members
- [ ] Verify URL expiration after 1 hour
- [ ] Delete file and verify B2 deletion
- [ ] Test with missing B2 credentials
- [ ] Test with invalid B2 credentials
- [ ] Test file name collision prevention
- [ ] Test file integrity with SHA1 hash

## Troubleshooting

### Issue: "Failed to get upload URL"

**Cause**: B2 authorization failed or bucket not found

**Solutions**:
1. Verify B2 credentials in `.env.local`
2. Check bucket exists and is private
3. Verify app key has read/write permissions
4. Check B2 account is active and not suspended

### Issue: "Upload failed with 401 Unauthorized"

**Cause**: Upload authorization token expired or invalid

**Solutions**:
1. Ensure using authorization token from `generateUploadUrl` response
2. Check token hasn't expired (valid for 24 hours)
3. Verify file name matches exactly (URL encoding)

### Issue: "Download URL returns 404"

**Cause**: File not found in B2 or incorrect file name

**Solutions**:
1. Verify `b2FileName` in database matches actual B2 file name
2. Check file wasn't deleted from B2
3. Verify bucket name is correct
4. Check B2 dashboard for file existence

### Issue: "Access denied when downloading"

**Cause**: User doesn't have required permissions

**Solutions**:
1. Verify user is household member
2. Check document's `accessLevel` setting
3. If `custom` access, verify user in `sharedWithUsers` array
4. Check household membership is `active` status

## Future Enhancements (YAGNI - Not Implemented Yet)

These features can be added later if needed:

1. **Multipart Upload** for files > 5GB
2. **Upload Progress Tracking** with B2's progress API
3. **Thumbnail Generation** for images/PDFs
4. **File Versioning** to track document changes
5. **Batch Operations** for bulk uploads/downloads
6. **CDN Integration** with Cloudflare for faster downloads
7. **Lifecycle Policies** for automatic archival
8. **Server-Side Encryption** with customer-provided keys

## Support

For issues or questions:
- B2 Documentation: https://www.backblaze.com/b2/docs/
- Convex Actions: https://docs.convex.dev/functions/actions
- Internal: Check `src/lib/backblaze/` for implementation details
