/**
 * Estate Export Utilities
 *
 * CSV generation for estate summary data.
 * PDF generation is handled by the React component in estate-pdf-document.tsx
 * using @react-pdf/renderer (same pattern as legacy-pdf-document.tsx).
 */

export interface EstateSummaryData {
  activation: {
    _id: string;
    deceasedName: string;
    dateOfDeath?: number;
    status: string;
    activatedAt: number;
    completedAt?: number;
    notes?: string;
  };
  executorName: string;
  checklistItems: Array<{
    title: string;
    category: string;
    isCompleted: boolean;
    completedAt?: number;
    notes?: string;
    dueDate?: number;
  }>;
  assets: Array<{
    name: string;
    category: string;
    status: string;
    estimatedValue?: number;
    institution?: string;
    beneficiary?: string;
    notes?: string;
  }>;
  communications: Array<{
    recipientName: string;
    recipientOrganization?: string;
    method: string;
    subject: string;
    summary: string;
    category: string;
    communicationDate: number;
    followUpDate?: number;
    followUpCompleted?: boolean;
  }>;
  distributions: Array<{
    beneficiaryName: string;
    beneficiaryRelationship?: string;
    description?: string;
    value?: number;
    distributionDate: number;
    method: string;
    notes?: string;
  }>;
  generatedAt: number;
}

export type ExportSection = "checklist" | "assets" | "communications" | "distributions";

const CATEGORY_LABELS: Record<string, string> = {
  first_things_first: "First Things First",
  legal_and_financial: "Legal & Financial",
  property_and_assets: "Property & Assets",
  notifications: "Notifications",
  ongoing: "Ongoing",
  when_ready: "When Ready",
  custom: "Custom",
  financial_account: "Financial Account",
  real_estate: "Real Estate",
  vehicle: "Vehicle",
  insurance_policy: "Insurance Policy",
  retirement_account: "Retirement Account",
  business_interest: "Business Interest",
  personal_property: "Personal Property",
  digital_asset: "Digital Asset",
  other: "Other",
  financial_institution: "Financial Institution",
  government_agency: "Government Agency",
  insurance_company: "Insurance Company",
  legal: "Legal",
  beneficiary: "Beneficiary",
  utility: "Utility",
  employer: "Employer",
};

const STATUS_LABELS: Record<string, string> = {
  identified: "Identified",
  verified: "Verified",
  institution_contacted: "Institution Contacted",
  in_transfer: "In Transfer",
  closed: "Closed",
  distributed: "Distributed",
  pending: "Pending",
  active: "Active",
  contested: "Contested",
  completed: "Completed",
  cancelled: "Cancelled",
};

const METHOD_LABELS: Record<string, string> = {
  phone: "Phone",
  email: "Email",
  mail: "Mail",
  in_person: "In Person",
  online_portal: "Online Portal",
  fax: "Fax",
  direct_transfer: "Direct Transfer",
  wire_transfer: "Wire Transfer",
  check: "Check",
  title_transfer: "Title Transfer",
  in_kind: "In Kind",
  other: "Other",
};

export function formatLabel(key: string): string {
  return CATEGORY_LABELS[key] ?? STATUS_LABELS[key] ?? METHOD_LABELS[key] ?? key;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function csvRow(values: string[]): string {
  return values.map(escapeCSV).join(",");
}

/**
 * Generate a CSV string from estate summary data.
 * Creates separate sections for each data type with headers.
 */
export function generateEstateCSV(data: EstateSummaryData, sections: ExportSection[]): string {
  const lines: string[] = [];

  // Header
  lines.push(csvRow(["Estate Summary Report"]));
  lines.push(csvRow(["Estate of", data.activation.deceasedName]));
  lines.push(csvRow(["Executor", data.executorName]));
  lines.push(csvRow(["Status", formatLabel(data.activation.status)]));
  if (data.activation.dateOfDeath) {
    lines.push(csvRow(["Date of Death", formatDate(data.activation.dateOfDeath)]));
  }
  lines.push(csvRow(["Activated", formatDate(data.activation.activatedAt)]));
  lines.push(csvRow(["Generated", formatDate(data.generatedAt)]));
  lines.push("");

  if (sections.includes("checklist") && data.checklistItems.length > 0) {
    lines.push(csvRow(["CHECKLIST"]));
    lines.push(csvRow(["Title", "Category", "Status", "Completed Date", "Due Date", "Notes"]));
    for (const item of data.checklistItems) {
      lines.push(
        csvRow([
          item.title,
          formatLabel(item.category),
          item.isCompleted ? "Complete" : "Pending",
          item.completedAt ? formatDate(item.completedAt) : "",
          item.dueDate ? formatDate(item.dueDate) : "",
          item.notes ?? "",
        ]),
      );
    }
    lines.push("");
  }

  if (sections.includes("assets") && data.assets.length > 0) {
    lines.push(csvRow(["ASSETS"]));
    lines.push(
      csvRow([
        "Name",
        "Category",
        "Status",
        "Estimated Value",
        "Institution",
        "Beneficiary",
        "Notes",
      ]),
    );
    for (const asset of data.assets) {
      lines.push(
        csvRow([
          asset.name,
          formatLabel(asset.category),
          formatLabel(asset.status),
          asset.estimatedValue != null ? formatCurrency(asset.estimatedValue) : "",
          asset.institution ?? "",
          asset.beneficiary ?? "",
          asset.notes ?? "",
        ]),
      );
    }
    lines.push("");
  }

  if (sections.includes("communications") && data.communications.length > 0) {
    lines.push(csvRow(["COMMUNICATIONS"]));
    lines.push(
      csvRow([
        "Date",
        "Recipient",
        "Organization",
        "Method",
        "Category",
        "Subject",
        "Summary",
        "Follow-Up Date",
        "Follow-Up Complete",
      ]),
    );
    for (const comm of data.communications) {
      lines.push(
        csvRow([
          formatDate(comm.communicationDate),
          comm.recipientName,
          comm.recipientOrganization ?? "",
          formatLabel(comm.method),
          formatLabel(comm.category),
          comm.subject,
          comm.summary,
          comm.followUpDate ? formatDate(comm.followUpDate) : "",
          comm.followUpCompleted ? "Yes" : comm.followUpDate ? "No" : "",
        ]),
      );
    }
    lines.push("");
  }

  if (sections.includes("distributions") && data.distributions.length > 0) {
    lines.push(csvRow(["DISTRIBUTIONS"]));
    lines.push(
      csvRow(["Date", "Beneficiary", "Relationship", "Description", "Value", "Method", "Notes"]),
    );
    for (const dist of data.distributions) {
      lines.push(
        csvRow([
          formatDate(dist.distributionDate),
          dist.beneficiaryName,
          dist.beneficiaryRelationship ?? "",
          dist.description ?? "",
          dist.value != null ? formatCurrency(dist.value) : "",
          formatLabel(dist.method),
          dist.notes ?? "",
        ]),
      );
    }
    lines.push("");
  }

  lines.push(csvRow(["Generated by Pathible - not legal advice"]));

  return lines.join("\n");
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
