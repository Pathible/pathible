"use client";

import { useAction, useMutation } from "convex/react";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
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

  const generateUploadUrl = useAction(api.vaultActions.generateUploadUrl);
  const createDocument = useMutation(api.vault.create);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert("File size must be less than 100MB");
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
      // Step 1: Generate B2 upload URL
      const { uploadUrl, authorizationToken, b2FileName, bucketName } = await generateUploadUrl({
        householdId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });
      setUploadProgress(25);

      // Step 2: Upload file directly to Backblaze B2
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": selectedFile.type,
          "X-Bz-File-Name": b2FileName,
          "X-Bz-Content-Sha1": "do_not_verify", // Skip SHA1 verification for simplicity
        },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file to B2");
      }

      const b2Response = await result.json();
      // B2 response: { fileId, fileName, contentSha1, contentLength, ... }
      setUploadProgress(75);

      // Step 3: Create document metadata in Convex
      await createDocument({
        householdId,
        name: metadata.name,
        description: metadata.description,
        b2FileId: b2Response.fileId,
        b2FileName: b2Response.fileName,
        b2BucketName: bucketName,
        fileSize: b2Response.contentLength,
        fileType: selectedFile.type,
        fileHash: b2Response.contentSha1,
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
      alert("Failed to upload document. Please try again.");
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
