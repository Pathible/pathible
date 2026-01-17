import type { Metadata } from "next";
import { PublicLearningHero } from "@/components/learning/public";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { generatePageMetadata } from "@/lib/seo-config";
import { LearnArticlesSection } from "./LearnArticlesSection";

export const metadata: Metadata = generatePageMetadata({
  title: "Learn - Faith & Finances",
  description:
    "Biblical wisdom for building a legacy that honors God and blesses your family. Free educational resources on estate planning, financial stewardship, and family legacy.",
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
