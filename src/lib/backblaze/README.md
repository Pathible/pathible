# Backblaze B2 Storage Integration

This library provides two methods for integrating with Backblaze B2 storage:

1. **S3-Compatible API** (Recommended) - Modern approach using AWS SDK v3
2. **Native B2 API** (Legacy) - Original Backblaze API implementation

## Quick Start (S3-Compatible API)

### 1. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# S3-Compatible API Configuration
B2_S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_S3_REGION=us-west-004
B2_S3_ACCESS_KEY_ID=your_backblaze_key_id
B2_S3_SECRET_ACCESS_KEY=your_backblaze_application_key
B2_S3_BUCKET_NAME=your_bucket_name
```

**Important:** Update the endpoint and region based on your bucket's location:
- Find your region in the Backblaze B2 dashboard
- Common regions: `us-west-004`, `us-west-001`, `eu-central-003`
- Endpoint format: `https://s3.<region>.backblazeb2.com`

### 2. Generate Presigned Upload URL (Server-Side)

```typescript
import { getBackblazeS3Client, generateB2FileName } from '@/lib/backblaze';

// In your Next.js API route or Server Action
const client = getBackblazeS3Client();

// Generate unique file name
const b2FileName = generateB2FileName(householdId, originalFileName);

// Generate presigned upload URL
const { uploadUrl, key } = await client.getPresignedUploadUrl(
  b2FileName,
  'application/pdf',
  { expiresIn: 3600 } // 1 hour
);

// Return to client
return { uploadUrl, key };
```

### 3. Upload from Browser (Client-Side)

```typescript
// Client-side upload using the presigned URL
async function uploadFile(file: File, uploadUrl: string) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return { success: true };
}
```

### 4. Generate Presigned Download URL (Server-Side)

```typescript
// Generate presigned download URL
const { downloadUrl } = await client.getPresignedDownloadUrl(
  key,
  { expiresIn: 3600 } // 1 hour
);

// Return to client for download
return { downloadUrl };
```

### 5. Download from Browser (Client-Side)

```typescript
// Option 1: Direct download
window.location.href = downloadUrl;

// Option 2: Fetch and process
const response = await fetch(downloadUrl);
const blob = await response.blob();
const url = URL.createObjectURL(blob);
// Use url for display or download
```

### 6. Delete File (Server-Side)

```typescript
await client.deleteObject(key);
```

## Architecture Comparison

### S3-Compatible API (Recommended)

**Pros:**
- ✅ Presigned URLs work seamlessly with browsers (no CORS issues)
- ✅ No custom authorization headers required
- ✅ Standard S3 API semantics
- ✅ Compatible with all AWS SDK tooling
- ✅ Signature v4 authentication (industry standard)
- ✅ Direct browser uploads/downloads without server proxy

**How It Works:**
```
Client Request → Server generates presigned URL → Client uses URL directly with B2
```

**Use Cases:**
- Direct browser uploads (forms, drag-and-drop)
- Secure file downloads without exposing credentials
- Large file transfers without server bandwidth
- Modern web applications with client-side file handling

### Native B2 API (Legacy)

**Cons:**
- ⚠️ Requires custom CORS configuration
- ⚠️ Custom authorization token management
- ⚠️ More complex client-side implementation
- ⚠️ Server must proxy all uploads/downloads

**How It Works:**
```
Client Request → Server gets auth token → Server proxies to B2 → Server returns result
```

**When to Use:**
- Existing implementations (backward compatibility)
- Server-side only operations
- Migration period before switching to S3 API

## Migration Guide

### Step 1: Add S3 Environment Variables

Add the new S3 configuration to `.env.local` (keep existing B2 vars for now):

```bash
B2_S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_S3_REGION=us-west-004
B2_S3_ACCESS_KEY_ID=<same as BACKBLAZE_KEY_ID>
B2_S3_SECRET_ACCESS_KEY=<same as BACKBLAZE_APPLICATION_KEY>
B2_S3_BUCKET_NAME=<same as BACKBLAZE_BUCKET_NAME>
```

### Step 2: Update Server-Side Code

**Before (Native API):**
```typescript
import { getBackblazeClient } from '@/lib/backblaze';

const client = getBackblazeClient();
const uploadData = await client.getUploadUrl();
// Return uploadUrl and authToken to client
```

**After (S3 API):**
```typescript
import { getBackblazeS3Client } from '@/lib/backblaze';

const client = getBackblazeS3Client();
const { uploadUrl, key } = await client.getPresignedUploadUrl(
  fileName,
  contentType
);
// Return uploadUrl to client (no auth token needed!)
```

### Step 3: Update Client-Side Code

**Before (Native API):**
```typescript
await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    'Authorization': authToken,
    'X-Bz-File-Name': encodeURIComponent(fileName),
    'Content-Type': contentType,
    'X-Bz-Content-Sha1': sha1Hash,
  },
  body: file,
});
```

**After (S3 API):**
```typescript
await fetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': contentType,
  },
  body: file,
});
```

### Step 4: Test and Validate

1. Test upload with new S3 API
2. Test download with new S3 API
3. Verify files are accessible
4. Monitor for CORS errors (should be none!)

### Step 5: Remove Legacy Code (Optional)

Once fully migrated, you can:
1. Remove old `BACKBLAZE_*` environment variables
2. Remove `client.ts` imports
3. Clean up legacy code paths

## API Reference

### BackblazeS3Client

#### `getPresignedUploadUrl(key, contentType, options?)`

Generate a presigned URL for uploading a file.

**Parameters:**
- `key` (string) - Object key/path in bucket (e.g., "household_123/doc.pdf")
- `contentType` (string) - MIME type (e.g., "application/pdf")
- `options.expiresIn` (number, optional) - Expiration in seconds (default: 3600)

**Returns:**
```typescript
{
  uploadUrl: string;    // Presigned URL for PUT request
  key: string;          // The object key
  expiresIn: number;    // Expiration time in seconds
}
```

#### `getPresignedDownloadUrl(key, options?)`

Generate a presigned URL for downloading a file.

**Parameters:**
- `key` (string) - Object key/path in bucket
- `options.expiresIn` (number, optional) - Expiration in seconds (default: 3600)

**Returns:**
```typescript
{
  downloadUrl: string;  // Presigned URL for GET request
  expiresIn: number;    // Expiration time in seconds
}
```

#### `deleteObject(key)`

Delete an object from B2 storage (server-side operation).

**Parameters:**
- `key` (string) - Object key/path to delete

**Returns:** `Promise<void>`

#### `getBucketName()`

Get the configured bucket name.

**Returns:** `string`

#### `testConnection()`

Test the S3 connection by generating a test presigned URL.

**Returns:** `Promise<boolean>` - true if connection successful

## Helper Functions

### `generateB2FileName(householdId, originalFileName)`

Generate a unique, sanitized file name for B2 storage.

**Format:** `household_<householdId>/<timestamp>_<uuid>_<sanitized-filename>`

**Parameters:**
- `householdId` (string) - Household identifier
- `originalFileName` (string) - Original file name

**Returns:** `string` - Generated file name

**Example:**
```typescript
generateB2FileName('abc123', 'My Document.pdf')
// Returns: "household_abc123/1701234567890_a1b2c3d4_my_document.pdf"
```

### `validateUploadParams(params)`

Validate file upload parameters before processing.

**Parameters:**
```typescript
{
  fileName: string;
  fileSize: number;
  fileType: string;
}
```

**Throws:** Error if validation fails

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `B2_S3_ENDPOINT` | Yes | S3-compatible endpoint URL |
| `B2_S3_REGION` | Yes | AWS region format (e.g., us-west-004) |
| `B2_S3_ACCESS_KEY_ID` | Yes | Your B2 key ID |
| `B2_S3_SECRET_ACCESS_KEY` | Yes | Your B2 application key |
| `B2_S3_BUCKET_NAME` | Yes | Your bucket name |

### Constants

```typescript
B2_CONSTANTS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,        // 100MB
  DOWNLOAD_URL_EXPIRATION: 3600,            // 1 hour
  UPLOAD_URL_EXPIRATION: 3600,              // 1 hour
}
```

## Security Considerations

1. **Presigned URLs expire** - Set appropriate expiration times
2. **Server-side generation only** - Never generate presigned URLs in the browser
3. **Validate file types** - Check MIME types before generating URLs
4. **Check file sizes** - Enforce size limits before upload
5. **Use HTTPS** - All presigned URLs use HTTPS by default
6. **No credentials in browser** - Presigned URLs don't expose credentials

## Troubleshooting

### Error: "Failed to generate presigned upload URL"

**Cause:** Invalid credentials or configuration

**Solution:**
1. Verify environment variables are set correctly
2. Check endpoint format matches your region
3. Ensure credentials have proper permissions
4. Run `client.testConnection()` to diagnose

### CORS Errors with S3 API

**Cause:** Bucket CORS configuration missing or incorrect

**Solution:**
Presigned URLs should work without CORS configuration, but if needed:

```json
[
  {
    "corsRuleName": "allowAllOrigins",
    "allowedOrigins": ["https://yourdomain.com"],
    "allowedHeaders": ["*"],
    "allowedOperations": ["s3_put", "s3_get"],
    "maxAgeSeconds": 3600
  }
]
```

### Upload succeeds but file not accessible

**Cause:** Bucket permissions or wrong bucket name

**Solution:**
1. Verify bucket name matches in all configs
2. Check bucket is in correct region
3. Verify file was uploaded using correct key
4. Check bucket visibility settings in B2 dashboard

## Examples

See the `/examples` directory (coming soon) for complete working examples:
- Next.js App Router API Route
- Server Actions with upload
- React component with file picker
- Download and display images
- Progress tracking for large files

## Support

- Backblaze B2 Documentation: https://www.backblaze.com/docs/cloud-storage
- S3-Compatible API: https://www.backblaze.com/docs/cloud-storage-s3-compatible-api
- AWS SDK v3 Documentation: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/

## License

Part of the Pathible project. See project LICENSE for details.
