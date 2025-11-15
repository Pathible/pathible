# Backblaze B2 Integration - Architecture Summary

## Executive Summary

This document provides a high-level overview of the Backblaze B2 storage integration for the Pathible Heritage Vault feature. The integration follows KISS, DRY/RUG, SOLID, and YAGNI principles to provide a simple, maintainable solution for file storage.

## Key Architectural Decisions

### 1. Convex Actions (with "use node") vs Next.js API Routes

**Decision**: Use Convex Actions with "use node" directive

**Rationale**:
- **Unified Backend**: All business logic remains in Convex (single source of truth)
- **Built-in Auth**: Leverages existing Convex authentication and authorization patterns
- **Type Safety**: Full end-to-end TypeScript types from database to client
- **Simpler Deployment**: No need to manage separate API infrastructure
- **Better DX**: Convex's hot reloading and automatic type generation
- **Error Handling**: Convex's built-in error propagation system

**Trade-offs**:
| Convex Actions | Next.js API Routes |
|----------------|-------------------|
| Unified backend | Separate API layer |
| Built-in auth | Manual auth checks |
| 10-minute timeout | 60-second timeout (Vercel free) |
| Direct B2 access | Could proxy downloads |
| Simpler deployment | More infrastructure |

**Verdict**: Convex Actions win on simplicity and maintainability

### 2. Direct Upload vs Proxy Upload

**Decision**: Direct upload from client to B2

**Rationale**:
- **Performance**: No bandwidth bottleneck through Next.js server
- **Cost**: No egress costs from application server
- **Scalability**: B2 handles the load, not our servers
- **Reliability**: Fewer failure points in the chain
- **Simplicity**: Less code to maintain

**Flow**:
```
Client → Convex (get signed URL) → Client → B2 (direct upload) → Client → Convex (save metadata)
```

**Security**: Access control enforced by Convex before issuing signed URLs

### 3. Hybrid Storage Model

**Decision**: Metadata in Convex, files in B2

**Rationale**:
- **Cost Efficiency**: B2 is 10x cheaper than alternatives for storage
- **Query Performance**: Metadata in Convex enables fast searches/filters
- **Access Control**: Convex enforces fine-grained permissions
- **Flexibility**: Can change storage backends without touching business logic
- **Data Integrity**: Single source of truth for document metadata

**Data Split**:
| Convex Database | Backblaze B2 |
|-----------------|--------------|
| Document metadata | Actual files |
| Access control rules | File binary data |
| Categories & tags | - |
| Audit logs | - |
| User permissions | - |

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Browser)                       │
│  - Upload files                                              │
│  - Download files                                            │
│  - Manage metadata                                           │
└───────┬─────────────────────────────────────────┬───────────┘
        │                                         │
        │ Convex API                              │ Direct HTTP
        │ (Queries/Mutations/Actions)             │
        ▼                                         ▼
┌─────────────────────────────┐         ┌─────────────────────┐
│      Convex Backend         │         │   Backblaze B2      │
│                             │         │                     │
│  ┌──────────────────────┐   │         │  ┌──────────────┐   │
│  │  vault.ts            │   │         │  │  File Storage│   │
│  │  - Queries           │   │         │  │  (Binary)    │   │
│  │  - Mutations         │   │         │  │              │   │
│  │  - Access Control    │   │         │  │  2GB max     │   │
│  └──────────────────────┘   │         │  │  per file    │   │
│                             │         │  └──────────────┘   │
│  ┌──────────────────────┐   │         │                     │
│  │  vaultActions.ts     │◄──┼─────────┤  B2 API Client      │
│  │  - generateUploadUrl │   │         │  - Upload URLs      │
│  │  - generateDownload  │   │         │  - Download URLs    │
│  │  - deleteFile        │   │         │  - Delete files     │
│  └──────────────────────┘   │         └─────────────────────┘
│                             │
│  ┌──────────────────────┐   │
│  │  Database            │   │
│  │  - vaultDocuments    │   │
│  │  - vaultCategories   │   │
│  │  - activityLog       │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Client Components                                           │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐    │
│  │ UploadDialog  │  │ DocumentList  │  │ DownloadBtn  │    │
│  └───────┬───────┘  └───────┬───────┘  └──────┬───────┘    │
│          │                  │                  │             │
└──────────┼──────────────────┼──────────────────┼─────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer (Convex)                    │
├─────────────────────────────────────────────────────────────┤
│  Queries & Mutations        Actions (use node)              │
│  ┌───────────────┐          ┌───────────────────┐          │
│  │ vault.list    │          │ generateUploadUrl │          │
│  │ vault.get     │          │ generateDownload  │          │
│  │ vault.create  │          │ deleteFile        │          │
│  │ vault.update  │          └─────────┬─────────┘          │
│  │ vault.remove  │                    │                     │
│  └───────┬───────┘                    │                     │
│          │                            │                     │
│          ▼                            ▼                     │
│  ┌────────────────────┐    ┌──────────────────┐           │
│  │ Auth Helpers       │    │ Backblaze Client │           │
│  │ - requireAuth      │    │ (lib/backblaze)  │           │
│  │ - requireHousehold │    └──────────┬───────┘           │
│  └────────────────────┘               │                    │
│                                       │                     │
│  ┌────────────────────────────────────┴─────────┐          │
│  │        Database (Convex)                     │          │
│  │  - vaultDocuments (B2 metadata)              │          │
│  │  - householdMemberships (access control)     │          │
│  │  - activityLog (audit trail)                 │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
           │                            │
           │ HTTP API                   │ HTTP API
           │                            │
           ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Storage Layer (Backblaze B2)                  │
├─────────────────────────────────────────────────────────────┤
│  Bucket: pathible-vault-prod (Private)                      │
│  ┌──────────────────────────────────────────────┐           │
│  │  household_<id>/                             │           │
│  │    ├── <timestamp>_<uuid>_file1.pdf          │           │
│  │    ├── <timestamp>_<uuid>_file2.jpg          │           │
│  │    └── <timestamp>_<uuid>_file3.docx         │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  API Endpoints:                                              │
│  - b2_authorize_account                                      │
│  - b2_get_upload_url                                         │
│  - b2_upload_file                                            │
│  - b2_get_download_authorization                             │
│  - b2_delete_file_version                                    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Upload Flow (Detailed)

```
┌──────┐  1. User selects file     ┌──────────────┐
│Client├─────────────────────────►│ UploadDialog │
└──────┘                           └──────┬───────┘
                                          │
                                          │ 2. validateFile()
                                          │    - Check size < 2GB
                                          │    - Check file type
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Request Upload URL                                        │
│     convex.action(api.vaultActions.generateUploadUrl, {      │
│       householdId, fileName, fileType, fileSize              │
│     })                                                        │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex Action: generateUploadUrl                           │
│  4. requireHouseholdAccess(householdId)                     │
│  5. validateUploadParams(fileName, fileType, fileSize)      │
│  6. Generate unique B2 filename:                            │
│     household_<id>/<timestamp>_<uuid>_<sanitized-name>      │
│  7. Call B2 API: b2_get_upload_url                          │
│  8. Return {                                                 │
│       uploadUrl: "https://...",                              │
│       authorizationToken: "...",                             │
│       b2FileName: "household_123/...",                       │
│       bucketId: "...",                                       │
│       bucketName: "pathible-vault-prod"                      │
│     }                                                        │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Client: Upload to B2                                        │
│  9. POST to uploadUrl with:                                  │
│     - Authorization: authorizationToken                      │
│     - Content-Type: fileType                                 │
│     - X-Bz-File-Name: b2FileName (URL encoded)              │
│     - X-Bz-Content-Sha1: "do_not_verify"                    │
│     - Body: file binary data                                 │
│                                                              │
│  10. B2 responds with:                                       │
│      {                                                       │
│        fileId: "4_z...",                                     │
│        fileName: "household_123/...",                        │
│        contentSha1: "abc123...",                             │
│        contentLength: 1024000,                               │
│        contentType: "application/pdf"                        │
│      }                                                       │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex Mutation: vault.create                              │
│  11. Save metadata to database:                              │
│      {                                                       │
│        householdId,                                          │
│        uploadedBy: currentUserId,                            │
│        name: displayName,                                    │
│        description,                                          │
│        b2FileId: B2Response.fileId,                          │
│        b2FileName: B2Response.fileName,                      │
│        b2BucketName: bucketName,                             │
│        fileSize: B2Response.contentLength,                   │
│        fileType: B2Response.contentType,                     │
│        fileHash: B2Response.contentSha1,                     │
│        categories,                                           │
│        accessLevel,                                          │
│        sharedWithUsers,                                      │
│        updatedAt: Date.now()                                 │
│      }                                                       │
│  12. Insert activity log                                     │
│  13. Return documentId                                       │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  Success!    │
└──────────────┘
```

### Download Flow (Detailed)

```
┌──────┐  1. User clicks download   ┌──────────────┐
│Client├───────────────────────────►│ DocumentCard │
└──────┘                             └──────┬───────┘
                                            │
                                            │ 2. Get document
                                            │    from list query
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Request Download URL                                      │
│     convex.action(api.vaultActions.generateDownloadUrl, {    │
│       documentId                                              │
│     })                                                        │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex Action: generateDownloadUrl                         │
│  4. Get document from database                              │
│  5. requireHouseholdAccess(document.householdId)            │
│  6. Get current user profile                                │
│  7. Check document-level access:                            │
│     - If "household": allow (already checked membership)    │
│     - If "admins": check role = owner/steward               │
│     - If "custom": check uploadedBy or sharedWithUsers      │
│  8. Call B2 API: b2_get_download_authorization              │
│     - fileNamePrefix: document.b2FileName                   │
│     - validDurationInSeconds: 3600 (1 hour)                 │
│  9. Construct signed URL:                                    │
│     https://<downloadUrl>/file/<bucket>/<filename>?Auth=... │
│  10. Return {                                                │
│        url: signedUrl,                                       │
│        expiresIn: 3600                                       │
│      }                                                       │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Client: Download from B2                                    │
│  11. Open URL in new tab OR                                  │
│      Fetch and trigger download:                             │
│      const response = await fetch(url);                      │
│      const blob = await response.blob();                     │
│      // Trigger download...                                  │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  File saved  │
└──────────────┘
```

### Delete Flow (Detailed)

```
┌──────┐  1. User clicks delete     ┌──────────────┐
│Client├───────────────────────────►│ DeleteButton │
└──────┘                             └──────┬───────┘
                                            │
                                            │ 2. Show confirmation
                                            │    dialog
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Call Mutation                                             │
│     convex.mutation(api.vault.remove, {                      │
│       documentId                                              │
│     })                                                        │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex Mutation: vault.remove                              │
│  4. Get document from database                              │
│  5. requireHouseholdAccess(document.householdId)            │
│  6. Check permissions:                                       │
│     - Is user the uploader? OR                               │
│     - Is user household admin (owner/steward)?               │
│  7. Call Action: vaultActions.deleteFile                     │
│     - This deletes file from B2 storage                      │
│  8. Delete document from database                            │
│  9. Insert activity log entry                                │
│  10. Return success                                          │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex Action: deleteFile                                   │
│  11. Call B2 API: b2_delete_file_version                     │
│      - fileName: document.b2FileName                         │
│      - fileId: document.b2FileId                             │
│  12. Return success                                          │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  Deleted!    │
└──────────────┘
```

## Access Control Matrix

| User Role | Household Access | Admins Access | Custom Access | Can Upload | Can Delete Own | Can Delete Others |
|-----------|------------------|---------------|---------------|------------|----------------|-------------------|
| Owner     | Yes              | Yes           | If shared     | Yes        | Yes            | Yes               |
| Steward   | Yes              | Yes           | If shared     | Yes        | Yes            | Yes               |
| Viewer    | Yes              | No            | If shared     | Yes        | Yes            | No                |
| Executor  | Yes              | No            | If shared     | Yes        | Yes            | No                |

**Access Level Definitions**:
- **Household**: All active household members can access
- **Admins**: Only owners and stewards can access
- **Custom**: Only uploader and users in `sharedWithUsers` array can access

## Security Layers

### Layer 1: Authentication
- Better Auth session validation
- JWT token verification
- Session expiration handling

### Layer 2: Household Membership
- User must be active member of household
- Verified via `householdMemberships` table
- Status must be "active"

### Layer 3: Document-Level Access
- Access level checked per document
- Role-based access control (RBAC)
- Custom sharing with specific users

### Layer 4: Signed URLs
- B2 authorization token required
- URLs expire after 1 hour
- Token cannot be reused after expiration

### Layer 5: File Storage Isolation
- Files stored in private B2 bucket
- No public access allowed
- Bucket-level permissions enforced

## Performance Characteristics

### Upload Performance
- **Client → B2**: Direct upload, no proxy
- **Throughput**: Limited only by client's upload speed
- **Timeout**: B2 has generous timeout limits (hours)
- **Parallelization**: Multiple uploads possible simultaneously

### Download Performance
- **Client → B2**: Direct download with signed URL
- **CDN**: B2 uses Cloudflare CDN automatically
- **Caching**: Browser can cache files
- **Throughput**: Limited only by client's download speed

### Database Queries
- **List Documents**: Indexed by household (fast)
- **Filter by Category**: In-memory filter (acceptable for < 1000 docs)
- **Search**: In-memory search (could add full-text search later)
- **Get Single Doc**: Direct lookup by ID (instant)

### Bottlenecks to Monitor
1. **Large number of documents** (> 1000 per household): Consider pagination
2. **Frequent URL regeneration**: Implement client-side caching
3. **B2 API rate limits**: Unlikely to hit with current usage patterns

## Error Handling Strategy

### Client-Side Errors
```typescript
try {
  // Upload or download operation
} catch (error) {
  if (error.message.includes("Access denied")) {
    // Show permission error to user
  } else if (error.message.includes("File size")) {
    // Show file size error
  } else {
    // Generic error handling
  }
}
```

### Server-Side Errors
- Convex automatically propagates errors to client
- Errors include descriptive messages
- HTTP status codes mapped appropriately

### B2 API Errors
- Authorization failures: Retry with fresh token
- Upload failures: Return clear error to client
- Network failures: Let client handle retry logic

### Graceful Degradation
- If B2 is down: Show error, allow metadata viewing
- If Convex is down: Standard Convex error handling
- If network is slow: Show upload/download progress

## Scalability Considerations

### Current Design Supports
- **Households**: 10,000+
- **Documents per household**: 1,000+
- **Total storage**: Unlimited (B2 scales automatically)
- **Concurrent uploads**: Unlimited (direct to B2)
- **Concurrent downloads**: Unlimited (B2 CDN)

### When to Scale
1. **> 1000 documents per household**: Add pagination to list query
2. **> 10,000 total documents**: Consider search service (Algolia/Meilisearch)
3. **> 100GB per household**: Review storage costs, consider compression
4. **> 1000 concurrent users**: Already scales (direct B2 uploads)

### Cost Scaling
- **Linear with storage**: $5 per TB/month
- **Linear with downloads**: $10 per TB downloaded
- **Negligible API costs**: First 2,500 calls/day free

## Monitoring & Observability

### Key Metrics to Track
1. **Upload success rate**: % of uploads that complete successfully
2. **Download success rate**: % of downloads that complete
3. **Average upload time**: By file size bucket
4. **Average download time**: By file size bucket
5. **B2 API errors**: Count by error type
6. **Storage usage**: Total GB stored per household
7. **Monthly costs**: Track B2 storage + download costs

### Logging Strategy
- **Upload start**: Log household, file name, size
- **Upload complete**: Log B2 file ID, time taken
- **Upload error**: Log error type and message
- **Download request**: Log document ID, user
- **Delete operation**: Log document ID, user, reason
- **B2 API calls**: Log endpoint, response time, status

### Alerting Thresholds
- Upload failure rate > 5%
- B2 API errors > 100/hour
- Storage cost > expected budget
- Authorization failures > 10/hour

## Future Roadmap (Prioritized)

### Phase 1 (MVP - Current)
- ✅ Direct upload to B2
- ✅ Signed download URLs
- ✅ Access control enforcement
- ✅ File deletion
- ✅ Metadata management

### Phase 2 (Performance)
- ⏳ Client-side upload progress
- ⏳ Client-side download progress
- ⏳ Pagination for large document lists
- ⏳ Thumbnail generation for images

### Phase 3 (Features)
- ⏳ File versioning
- ⏳ Batch operations (multi-delete, multi-download)
- ⏳ Advanced search (full-text)
- ⏳ File preview in browser

### Phase 4 (Scale)
- ⏳ Multipart upload for > 5GB files
- ⏳ CDN optimization with Cloudflare
- ⏳ Lifecycle policies for archival
- ⏳ Server-side encryption with customer keys

## Conclusion

The Backblaze B2 integration provides a **simple, cost-effective, and scalable** solution for file storage in the Heritage Vault. By following SOLID principles and keeping the architecture simple (KISS), we've created a maintainable system that can grow with the application.

**Key Strengths**:
1. **Cost-effective**: 10x cheaper than alternatives
2. **Simple**: Minimal code, easy to understand
3. **Secure**: Multiple layers of access control
4. **Scalable**: Handles unlimited storage and concurrent operations
5. **Maintainable**: Clear separation of concerns

**Next Steps**:
1. Configure B2 credentials in `.env.local`
2. Update vault mutations to use B2 fields (remove `storageId` references)
3. Update client components to use new upload/download flow
4. Test thoroughly with various file sizes and access levels
5. Deploy and monitor performance

For detailed implementation instructions, see [B2_INTEGRATION_GUIDE.md](./B2_INTEGRATION_GUIDE.md).
