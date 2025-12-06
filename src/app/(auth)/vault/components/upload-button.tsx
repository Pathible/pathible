"use client";

import { useMutation } from "convex/react";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { UploadDialog } from "./upload-dialog";

interface UploadButtonProps {
  householdId: Id<"households">;
  categories: Array<{ _id: Id<"vaultCategories">; name: string }>;
  className?: string;
}

export function UploadButton({ householdId, categories, className }: UploadButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createDocument = useMutation(api.vault.create);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size must be less than 100MB");
        return;
      }
      setSelectedFile(file);
      setIsDialogOpen(true);
    }
  };

  const handleUpload = async (metadata: {
    name: string;
    description?: string;
    categories: string[];
    accessLevel: "household" | "admins" | "custom";
    sharedWithUsers?: Id<"profiles">[];
  }) => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned upload URL from Next.js API route
      const uploadUrlResponse = await fetch("/api/vault/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          householdId,
          fileName: selectedFile.name,
          fileType: selectedFile.type || "application/octet-stream",
          fileSize: selectedFile.size,
        }),
      });

      if (!uploadUrlResponse.ok) {
        const error = await uploadUrlResponse.json();
        throw new Error(error.error || "Failed to generate upload URL");
      }

      const { uploadUrl, b2FileName } = await uploadUrlResponse.json();
      setUploadProgress(25);

      // Step 2: Upload file directly to B2 using S3-compatible presigned URL
      // With presigned URLs, we use PUT method and only need Content-Type header
      // No Authorization header needed - credentials are embedded in the URL
      const uploadResult = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type || "application/octet-stream",
        },
        body: selectedFile,
      });

      if (!uploadResult.ok) {
        const errorText = await uploadResult.text();
        console.error("S3 upload failed:", uploadResult.status, errorText);
        throw new Error(`Failed to upload file: ${uploadResult.status}`);
      }

      setUploadProgress(75);

      // Step 3: Create document metadata in Convex
      // With S3 API, the file key is the identifier (no separate fileId)
      // Note: bucketName is stored server-side for security, not exposed to client
      await createDocument({
        householdId,
        name: metadata.name,
        description: metadata.description,
        b2FileId: b2FileName, // Use the key as the file ID for S3
        b2FileName: b2FileName,
        b2BucketName: process.env.NEXT_PUBLIC_B2_BUCKET_NAME || "pathible-vault",
        fileSize: selectedFile.size,
        fileType: selectedFile.type || "application/octet-stream",
        fileHash: "", // S3 presigned uploads don't return hash in response
        categories: metadata.categories,
        accessLevel: metadata.accessLevel,
        sharedWithUsers: metadata.sharedWithUsers || [],
      });

      setUploadProgress(100);

      // Success
      setIsDialogOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="*/*"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={cn("gap-2", className)}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload Document
          </>
        )}
      </Button>

      {selectedFile && (
        <UploadDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          file={selectedFile}
          categories={categories}
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      )}
    </>
  );
}
