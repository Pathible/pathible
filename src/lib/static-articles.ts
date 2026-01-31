/**
 * Static article data for server-side rendering and SEO
 *
 * This exports article metadata from the seed data for use in:
 * - generateStaticParams (pre-generating article routes)
 * - generateMetadata (proper SEO titles and descriptions)
 * - Server-side initial content rendering
 *
 * Keep this in sync with convex/seeds/articles.ts
 */

import { articleSeedData } from "@/convex/seeds/articles";

export interface StaticArticle {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTimeMinutes: number;
  visibility: "public" | "subscribers";
}

/**
 * Get all public article slugs for static generation
 */
export function getPublicArticleSlugs(): string[] {
  return articleSeedData
    .filter((article) => article.visibility === "public" && article.status === "published")
    .map((article) => article.slug);
}

/**
 * Get static article data by slug
 */
export function getStaticArticleBySlug(slug: string): StaticArticle | null {
  const article = articleSeedData.find((a) => a.slug === slug && a.status === "published");

  if (!article) return null;

  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    readTimeMinutes: article.readTimeMinutes,
    visibility: article.visibility,
  };
}

/**
 * Get all public articles for the /learn page
 */
export function getPublicArticles(): StaticArticle[] {
  return articleSeedData
    .filter((article) => article.visibility === "public" && article.status === "published")
    .map((article) => ({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      readTimeMinutes: article.readTimeMinutes,
      visibility: article.visibility,
    }));
}
