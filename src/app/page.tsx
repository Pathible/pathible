import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq";
import { ForWhoSection } from "@/components/marketing/for-who";
import { HeroSection } from "@/components/marketing/hero";
import { ThePlan } from "@/components/marketing/how-it-works";
import { TheStakes } from "@/components/marketing/manifesto";
import { ModulesPreview } from "@/components/marketing/modules-preview";
import { GuideSection } from "@/components/marketing/value-pillars";
import { PainSection } from "@/components/marketing/whypathible";
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

      {/* StoryBrand PEACE Narrative Flow */}
      {/* P - Problem: The question that stops them */}
      <HeroSection />
      {/* E - Empathy: Make them feel the chaos */}
      <PainSection />
      {/* A - Answer: The guide shows up */}
      <GuideSection />
      {/* C - Change: The plan + what you get */}
      <ThePlan />
      <ModulesPreview />
      {/* Identity: Who this is for */}
      <ForWhoSection />
      {/* Stakes: What happens if you don't vs if you do */}
      <TheStakes />
      {/* Authority: Answer objections */}
      <FAQSection />
      {/* E - End Result: The emotional close */}
      <CTASection />
    </PublicPageLayout>
  );
}
