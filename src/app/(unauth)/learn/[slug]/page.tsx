import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { generatePageMetadata } from "@/lib/seo-config";
import { ArticleContent } from "./ArticleContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Generate basic metadata - could be enhanced with actual article data
  return generatePageMetadata({
    title: "Learn - Faith & Finances",
    description: "Biblical wisdom for building a legacy that honors God and blesses your family.",
    path: `/learn/${slug}`,
  });
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <PublicPageLayout>
      <ArticleContent slug={slug} />
    </PublicPageLayout>
  );
}
