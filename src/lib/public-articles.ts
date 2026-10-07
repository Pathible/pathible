import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { cache } from "react";

export interface PublicArticleSummary {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTimeMinutes: number;
  featuredImageUrl?: string;
  publishedAt?: number;
  updatedAt: number;
}

export interface PublicArticle extends Omit<PublicArticleSummary, "updatedAt"> {
  content: string;
}

function client(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required to load public articles");
  return new ConvexHttpClient(url);
}

export const getPublicArticle = cache(async (slug: string): Promise<PublicArticle | null> => {
  return client().query(
    makeFunctionReference<"query", { slug: string }, PublicArticle | null>(
      "articles:getPublicBySlug",
    ),
    { slug },
  );
});

export const getPublicArticles = cache(async (): Promise<PublicArticleSummary[]> => {
  return client().query(
    makeFunctionReference<"query", Record<string, never>, PublicArticleSummary[]>(
      "articles:listPublicForDiscovery",
    ),
    {},
  );
});

/** Keep the marketing guide URL usable across the old and new content libraries. */
export const getArticleRedirect = cache(async (slug: string): Promise<string | null> => {
  if (slug !== "the-family-access-map") return null;
  const guide = await getPublicArticle("creating-document-access-map-for-loved-ones");
  return guide ? `/learn/${guide.slug}` : null;
});
