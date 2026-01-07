"use client";

import {
  AdvanceDirectivePDFGenerator,
  FinancialPOAPDFGenerator,
  HealthcarePOAPDFGenerator,
  type LegalDocumentPDFData,
  PourOverWillPDFGenerator,
  TrustPDFGenerator,
  WillPDFGenerator,
} from "./pdf-generators";

// Re-export types for backwards compatibility
export type { LegalDocumentPDFData };

// Main export - switches between document types
export function LegalDocumentPDF({ data }: { data: LegalDocumentPDFData }) {
  switch (data.documentType) {
    case "will":
      return <WillPDFGenerator data={data} />;
    case "healthcare_poa":
      return <HealthcarePOAPDFGenerator data={data} />;
    case "financial_poa":
      return <FinancialPOAPDFGenerator data={data} />;
    case "advance_directive":
      return <AdvanceDirectivePDFGenerator data={data} />;
    case "trust":
      return <TrustPDFGenerator data={data} />;
    case "pour_over_will":
      return <PourOverWillPDFGenerator data={data} />;
    default:
      return <WillPDFGenerator data={data} />;
  }
}
