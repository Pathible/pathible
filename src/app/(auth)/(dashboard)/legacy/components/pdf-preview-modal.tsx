"use client";

import { pdf } from "@react-pdf/renderer";
import { Download, Eye, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LegalDocumentPDF, type LegalDocumentPDFData } from "./legal-document-pdf";

interface PDFPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentData: LegalDocumentPDFData | null;
  documentName: string;
}

export function PDFPreviewModal({
  open,
  onOpenChange,
  documentData,
  documentName,
}: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdfUrl = async () => {
    if (!documentData) return;

    setIsLoading(true);
    setError(null);

    try {
      const blob = await pdf(<LegalDocumentPDF data={documentData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError("Failed to generate PDF preview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentData) return;

    try {
      const blob = await pdf(<LegalDocumentPDF data={documentData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentName.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    onOpenChange(newOpen);
  };

  // Generate PDF when modal opens
  if (open && !pdfUrl && !isLoading && !error && documentData) {
    generatePdfUrl();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {documentName} Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading}>
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-muted/50">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Generating preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <X className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={generatePdfUrl}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {pdfUrl && !isLoading && !error && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={`${documentName} Preview`}
            />
          )}
        </div>

        <div className="px-6 py-3 border-t bg-muted/30 shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            This document is for educational purposes only. Please consult with a qualified attorney
            before using any legal document.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
