import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq";
import { ForWhoSection } from "@/components/marketing/for-who";
import { HeroSection } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Manifesto } from "@/components/marketing/manifesto";
import { ModulesPreview } from "@/components/marketing/modules-preview";
import { WhyPathible } from "@/components/marketing/whypathible";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/lib/seo-config";

export default function Index() {
  return (
    <PublicPageLayout>
      {/* JSON-LD Structured Data for SEO and AI discoverability */}
      <JsonLd
        data={[organizationSchema, websiteSchema, softwareApplicationSchema, faqPageSchema]}
      />

      <HeroSection />
      <WhyPathible />
      <HowItWorks />
      <ForWhoSection />
      <ModulesPreview />
      <Manifesto />
      <FAQSection />
      <CTASection />
    </PublicPageLayout>
  );
}
