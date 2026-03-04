"use client";

import { useMutation } from "convex/react";
import { AlertTriangle, CheckCircle2, Clock, Send } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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

type VerificationStatus = "unverified" | "verified" | "needs_update";

interface DocumentStatusBadgesProps {
  verificationStatus: VerificationStatus;
  submittedTo?: string;
  submittedAt?: number;
  estateDocumentId: Id<"estateDocuments">;
  householdId: Id<"households">;
}

export function DocumentStatusBadges({
  verificationStatus,
  submittedTo,
  submittedAt,
  estateDocumentId,
}: DocumentStatusBadgesProps) {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [submittedToValue, setSubmittedToValue] = useState("");
  const [newVerificationStatus, setNewVerificationStatus] =
    useState<VerificationStatus>(verificationStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const markSubmitted = useMutation(api.estateDocuments.markDocumentSubmitted);
  const verifyDoc = useMutation(api.estateDocuments.verifyDocument);

  const handleMarkSubmitted = async () => {
    if (!submittedToValue.trim()) return;
    setIsSubmitting(true);
    try {
      await markSubmitted({
        estateDocumentId,
        submittedTo: submittedToValue.trim(),
      });
      setSubmitDialogOpen(false);
      setSubmittedToValue("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      await verifyDoc({
        estateDocumentId,
        verificationStatus: newVerificationStatus,
      });
      setVerifyDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
      {/* Verification badge */}
      <button type="button" onClick={() => setVerifyDialogOpen(true)}>
        {verificationStatus === "verified" && (
          <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        )}
        {verificationStatus === "needs_update" && (
          <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            Needs Update
          </Badge>
        )}
        {verificationStatus === "unverified" && (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            Unverified
          </Badge>
        )}
      </button>

      {/* Submission status */}
      {submittedTo ? (
        <Badge variant="secondary" className="gap-1">
          <Send className="h-3 w-3" />
          {submittedTo}
          {submittedAt && (
            <span className="text-xs opacity-70">{new Date(submittedAt).toLocaleDateString()}</span>
          )}
        </Badge>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-xs text-muted-foreground px-2"
          onClick={() => setSubmitDialogOpen(true)}
        >
          <Send className="h-3 w-3" />
          Mark Submitted
        </Button>
      )}

      {/* Submit dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Submitted</DialogTitle>
            <DialogDescription>
              Record where this document was submitted (e.g., probate court, insurance company).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="submitted-to">Submitted to</Label>
              <Input
                id="submitted-to"
                value={submittedToValue}
                onChange={(e) => setSubmittedToValue(e.target.value)}
                placeholder="e.g., County Probate Court"
                maxLength={255}
                data-testid="submitted-to-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubmitDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkSubmitted}
              disabled={!submittedToValue.trim() || isSubmitting}
              data-testid="mark-submitted-confirm"
            >
              {isSubmitting ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Verification Status</DialogTitle>
            <DialogDescription>Set the verification status for this document.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Verification Status</Label>
              <Select
                value={newVerificationStatus}
                onValueChange={(val) => setNewVerificationStatus(val as VerificationStatus)}
              >
                <SelectTrigger data-testid="verification-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="needs_update">Needs Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVerifyDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={newVerificationStatus === verificationStatus || isSubmitting}
              data-testid="verify-confirm"
            >
              {isSubmitting ? "Saving..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
