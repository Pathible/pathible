import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { generatePageMetadata } from "@/lib/seo-config";
import { getPublicArticleSlugs, getStaticArticleBySlug } from "@/lib/static-articles";
import { ArticleContent } from "./ArticleContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static paths for all public articles at build time
 * This enables pre-rendering and better SEO
 */
export async function generateStaticParams() {
  const slugs = getPublicArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata for each article using static data
 * This ensures Google sees proper titles and descriptions
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getStaticArticleBySlug(slug);

  if (!article) {
    return generatePageMetadata({
      title: "Article Not Found",
      description: "The article you're looking for doesn't exist or has been moved.",
      path: `/learn/${slug}`,
    });
  }

  return generatePageMetadata({
    title: `${article.title} | Pathible Learn`,
    description: article.excerpt,
    path: `/learn/${slug}`,
  });
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const staticArticle = getStaticArticleBySlug(slug);

  return (
    <PublicPageLayout>
      {/* Server-rendered SEO content for Google */}
      {staticArticle && (
        <div className="sr-only" aria-hidden="true">
          <h1>{staticArticle.title}</h1>
          <p>{staticArticle.excerpt}</p>
        </div>
      )}
      {/* Client component with full interactive content */}
      <ArticleContent slug={slug} />
    </PublicPageLayout>
  );
}
