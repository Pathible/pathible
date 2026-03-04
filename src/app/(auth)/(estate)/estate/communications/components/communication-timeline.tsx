"use client";

import { Badge } from "@/components/ui/badge";
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

interface Communication {
  _id: Id<"estateCommunications">;
  recipientName: string;
  recipientOrganization?: string;
  method: CommunicationMethod;
  subject: string;
  summary: string;
  category: CommunicationCategory;
  communicationDate: number;
}

const METHOD_LABELS: Record<CommunicationMethod, string> = {
  phone: "Phone",
  email: "Email",
  mail: "Mail",
  in_person: "In Person",
  online_portal: "Online Portal",
  fax: "Fax",
  other: "Other",
};

const CATEGORY_LABELS: Record<CommunicationCategory, string> = {
  financial_institution: "Financial Institution",
  government_agency: "Government Agency",
  insurance_company: "Insurance Company",
  legal: "Legal",
  beneficiary: "Beneficiary",
  utility: "Utility",
  employer: "Employer",
  other: "Other",
};

interface CommunicationTimelineProps {
  communications: Communication[];
}

export function CommunicationTimeline({ communications }: CommunicationTimelineProps) {
  if (communications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="comm-timeline-empty">
        No communications to display.
      </div>
    );
  }

  // Group by date
  const grouped = new Map<string, Communication[]>();
  for (const comm of communications) {
    const dateKey = new Date(comm.communicationDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const list = grouped.get(dateKey) ?? [];
    list.push(comm);
    grouped.set(dateKey, list);
  }

  return (
    <div className="space-y-6" data-testid="communication-timeline">
      {Array.from(grouped.entries()).map(([dateLabel, comms]) => (
        <div key={dateLabel}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{dateLabel}</h3>
          <div className="relative ml-3 border-l-2 border-border pl-6 space-y-4">
            {comms.map((comm) => (
              <div key={comm._id} className="relative" data-testid={`timeline-entry-${comm._id}`}>
                <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{comm.recipientName}</span>
                    {comm.recipientOrganization && (
                      <span className="text-xs text-muted-foreground">
                        ({comm.recipientOrganization})
                      </span>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {METHOD_LABELS[comm.method]}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{comm.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{comm.summary}</p>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[comm.category]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
