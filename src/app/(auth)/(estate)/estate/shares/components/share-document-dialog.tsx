"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface ShareDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: Id<"households">;
}

export function ShareDocumentDialog({ open, onOpenChange, householdId }: ShareDocumentDialogProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [expiresInHours, setExpiresInHours] = useState("168"); // 7 days
  const [maxDownloads, setMaxDownloads] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareResult, setShareResult] = useState<{ shareToken: string } | null>(null);

  const vaultResult = useQuery(api.vault.list, open ? { householdId, limit: 100 } : "skip");
  const vaultDocuments = vaultResult?.documents;

  const createShare = useMutation(api.estateDocuments.createDocumentShare);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !recipientName.trim() || !recipientEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createShare({
        vaultDocumentId: selectedDocId as Id<"vaultDocuments">,
        householdId,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        recipientRole: recipientRole.trim() || undefined,
        expiresInHours: Number(expiresInHours),
        maxDownloads: Number(maxDownloads),
      });
      setShareResult({ shareToken: result.shareToken });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDocId("");
    setRecipientName("");
    setRecipientEmail("");
    setRecipientRole("");
    setExpiresInHours("168");
    setMaxDownloads("10");
    setShareResult(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  if (shareResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Link Created</DialogTitle>
            <DialogDescription>
              A secure share link has been created. The recipient can use this token to access the
              document.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium mb-1">Share Token</p>
              <code className="text-xs break-all select-all" data-testid="share-token-display">
                {shareResult.shareToken}
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this token securely with the recipient. The link will expire based on your
              settings.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleClose} data-testid="share-done-button">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Share a Document</DialogTitle>
            <DialogDescription>
              Create a secure, time-limited link to share a document with an attorney, beneficiary,
              or institution.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-doc">Document</Label>
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger data-testid="share-doc-select">
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  {vaultDocuments?.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                  {vaultDocuments?.length === 0 && (
                    <SelectItem value="_none" disabled>
                      No documents in vault
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient-name">Recipient Name</Label>
              <Input
                id="recipient-name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., John Smith, Esq."
                maxLength={255}
                data-testid="share-recipient-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="attorney@lawfirm.com"
                maxLength={255}
                data-testid="share-recipient-email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient-role">Role (optional)</Label>
              <Input
                id="recipient-role"
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                placeholder="e.g., Attorney, Beneficiary"
                maxLength={100}
                data-testid="share-recipient-role"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expires-in">Expires In</Label>
                <Select value={expiresInHours} onValueChange={setExpiresInHours}>
                  <SelectTrigger data-testid="share-expiry-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">1 day</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                    <SelectItem value="336">14 days</SelectItem>
                    <SelectItem value="720">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max-downloads">Max Downloads</Label>
                <Select value={maxDownloads} onValueChange={setMaxDownloads}>
                  <SelectTrigger data-testid="share-downloads-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedDocId || !recipientName.trim() || !recipientEmail.trim() || isSubmitting
              }
              data-testid="share-submit"
            >
              {isSubmitting ? "Creating..." : "Create Share Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
