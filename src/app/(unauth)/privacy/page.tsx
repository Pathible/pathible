import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { PrivacyPolicyContent } from "./content";

export const metadata: Metadata = {
  title: "Privacy Policy | Pathible",
  description:
    "Learn how Pathible collects, uses, and protects your personal information. Your privacy is our priority.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      effectiveDate="February 16, 2026"
      lastUpdated="February 16, 2026"
      version="1.1"
      type="privacy"
    >
      <PrivacyPolicyContent />
    </LegalPageLayout>
  );
}
