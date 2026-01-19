import type { Metadata } from "next";
import { PublicLearningHero } from "@/components/learning/public";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { generatePageMetadata } from "@/lib/seo-config";
import { LearnArticlesSection } from "./LearnArticlesSection";

export const metadata: Metadata = generatePageMetadata({
  title: "Learn - Clarity for your family. Before they need it.",
  description:
    "If you have ever sorted through a loved one’s mess while grieving, you know how brutal the search can be. Learn simple steps to give your family clarity instead of chaos.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <PublicPageLayout>
      <PublicLearningHero />
      <LearnArticlesSection />
    </PublicPageLayout>
  );
}
