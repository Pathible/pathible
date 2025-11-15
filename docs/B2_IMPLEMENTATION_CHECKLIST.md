# Backblaze B2 Implementation Checklist

This checklist will guide you through implementing the B2 integration step by step.

## Prerequisites

- [ ] Backblaze B2 account created (https://www.backblaze.com/b2/sign-up.html)
- [ ] Private bucket created (e.g., `pathible-vault-prod`)
- [ ] Application key created with read/write permissions
- [ ] Environment variables ready to add

## Phase 1: Backend Setup

### Step 1: Environment Configuration
- [ ] Add B2 credentials to `.env.local`:
  ```bash
  BACKBLAZE_KEY_ID=your_key_id_here
  BACKBLAZE_APPLICATION_KEY=your_application_key_here
  BACKBLAZE_BUCKET_ID=your_bucket_id_here
  BACKBLAZE_BUCKET_NAME=your_bucket_name_here
  ```
- [ ] Verify credentials work by running a test authorization

### Step 2: Install Dependencies (if needed)
```bash
# No new dependencies needed - using native fetch and crypto
```

### Step 3: Update Convex Schema
- [✅] Schema already updated with B2 fields
- [ ] Run `pnpm generate` to regenerate Convex types
- [ ] Verify no TypeScript errors in Convex functions

### Step 4: Test Backblaze Client
Create a test script to verify B2 connection:

```typescript
// test-b2.ts (temporary file)
import { getBackblazeClient } from "./src/lib/backblaze/client";

async function testB2() {
  try {
    const client = getBackblazeClient();
    const uploadUrl = await client.getUploadUrl();
    console.log("✅ B2 connection successful!");
    console.log("Upload URL:", uploadUrl.uploadUrl);
  } catch (error) {
    console.error("❌ B2 connection failed:", error);
  }
}

testB2();
```

- [ ] Run test script: `npx tsx test-b2.ts`
- [ ] Verify successful connection
- [ ] Delete test script

## Phase 2: Update Vault Mutations

### Step 5: Update vault.create Mutation

**File**: `/Users/jimgibbs/Code/pathible/src/convex/vault.ts`

**Changes needed in `create` mutation**:

1. Update args validator:
```typescript
args: {
  householdId: v.id("households"),
  name: v.string(),
  description: v.optional(v.string()),
  // OLD: storageId: v.id("_storage"),
  // NEW:
  b2FileId: v.string(),
  b2FileName: v.string(),
  b2BucketName: v.string(),
  fileSize: v.number(),
  fileType: v.string(),
  fileHash: v.optional(v.string()),
  categories: v.array(v.string()),
  accessLevel: accessLevelValidator,
  sharedWithUsers: v.optional(v.array(v.id("profiles"))),
},
```

2. Remove file metadata fetch from storage:
```typescript
// REMOVE:
const fileMetadata = await ctx.db.system.get(args.storageId);
if (!fileMetadata) {
  throw new Error("File not found in storage");
}
```

3. Update insert statement:
```typescript
const documentId = await ctx.db.insert("vaultDocuments", {
  householdId: args.householdId,
  uploadedBy: profile._id,
  name: args.name.trim(),
  description: args.description?.trim(),
  // NEW:
  b2FileId: args.b2FileId,
  b2FileName: args.b2FileName,
  b2BucketName: args.b2BucketName,
  fileSize: args.fileSize,
  fileType: args.fileType,
  fileHash: args.fileHash,
  // ... rest remains same
  categories: args.categories,
  accessLevel: args.accessLevel,
  sharedWithUsers,
  updatedAt: Date.now(),
});
```

- [ ] Update `create` mutation args
- [ ] Remove storage metadata fetch
- [ ] Update insert statement
- [ ] Test mutation with dummy data

### Step 6: Update vault.list Query

**File**: `/Users/jimgibbs/Code/pathible/src/convex/vault.ts`

**Changes in return type and handler**:

1. Update return validator:
```typescript
const documentReturnValidator = v.object({
  _id: v.id("vaultDocuments"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  uploadedBy: v.id("profiles"),
  uploaderName: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  // OLD: storageId: v.id("_storage"),
  // NEW:
  b2FileId: v.string(),
  b2FileName: v.string(),
  b2BucketName: v.string(),
  fileHash: v.optional(v.string()),
  fileSize: v.number(),
  fileType: v.string(),
  categories: v.array(v.string()),
  accessLevel: accessLevelValidator,
  sharedWithUsers: v.array(v.id("profiles")),
  updatedAt: v.number(),
  url: v.union(v.string(), v.null()),
});
```

2. Update URL generation:
```typescript
// OLD:
const docsWithDetails = await Promise.all(
  filteredDocs.map(async (doc) => ({
    ...doc,
    uploaderName: await getUploaderName(ctx, doc.uploadedBy),
    url: await ctx.storage.getUrl(doc.storageId), // OLD
  }))
);

// NEW:
const docsWithDetails = filteredDocs.map((doc) => ({
  ...doc,
  uploaderName: await getUploaderName(ctx, doc.uploadedBy),
  url: null, // Will be generated on-demand via generateDownloadUrl action
}));
```

- [ ] Update return validator
- [ ] Update URL generation logic
- [ ] Test query returns correct data

### Step 7: Update vault.get Query

Similar changes as `vault.list`:

- [ ] Update return validator
- [ ] Change URL generation to return `null` or call action
- [ ] Test query works

### Step 8: Update vault.remove Mutation

**File**: `/Users/jimgibbs/Code/pathible/src/convex/vault.ts`

**Changes needed**:

1. Replace storage deletion with B2 action call:
```typescript
// OLD:
await ctx.storage.delete(document.storageId);

// NEW:
await ctx.runAction(api.vaultActions.deleteFile, {
  documentId: args.documentId,
});
```

2. Note: The action will handle permission checks, so we need to pass them through:
```typescript
// Actually, keep permission checks in mutation, action just deletes from B2
// The action re-validates for security, but mutation orchestrates
```

Better approach - keep permission checks in mutation, make action simpler:

```typescript
export const remove = mutation({
  args: {
    documentId: v.id("vaultDocuments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    const membership = await requireHouseholdAccess(ctx, document.householdId);
    const { profile } = await requireAuth(ctx);

    // Only admins or the uploader can delete
    const isAdmin = membership.role === "owner" || membership.role === "steward";
    const isUploader = document.uploadedBy === profile._id;

    if (!isAdmin && !isUploader) {
      throw new Error("Access denied: You do not have permission to delete this document");
    }

    // Delete from B2 (action handles B2 deletion)
    await ctx.scheduler.runAfter(0, api.vaultActions.deleteFile, {
      b2FileId: document.b2FileId,
      b2FileName: document.b2FileName,
    });

    // Delete the document record immediately
    await ctx.db.delete(args.documentId);

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: document.householdId,
      userId: profile._id,
      actionType: "document_deleted",
      entityType: "document",
      entityId: args.documentId,
      description: `Deleted document: ${document.name}`,
    });

    return null;
  },
});
```

And update the action:

```typescript
export const deleteFile = action({
  args: {
    b2FileId: v.string(),
    b2FileName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Delete from B2 (no permission checks - already done in mutation)
    const b2Client = getBackblazeClient();
    await b2Client.deleteFile(args.b2FileName, args.b2FileId);
    return null;
  },
});
```

- [ ] Update `remove` mutation
- [ ] Update `deleteFile` action
- [ ] Test deletion flow

### Step 9: Remove old generateUploadUrl Mutation

**File**: `/Users/jimgibbs/Code/pathible/src/convex/vault.ts`

- [ ] Comment out or remove old `generateUploadUrl` mutation
- [ ] It's replaced by `vaultActions.generateUploadUrl` action

## Phase 3: Frontend Updates

### Step 10: Update Upload Component

**File**: Find your upload component (likely in `/Users/jimgibbs/Code/pathible/src/app/(auth)/vault/components/`)

**Changes needed**:

1. Update imports:
```typescript
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
```

2. Replace upload logic:
```typescript
// OLD:
const generateUploadUrl = useMutation(api.vault.generateUploadUrl);
const createDocument = useMutation(api.vault.create);

async function handleUpload(file: File) {
  // 1. Get upload URL from Convex
  const uploadUrl = await generateUploadUrl({ householdId });

  // 2. Upload to Convex storage
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: file,
  });
  const { storageId } = await response.json();

  // 3. Create document
  await createDocument({
    householdId,
    name: file.name,
    storageId,
    // ...
  });
}

// NEW:
const generateUploadUrl = useAction(api.vaultActions.generateUploadUrl);
const createDocument = useMutation(api.vault.create);

async function handleUpload(file: File) {
  // 1. Get B2 upload URL
  const uploadData = await generateUploadUrl({
    householdId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  // 2. Upload directly to B2
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
  await createDocument({
    householdId,
    name: file.name,
    description: description || undefined,
    b2FileId: b2Response.fileId,
    b2FileName: uploadData.b2FileName,
    b2BucketName: uploadData.bucketName,
    fileSize: file.size,
    fileType: file.type,
    fileHash: b2Response.contentSha1,
    categories: selectedCategories,
    accessLevel: accessLevel,
    sharedWithUsers: sharedUsers,
  });
}
```

- [ ] Update import statements
- [ ] Replace upload logic
- [ ] Add error handling
- [ ] Add upload progress (optional)
- [ ] Test upload with various file sizes

### Step 11: Update Download Component

**File**: Find your download/view component

**Changes needed**:

1. Add download action:
```typescript
const generateDownloadUrl = useAction(api.vaultActions.generateDownloadUrl);

async function handleDownload(documentId: string) {
  try {
    const { url } = await generateDownloadUrl({ documentId });

    // Option 1: Open in new tab
    window.open(url, "_blank");

    // Option 2: Trigger download
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = document.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Download failed:", error);
    // Show error to user
  }
}
```

- [ ] Add download action hook
- [ ] Implement download handler
- [ ] Test download flow
- [ ] Test with different file types

### Step 12: Remove URL from Document List

Since URLs are now generated on-demand:

```typescript
// OLD:
<a href={document.url} download>Download</a>

// NEW:
<button onClick={() => handleDownload(document._id)}>Download</button>
```

- [ ] Update document list component
- [ ] Remove dependency on `url` field
- [ ] Update any preview components

## Phase 4: Testing

### Step 13: Manual Testing

**Upload Tests**:
- [ ] Upload small file (< 1MB)
- [ ] Upload medium file (10-50MB)
- [ ] Upload large file (100MB+)
- [ ] Upload file near 2GB limit
- [ ] Upload with special characters in filename
- [ ] Upload same filename twice (should get unique B2 names)

**Download Tests**:
- [ ] Download as household member
- [ ] Download as admin
- [ ] Download with custom access (shared)
- [ ] Attempt download without access (should fail)
- [ ] Download after URL expiry (should regenerate)

**Delete Tests**:
- [ ] Delete own document
- [ ] Delete as admin
- [ ] Attempt delete without permission (should fail)
- [ ] Verify file removed from B2 dashboard

**Access Control Tests**:
- [ ] Create document with "household" access
- [ ] Create document with "admins" access
- [ ] Create document with "custom" access
- [ ] Verify viewer can't access "admins" document
- [ ] Verify custom user can access shared document

### Step 14: Error Testing

- [ ] Test with invalid B2 credentials
- [ ] Test with missing environment variables
- [ ] Test upload failure (network disconnect)
- [ ] Test download failure (invalid document ID)
- [ ] Test file size validation (> 2GB)
- [ ] Test unauthorized access attempts

### Step 15: Performance Testing

- [ ] Upload 10 files in parallel
- [ ] List 100+ documents
- [ ] Download 5 files simultaneously
- [ ] Check B2 dashboard for uploaded files
- [ ] Verify file organization by household

## Phase 5: Deployment

### Step 16: Environment Variables in Production

**Vercel**:
- [ ] Add B2 environment variables to Vercel project settings
- [ ] Redeploy application
- [ ] Verify environment variables are set

**Convex**:
- [ ] Push Convex schema: `pnpm convex deploy`
- [ ] Verify functions deployed successfully

### Step 17: Production Testing

- [ ] Test upload in production
- [ ] Test download in production
- [ ] Test delete in production
- [ ] Verify B2 bucket shows production files
- [ ] Check Convex dashboard for successful function calls

### Step 18: Monitoring Setup

- [ ] Set up B2 usage alerts (storage, bandwidth)
- [ ] Monitor Convex function logs
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Create dashboard for B2 costs

## Phase 6: Migration (If Existing Data)

### Step 19: Migrate Existing Documents

If you have existing documents in Convex storage:

**Option A: All at Once**
```typescript
// migration.ts - Run once as Convex function
import { internalMutation } from "./_generated/server";
import { getBackblazeClient } from "../lib/backblaze/client";

export const migrateToB2 = internalMutation({
  handler: async (ctx) => {
    const documents = await ctx.db.query("vaultDocuments").collect();

    for (const doc of documents) {
      if (doc.storageId && !doc.b2FileId) {
        try {
          // Download from Convex
          const fileData = await ctx.storage.get(doc.storageId);
          if (!fileData) continue;

          // Upload to B2
          const b2Client = getBackblazeClient();
          const uploadData = await b2Client.getUploadUrl();
          const b2FileName = generateB2FileName(doc.householdId, doc.name);
          const buffer = await fileData.arrayBuffer();

          const b2Response = await b2Client.uploadFile(
            uploadData.uploadUrl,
            uploadData.authorizationToken,
            b2FileName,
            Buffer.from(buffer),
            doc.fileType
          );

          // Update document
          await ctx.db.patch(doc._id, {
            b2FileId: b2Response.fileId,
            b2FileName: b2Response.fileName,
            b2BucketName: b2Client.getBucketName(),
            fileHash: b2Response.contentSha1,
          });

          // Delete from Convex storage
          await ctx.storage.delete(doc.storageId);

          console.log(`Migrated: ${doc.name}`);
        } catch (error) {
          console.error(`Failed to migrate ${doc.name}:`, error);
        }
      }
    }
  },
});
```

**Option B: Lazy Migration**
Add backwards compatibility in queries:
```typescript
// In vault.list or vault.get
const url = document.b2FileName
  ? null // Will use generateDownloadUrl action
  : await ctx.storage.getUrl(document.storageId); // Fallback to old system
```

- [ ] Choose migration strategy
- [ ] If Option A: Create and run migration function
- [ ] If Option B: Add backwards compatibility
- [ ] Verify all documents accessible
- [ ] Monitor for migration errors

### Step 20: Schema Cleanup (After Migration)

Once all documents migrated:
- [ ] Remove `storageId` field from schema (breaking change!)
- [ ] Remove backwards compatibility code
- [ ] Run `pnpm generate` to update types

## Phase 7: Documentation

### Step 21: Update Internal Documentation

- [ ] Document B2 setup process for team
- [ ] Add B2 credentials to password manager
- [ ] Update deployment checklist
- [ ] Document common troubleshooting steps

### Step 22: Update User-Facing Documentation

- [ ] Update help docs with new upload process
- [ ] Add supported file types and size limits
- [ ] Document access level options
- [ ] Add FAQ for common errors

## Phase 8: Optimization (Optional)

### Step 23: Add Upload Progress

```typescript
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener("progress", (e) => {
  if (e.lengthComputable) {
    const percentComplete = (e.loaded / e.total) * 100;
    setUploadProgress(percentComplete);
  }
});
xhr.open("POST", uploadData.uploadUrl);
// ... set headers and send
```

- [ ] Implement upload progress bar
- [ ] Add cancellation support
- [ ] Show estimated time remaining

### Step 24: Add Download Progress

Similar to upload progress:
- [ ] Implement download progress
- [ ] Show file size and estimated time
- [ ] Add cancel button

### Step 25: Add Thumbnail Generation

For images and PDFs:
- [ ] Generate thumbnails on upload
- [ ] Store thumbnail URL in document metadata
- [ ] Display thumbnails in document list

### Step 26: Implement Caching

- [ ] Cache download URLs client-side (< 1 hour)
- [ ] Cache document list for performance
- [ ] Implement optimistic updates

## Completion Checklist

### Backend
- [ ] ✅ B2 client implemented
- [ ] ✅ Schema updated with B2 fields
- [ ] ✅ Actions created (upload, download, delete)
- [ ] Mutations updated to use B2
- [ ] Queries updated to remove storage references
- [ ] All Convex functions tested

### Frontend
- [ ] Upload component updated
- [ ] Download component updated
- [ ] Delete component updated
- [ ] Error handling implemented
- [ ] User feedback added (toasts, progress)

### Testing
- [ ] Manual testing complete
- [ ] Error scenarios tested
- [ ] Access control tested
- [ ] Performance verified

### Deployment
- [ ] Environment variables set
- [ ] Production deployment successful
- [ ] Monitoring configured
- [ ] Existing data migrated (if applicable)

### Documentation
- [ ] Team documentation updated
- [ ] User documentation updated
- [ ] Troubleshooting guide created

## Next Steps After Implementation

1. **Monitor for 1 week**: Watch for errors, performance issues
2. **Gather user feedback**: Are uploads/downloads working well?
3. **Optimize as needed**: Add progress bars, caching, etc.
4. **Plan Phase 2 features**: Thumbnails, versioning, batch operations

## Troubleshooting Guide

### Common Issues

**Issue**: "BACKBLAZE_KEY_ID environment variable is not set"
- **Solution**: Add B2 credentials to `.env.local`

**Issue**: "Upload failed with 401"
- **Solution**: Check B2 app key has write permissions

**Issue**: "File not appearing in B2 dashboard"
- **Solution**: Check bucket name and region

**Issue**: "Download URL returns 404"
- **Solution**: Verify `b2FileName` matches actual file in B2

**Issue**: "Access denied when downloading"
- **Solution**: Check user has household membership and document access

## Support

For questions or issues during implementation:
1. Review the detailed guides in `/docs/`
2. Check B2 documentation: https://www.backblaze.com/b2/docs/
3. Check Convex documentation: https://docs.convex.dev/
4. Test in development before deploying to production

---

**Estimated Implementation Time**: 4-8 hours (depending on existing codebase complexity)

Good luck with the implementation! 🚀
