"use client";

import { AlertTriangle, Scale } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEGAL_DISCLAIMER, STATE_NAMES, US_STATES } from "@/lib/state-legal-requirements";

type DocumentType =
  | "will"
  | "trust"
  | "pour_over_will"
  | "financial_poa"
  | "healthcare_poa"
  | "advance_directive";

interface LegalDisclaimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType | null;
  userState: string | null;
  onAccept: (state: string) => void;
}

const DOCUMENT_NAMES: Record<DocumentType, string> = {
  will: "Last Will and Testament",
  trust: "Revocable Living Trust",
  pour_over_will: "Pour-Over Will",
  financial_poa: "Durable Power of Attorney",
  healthcare_poa: "Healthcare Power of Attorney",
  advance_directive: "Advance Healthcare Directive",
};

export function LegalDisclaimerModal({
  open,
  onOpenChange,
  documentType,
  userState,
  onAccept,
}: LegalDisclaimerModalProps) {
  const [selectedState, setSelectedState] = useState<string>(userState || "");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!selectedState || !acknowledged) return;

    setIsSubmitting(true);
    try {
      await onAccept(selectedState);
    } finally {
      setIsSubmitting(false);
      // Reset state for next open
      setAcknowledged(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setAcknowledged(false);
      if (!userState) {
        setSelectedState("");
      }
    }
    onOpenChange(newOpen);
  };

  if (!documentType) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle>Important Legal Notice</DialogTitle>
          </div>
          <DialogDescription>
            Before creating your {DOCUMENT_NAMES[documentType]}, please read and acknowledge the
            following.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Disclaimer Content */}
          <div className="p-4 bg-amber-50 border-amber-200 text-amber-900 rounded-lg space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="font-medium text-foreground">This is NOT legal advice</p>
            </div>
            <p className="text-muted-foreground">{LEGAL_DISCLAIMER}</p>
          </div>

          {/* Key Points */}
          <div className="space-y-2 text-sm">
            <p className="font-medium">By using this tool, you understand that:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>This template is for educational and organizational purposes only</li>
              <li>Laws vary by state and change frequently</li>
              <li>A qualified attorney should review any documents before signing and execution</li>
              <li>Improper execution may invalidate your document</li>
              <li>This does not create an attorney-client relationship</li>
              <li>
                Complex situations (blended families, business ownership, special needs) require
                professional guidance
              </li>
            </ul>
          </div>

          {/* State Selection */}
          <div className="space-y-2">
            <Label htmlFor="state">
              Select your state of residence <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {US_STATES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {STATE_NAMES[code]} ({code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your state determines the legal requirements for witness signatures, notarization, and
              document validity.
            </p>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <Label htmlFor="acknowledge" className="text-sm leading-relaxed cursor-pointer">
              I understand that this is an educational template, not legal advice, and I should
              consult with a qualified attorney before relying on any document generated here.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!selectedState || !acknowledged || isSubmitting}>
            {isSubmitting ? "Creating..." : "I Understand, Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
