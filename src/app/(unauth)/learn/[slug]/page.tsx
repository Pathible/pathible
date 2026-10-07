import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { getArticleRedirect, getPublicArticle } from "@/lib/public-articles";
import { generatePageMetadata } from "@/lib/seo-config";
import { ArticleContent } from "./ArticleContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Metadata and page content read the same live public article.
export const dynamic = "force-dynamic";

const loadArticle = cache(async (slug: string) => {
  const article = await getPublicArticle(slug);
  if (article) return article;
  const destination = await getArticleRedirect(slug);
  if (destination) redirect(destination);
  notFound();
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(slug);

  return generatePageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/learn/${slug}`,
  });
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await loadArticle(slug);

  return (
    <PublicPageLayout>
      <ArticleContent article={article} />
    </PublicPageLayout>
  );
}
