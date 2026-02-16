"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowRight, Blocks, BookOpen, Heart, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Article, Stage } from "@/components/learning";
import {
  EncouragingMessage,
  LearningHero,
  LearningStages,
  LearningStagesMobile,
} from "@/components/learning";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

/**
 * Category to stage mapping
 * Supports both legacy and new category values for backward compatibility
 */
const CATEGORY_TO_STAGE: Record<string, number> = {
  // New category values
  beliefs_values: 1,
  more: 1,
  family_planning: 2,
  financial_clarity: 2,
  legal_basics: 2,
  family_legacy: 3,
  digital_access: 3,
  insurance_essentials: 3,
  after_loss: 3,
  // Legacy category values
  faith_stewardship: 1,
  other: 1,
  estate_planning: 2,
  financial_planning: 2,
  legal: 2,
  digital_legacy: 3,
  insurance: 3,
  end_of_life: 3,
};

const STAGE_CONFIG: Omit<Stage, "articles">[] = [
  {
    id: "understanding",
    number: 1,
    title: "Understanding Your Why",
    subtitle: "Building the right mindset",
    icon: Heart,
    accentColor: "primary",
  },
  {
    id: "building",
    number: 2,
    title: "Building Your Foundation",
    subtitle: "Practical steps forward",
    icon: Blocks,
    accentColor: "secondary",
  },
  {
    id: "strengthening",
    number: 3,
    title: "Strengthening Your Legacy",
    subtitle: "Advanced planning & relationships",
    icon: Sparkles,
    accentColor: "accent",
  },
];

const DEFAULT_FEATURED_ARTICLE = {
  title: "The Gift of Clarity: Why Your Family Needs a Legacy Plan",
  excerpt:
    "Discover how thoughtful planning is one of the greatest acts of love you can give your family. This foundational guide will help you understand the 'why' behind legacy planning.",
  readTimeMinutes: 5,
  slug: "gift-of-clarity",
};

function organizeArticlesIntoStages(articles: Article[]): Stage[] {
  const stageArticles: Record<number, Article[]> = { 1: [], 2: [], 3: [] };

  for (const article of articles) {
    const stageNumber = CATEGORY_TO_STAGE[article.category] ?? 1;
    stageArticles[stageNumber].push(article);
  }

  return STAGE_CONFIG.map((config) => ({
    ...config,
    articles: stageArticles[config.number] || [],
  }));
}

function findFeaturedArticle(articles: Article[], readArticles: Set<string>): Article | null {
  const giftOfClarity = articles.find((a) => a.slug === "gift-of-clarity");
  if (giftOfClarity && !readArticles.has(giftOfClarity.slug)) {
    return giftOfClarity;
  }

  for (const stageNum of [1, 2, 3]) {
    const stageArticles = articles.filter((a) => (CATEGORY_TO_STAGE[a.category] ?? 1) === stageNum);
    const unreadArticle = stageArticles.find((a) => !readArticles.has(a.slug));
    if (unreadArticle) return unreadArticle;
  }

  return giftOfClarity || articles[0] || null;
}

export function LearnArticlesSection() {
  const { isSignedIn } = useUser();

  const publicArticles = useQuery(api.articles.listPublicArticles, { limit: 50 });
  const readArticlesData = useQuery(api.articles.getUserReadArticles, isSignedIn ? {} : "skip");

  const isLoading = publicArticles === undefined;

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  const readArticles = new Set(readArticlesData?.map((a) => a.slug) ?? []);

  const typedArticles: Article[] = publicArticles.map((article) => ({
    _id: article._id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    readTimeMinutes: article.readTimeMinutes,
    featuredImageUrl: article.featuredImageUrl,
    publishedAt: article.publishedAt,
  }));

  const featuredArticle = findFeaturedArticle(typedArticles, readArticles);

  const stageArticles = featuredArticle
    ? typedArticles.filter((a) => a.slug !== featuredArticle.slug)
    : typedArticles;

  const stages = organizeArticlesIntoStages(stageArticles);

  const totalArticles =
    stages.reduce((sum, stage) => sum + stage.articles.length, 0) + (featuredArticle ? 1 : 0);
  const readCount = readArticles.size;

  const featuredArticleProps = featuredArticle
    ? {
        title: featuredArticle.title,
        excerpt: featuredArticle.excerpt,
        readTimeMinutes: featuredArticle.readTimeMinutes,
        slug: featuredArticle.slug,
        isRead: readArticles.has(featuredArticle.slug),
      }
    : { ...DEFAULT_FEATURED_ARTICLE, isRead: false };

  const hasArticles = totalArticles > 0;

  return (
    <>
      <section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LearningHero
            featuredArticle={featuredArticleProps}
            totalArticles={hasArticles ? totalArticles : 8}
            readCount={readCount}
          />

          {hasArticles ? (
            <>
              <div className="hidden md:block">
                <LearningStages stages={stages} readArticles={readArticles} />
              </div>
              <div className="md:hidden">
                <LearningStagesMobile stages={stages} readArticles={readArticles} />
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">New articles coming soon. Check back later!</p>
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-border/50">
            <EncouragingMessage />
          </div>
        </div>
      </section>

      {/* CTA for anonymous users */}
      {!isSignedIn && (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-crimson text-3xl sm:text-4xl mb-4">Start Your Journey Today</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Create a free account to track your reading progress and access all of Pathible's
              legacy planning tools.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl px-8"
              >
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/pricing">View Plans</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
