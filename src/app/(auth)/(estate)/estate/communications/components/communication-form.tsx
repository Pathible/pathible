"use client";

import { useMutation } from "convex/react";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type CommunicationMethod =
  | "phone"
  | "email"
  | "mail"
  | "in_person"
  | "online_portal"
  | "fax"
  | "other";

type CommunicationCategory =
  | "financial_institution"
  | "government_agency"
  | "insurance_company"
  | "legal"
  | "beneficiary"
  | "utility"
  | "employer"
  | "other";

const METHOD_OPTIONS: Array<{ value: CommunicationMethod; label: string }> = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "mail", label: "Mail" },
  { value: "in_person", label: "In Person" },
  { value: "online_portal", label: "Online Portal" },
  { value: "fax", label: "Fax" },
  { value: "other", label: "Other" },
];

const CATEGORY_OPTIONS: Array<{ value: CommunicationCategory; label: string }> = [
  { value: "financial_institution", label: "Financial Institution" },
  { value: "government_agency", label: "Government Agency" },
  { value: "insurance_company", label: "Insurance Company" },
  { value: "legal", label: "Legal" },
  { value: "beneficiary", label: "Beneficiary" },
  { value: "utility", label: "Utility" },
  { value: "employer", label: "Employer" },
  { value: "other", label: "Other" },
];

interface Communication {
  _id: Id<"estateCommunications">;
  recipientName: string;
  recipientOrganization?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  method: CommunicationMethod;
  subject: string;
  summary: string;
  category: CommunicationCategory;
  followUpDate?: number;
  followUpNotes?: string;
  communicationDate: number;
}

interface CommunicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: Id<"households">;
  mode: "create" | "edit";
  communication?: Communication;
}

function formatDateForInput(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

export function CommunicationForm({
  open,
  onOpenChange,
  householdId,
  mode,
  communication,
}: CommunicationFormProps) {
  const [recipientName, setRecipientName] = useState(communication?.recipientName ?? "");
  const [recipientOrganization, setRecipientOrganization] = useState(
    communication?.recipientOrganization ?? "",
  );
  const [recipientEmail, setRecipientEmail] = useState(communication?.recipientEmail ?? "");
  const [recipientPhone, setRecipientPhone] = useState(communication?.recipientPhone ?? "");
  const [method, setMethod] = useState<CommunicationMethod>(communication?.method ?? "phone");
  const [subject, setSubject] = useState(communication?.subject ?? "");
  const [summary, setSummary] = useState(communication?.summary ?? "");
  const [category, setCategory] = useState<CommunicationCategory>(
    communication?.category ?? "financial_institution",
  );
  const [communicationDate, setCommunicationDate] = useState(
    communication
      ? formatDateForInput(communication.communicationDate)
      : formatDateForInput(Date.now()),
  );
  const [followUpDate, setFollowUpDate] = useState(
    communication?.followUpDate ? formatDateForInput(communication.followUpDate) : "",
  );
  const [followUpNotes, setFollowUpNotes] = useState(communication?.followUpNotes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logCommunication = useMutation(api.estateCommunications.logCommunication);
  const updateCommunication = useMutation(api.estateCommunications.updateCommunication);

  const resetForm = () => {
    setRecipientName("");
    setRecipientOrganization("");
    setRecipientEmail("");
    setRecipientPhone("");
    setMethod("phone");
    setSubject("");
    setSummary("");
    setCategory("financial_institution");
    setCommunicationDate(formatDateForInput(Date.now()));
    setFollowUpDate("");
    setFollowUpNotes("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = recipientName.trim();
    const trimmedSubject = subject.trim();
    const trimmedSummary = summary.trim();
    if (!trimmedName || !trimmedSubject || !trimmedSummary) return;

    setIsSubmitting(true);
    try {
      const commDate = new Date(communicationDate).getTime();
      const fuDate = followUpDate ? new Date(followUpDate).getTime() : undefined;

      if (mode === "create") {
        await logCommunication({
          householdId,
          recipientName: trimmedName,
          recipientOrganization: recipientOrganization.trim() || undefined,
          recipientEmail: recipientEmail.trim() || undefined,
          recipientPhone: recipientPhone.trim() || undefined,
          method,
          subject: trimmedSubject,
          summary: trimmedSummary,
          category,
          communicationDate: commDate,
          followUpDate: fuDate,
          followUpNotes: followUpNotes.trim() || undefined,
        });
      } else if (communication) {
        await updateCommunication({
          communicationId: communication._id,
          recipientName: trimmedName,
          recipientOrganization: recipientOrganization.trim() || undefined,
          recipientEmail: recipientEmail.trim() || undefined,
          recipientPhone: recipientPhone.trim() || undefined,
          method,
          subject: trimmedSubject,
          summary: trimmedSummary,
          category,
          communicationDate: commDate,
          followUpDate: fuDate,
          followUpNotes: followUpNotes.trim() || undefined,
        });
      }

      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Log Communication" : "Edit Communication"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Record a communication related to estate administration."
                : "Update this communication log entry."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="comm-recipient">Recipient Name</Label>
                <Input
                  id="comm-recipient"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., John Smith"
                  maxLength={255}
                  data-testid="comm-recipient-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comm-org">Organization</Label>
                <Input
                  id="comm-org"
                  value={recipientOrganization}
                  onChange={(e) => setRecipientOrganization(e.target.value)}
                  placeholder="e.g., Chase Bank"
                  data-testid="comm-org-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="comm-email">Email</Label>
                <Input
                  id="comm-email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="email@example.com"
                  data-testid="comm-email-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comm-phone">Phone</Label>
                <Input
                  id="comm-phone"
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  data-testid="comm-phone-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="comm-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as CommunicationCategory)}
                >
                  <SelectTrigger
                    id="comm-category"
                    className="w-full"
                    data-testid="comm-category-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comm-method">Method</Label>
                <Select
                  value={method}
                  onValueChange={(val) => setMethod(val as CommunicationMethod)}
                >
                  <SelectTrigger
                    id="comm-method"
                    className="w-full"
                    data-testid="comm-method-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comm-subject">Subject</Label>
              <Input
                id="comm-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Account closure request"
                maxLength={255}
                data-testid="comm-subject-input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comm-summary">Summary</Label>
              <Textarea
                id="comm-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of the communication..."
                maxLength={5000}
                className="min-h-[80px]"
                data-testid="comm-summary-input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comm-date">Communication Date</Label>
              <Input
                id="comm-date"
                type="date"
                value={communicationDate}
                onChange={(e) => setCommunicationDate(e.target.value)}
                data-testid="comm-date-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="comm-followup-date">Follow-up Date (optional)</Label>
                <Input
                  id="comm-followup-date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  data-testid="comm-followup-date-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comm-followup-notes">Follow-up Notes</Label>
                <Input
                  id="comm-followup-notes"
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="What to follow up on..."
                  data-testid="comm-followup-notes-input"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!recipientName.trim() || !subject.trim() || !summary.trim() || isSubmitting}
              data-testid="comm-form-submit"
            >
              {isSubmitting
                ? mode === "create"
                  ? "Logging..."
                  : "Saving..."
                : mode === "create"
                  ? "Log Communication"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
