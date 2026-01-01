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
      effectiveDate="January 1, 2026"
      lastUpdated="December 14, 2025"
      version="1.0"
      type="privacy"
    >
      <PrivacyPolicyContent />
    </LegalPageLayout>
  );
}
