import { ExecutorCrossLink } from "@/components/marketing/executor/executor-cross-link";
import { ExecutorCTA } from "@/components/marketing/executor/executor-cta";
import { ExecutorFAQ } from "@/components/marketing/executor/executor-faq";
import { ExecutorFeatures } from "@/components/marketing/executor/executor-features";
import { ExecutorForWho } from "@/components/marketing/executor/executor-for-who";
import { ExecutorGuide } from "@/components/marketing/executor/executor-guide";
import { ExecutorHero } from "@/components/marketing/executor/executor-hero";
import { ExecutorHowItWorks } from "@/components/marketing/executor/executor-how-it-works";
import { ExecutorPain } from "@/components/marketing/executor/executor-pain";
import { ExecutorStakes } from "@/components/marketing/executor/executor-stakes";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { EXECUTOR_FAQ_ITEMS, SEO_CONFIG } from "@/lib/seo-config";

const executorFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: EXECUTOR_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const executorBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SEO_CONFIG.baseUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "For Executors",
      item: `${SEO_CONFIG.baseUrl}/for-executors`,
    },
  ],
};

export default function ForExecutorsPage() {
  return (
    <PublicPageLayout>
      <JsonLd data={[executorFaqSchema, executorBreadcrumbSchema]} />

      {/* GRACE Narrative Flow */}
      {/* G - Grief: The moment that changes everything */}
      <ExecutorHero />
      {/* R - Reality: The overwhelm hits */}
      <ExecutorPain />
      {/* A - Authority: A guide who understands */}
      <ExecutorGuide />
      {/* C - Clarity: How it works + what you get */}
      <ExecutorHowItWorks />
      <ExecutorFeatures />
      {/* E - Empathy: Who this is for */}
      <ExecutorForWho />
      {/* Stakes: What happens without help */}
      <ExecutorStakes />
      {/* FAQ: Answer objections */}
      <ExecutorFAQ />
      {/* CTA: The emotional close */}
      <ExecutorCTA />
      {/* Cross-link back to planning */}
      <ExecutorCrossLink />
    </PublicPageLayout>
  );
}
