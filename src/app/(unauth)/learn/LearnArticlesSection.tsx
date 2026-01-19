"use client";

import { useQuery } from "convex/react";
import { ArrowRight, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { PublicArticleCard, SubscriberTeaser } from "@/components/learning/public";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  ARTICLE_CATEGORY_LABELS,
  ARTICLE_CATEGORY_VALUES,
  type ArticleCategory,
  categoryToSlug,
  LEGACY_CATEGORY_MAPPING,
} from "@/convex/shared/categories";

const ARTICLES_PER_CATEGORY = 4;

type PublicArticle = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTimeMinutes: number;
  featuredImageUrl?: string;
  publishedAt?: number;
};

/**
 * Get display label for a category, handling both legacy and new category values
 */
function getCategoryDisplayLabel(category: string): string {
  if (category in LEGACY_CATEGORY_MAPPING) {
    const newCategory = LEGACY_CATEGORY_MAPPING[category];
    return ARTICLE_CATEGORY_LABELS[newCategory];
  }
  if (category in ARTICLE_CATEGORY_LABELS) {
    return ARTICLE_CATEGORY_LABELS[category as ArticleCategory];
  }
  return category;
}

/**
 * Normalize a category value (handle legacy values)
 */
function normalizeCategory(category: string): ArticleCategory {
  if (category in LEGACY_CATEGORY_MAPPING) {
    return LEGACY_CATEGORY_MAPPING[category];
  }
  return category as ArticleCategory;
}

/**
 * Group articles by category
 */
function groupArticlesByCategory(articles: PublicArticle[]): Map<ArticleCategory, PublicArticle[]> {
  const grouped = new Map<ArticleCategory, PublicArticle[]>();

  for (const article of articles) {
    const category = normalizeCategory(article.category);
    const existing = grouped.get(category) ?? [];
    existing.push(article);
    grouped.set(category, existing);
  }

  return grouped;
}

interface CategorySectionProps {
  category: ArticleCategory;
  articles: PublicArticle[];
}

function CategorySection({ category, articles }: CategorySectionProps) {
  const displayedArticles = articles.slice(0, ARTICLES_PER_CATEGORY);
  const hasMore = articles.length > ARTICLES_PER_CATEGORY;
  const categorySlug = categoryToSlug(category);

  return (
    <div className="mb-16 last:mb-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-crimson text-2xl sm:text-3xl">{getCategoryDisplayLabel(category)}</h3>
        {hasMore && (
          <Link
            href={`/learn/category/${categorySlug}`}
            className="group flex items-center gap-1 text-sm font-medium text-pathible-forest hover:underline"
          >
            View all {articles.length}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayedArticles.map((article) => (
          <PublicArticleCard key={article._id} article={article} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/learn/category/${categorySlug}`}>
              View all {articles.length} articles
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export function LearnArticlesSection() {
  const publicArticles = useQuery(api.articles.listPublicArticles, {
    limit: 50, // Max limit enforced by backend
  });
  const subscriberPreviews = useQuery(api.articles.listSubscriberArticlePreviews, { limit: 6 });

  const isLoading = publicArticles === undefined || subscriberPreviews === undefined;

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  const hasPublicArticles = publicArticles && publicArticles.length > 0;
  const hasSubscriberArticles = subscriberPreviews && subscriberPreviews.length > 0;

  // Group articles by category
  const groupedArticles = hasPublicArticles ? groupArticlesByCategory(publicArticles) : new Map();

  // Get categories in the preferred order (based on ARTICLE_CATEGORY_VALUES)
  const orderedCategories = ARTICLE_CATEGORY_VALUES.filter(
    (category) => groupedArticles.has(category) && (groupedArticles.get(category)?.length ?? 0) > 0,
  );

  return (
    <>
      {/* Public Articles Section - Grouped by Category */}
      <section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-crimson text-3xl sm:text-4xl mb-4">Learn</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Simple guidance to give your family clarity instead of chaos.
            </p>
          </div>

          {orderedCategories.length > 0 ? (
            orderedCategories.map((category) => (
              <CategorySection
                key={category}
                category={category}
                articles={groupedArticles.get(category) ?? []}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">New articles coming soon. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscriber Articles Preview Section */}
      {hasSubscriberArticles && (
        <section className="py-16 sm:py-24 bg-linear-to-b from-pathible-sand/30 to-background">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-crimson text-3xl sm:text-4xl mb-4">More for Subscribers</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Unlock detailed guides, actionable templates, and advanced planning resources with a
                Pathible subscription.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {subscriberPreviews.map((article) => (
                <SubscriberTeaser key={article._id} article={article} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                asChild
                size="lg"
                className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl px-8"
              >
                <Link href="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Already a subscriber?{" "}
                <Link href="/login" className="text-pathible-forest hover:underline">
                  Sign in to access all content
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-crimson text-3xl sm:text-4xl mb-4">Start Somewhere Today</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Start small. One document. One note. One conversation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl px-8"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
