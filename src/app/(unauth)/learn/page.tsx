import type { Metadata } from "next";
import { PublicLearningHero } from "@/components/learning/public";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { getPublicArticles } from "@/lib/public-articles";
import { generatePageMetadata } from "@/lib/seo-config";
import { LearnArticlesSection } from "./LearnArticlesSection";

export const metadata: Metadata = generatePageMetadata({
  title: "Learn - Family Legacy Planning Guides & Resources",
  description:
    "Free guides and checklists for family legacy planning, estate organization, and protecting your loved ones from chaos. Learn how to get your affairs in order.",
  path: "/learn",
});

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const articles = await getPublicArticles();
  return (
    <PublicPageLayout>
      <PublicLearningHero />
      <LearnArticlesSection articles={articles} />
    </PublicPageLayout>
  );
}
