import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { TermsOfServiceContent } from "./content";

export const metadata: Metadata = {
  title: "Terms of Service | Pathible",
  description:
    "Read the Terms of Service for Pathible. Understand your rights and responsibilities when using our family legacy platform.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      effectiveDate="February 16, 2026"
      lastUpdated="February 16, 2026"
      version="1.1"
      type="terms"
    >
      <TermsOfServiceContent />
    </LegalPageLayout>
  );
}
