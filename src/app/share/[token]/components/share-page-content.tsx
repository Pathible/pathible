"use client";

import { AlertCircle, Download, FileText, Loader2, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ShareMetadata {
  documentName: string;
  recipientName: string;
  expiresAt: number;
  status: string;
  downloadsRemaining: number;
}

interface ShareError {
  error: string;
  status?: string;
}

type PageState = "loading" | "ready" | "downloading" | "error";

export function SharePageContent({ token }: { token: string }) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [shareData, setShareData] = useState<ShareMetadata | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchShareInfo() {
      try {
        const response = await fetch(`/api/share/${encodeURIComponent(token)}`);
        if (!response.ok) {
          const data = (await response.json()) as ShareError;
          setErrorMessage(data.error || "This share link is no longer valid.");
          setPageState("error");
          return;
        }
        const data = (await response.json()) as ShareMetadata;
        setShareData(data);
        setPageState("ready");
      } catch {
        setErrorMessage("Failed to load share information. Please try again.");
        setPageState("error");
      }
    }

    fetchShareInfo();
  }, [token]);

  const handleDownload = useCallback(async () => {
    setPageState("downloading");
    try {
      const response = await fetch(`/api/share/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download" }),
      });

      if (!response.ok) {
        const data = (await response.json()) as ShareError;
        setErrorMessage(data.error || "Download failed. Please try again.");
        setPageState("error");
        return;
      }

      const data = (await response.json()) as {
        downloadUrl: string;
        documentName: string;
        fileType: string;
      };

      // Open download URL in a new tab
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");

      // Update remaining downloads
      if (shareData) {
        const newRemaining = shareData.downloadsRemaining - 1;
        setShareData({ ...shareData, downloadsRemaining: newRemaining });
        if (newRemaining <= 0) {
          setErrorMessage("This share link has reached its download limit.");
          setPageState("error");
          return;
        }
      }

      setPageState("ready");
    } catch {
      setErrorMessage("Download failed. Please try again.");
      setPageState("error");
    }
  }, [token, shareData]);

  if (pageState === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading share information...</p>
        </CardContent>
      </Card>
    );
  }

  if (pageState === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Share Unavailable</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Contact the person who shared this document if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!shareData) return null;

  const expiresDate = new Date(shareData.expiresAt);
  const formattedExpiry = expiresDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">{shareData.documentName}</CardTitle>
        <CardDescription>Shared with {shareData.recipientName} via Pathible</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expires</span>
            <span>{formattedExpiry}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Downloads remaining</span>
            <span>{shareData.downloadsRemaining}</span>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={pageState === "downloading"}
          className="w-full"
          size="lg"
        >
          {pageState === "downloading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing download...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Document
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
          <span>This document is shared securely through Pathible estate administration.</span>
        </div>
      </CardContent>
    </Card>
  );
}
