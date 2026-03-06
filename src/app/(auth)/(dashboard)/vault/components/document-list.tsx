"use client";

import { Calendar, Download, Eye, FileText, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate } from "@/lib/date-utils";
import { DocumentDetailModal } from "./document-detail-modal";

interface Document {
  _id: Id<"vaultDocuments">;
  _creationTime: number;
  name: string;
  description?: string;
  uploaderName: string;
  fileSize: number;
  fileType: string;
  categories: string[];
  accessLevel: "household" | "admins" | "custom";
  updatedAt: number;
}

interface Category {
  _id: Id<"vaultCategories">;
  name: string;
  description?: string;
  documentCount: number;
}

interface DocumentListProps {
  documents: Document[];
  categories: Category[];
  householdId: Id<"households">;
  isLoading: boolean;
  isReadOnly?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

function getFileIcon(_fileType: string) {
  // You can expand this with more specific icons based on file type
  return <FileText className="h-10 w-10 text-primary" />;
}

export function DocumentList({
  documents,
  categories,
  householdId,
  isLoading,
  isReadOnly,
}: DocumentListProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDownload = async (document: Document) => {
    try {
      // Generate a signed download URL and auth token from Next.js API route
      const downloadUrlResponse = await fetch("/api/vault/download-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: document._id,
        }),
      });

      if (!downloadUrlResponse.ok) {
        const error = await downloadUrlResponse.json();
        throw new Error(error.error || "Failed to generate download URL");
      }

      const { url } = await downloadUrlResponse.json();

      // Download the file - S3 presigned URLs don't need Authorization header
      // Credentials are embedded in the URL signature
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = objectUrl;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to download document");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-dashed" data-testid="vault-documents-empty">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your vault is ready</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Start by adding the documents your family will need someday.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        data-testid="vault-documents-list"
        data-document-count={documents.length}
      >
        {documents.map((document) => (
          <Card
            key={document._id}
            data-testid="vault-document-card"
            data-document-id={document._id}
            data-document-categories={document.categories.join(",")}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setSelectedDocument(document)}
          >
            <CardContent className="p-4">
              {/* File Icon and Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">{getFileIcon(document.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                    {document.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {document.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {document.description}
                </p>
              )}

              {/* Categories */}
              {document.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {document.categories.slice(0, 2).map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {document.categories.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.categories.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{document.uploaderName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(document._creationTime)}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDocument(document);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(document);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          categories={categories}
          householdId={householdId}
          open={!!selectedDocument}
          onOpenChange={(open) => !open && setSelectedDocument(null)}
          onDownload={() => handleDownload(selectedDocument)}
          isReadOnly={isReadOnly}
        />
      )}
    </>
  );
}
