"use client";

import { useQuery } from "convex/react";
import { Blocks, Heart, Loader2, Sparkles } from "lucide-react";
import type { Article, Stage } from "@/components/learning";
import {
  EncouragingMessage,
  LearningHero,
  LearningStages,
  LearningStagesMobile,
} from "@/components/learning";
import { api } from "@/convex/_generated/api";

/**
 * Category to stage mapping
 * Stage 1 (Understanding): faith_stewardship, other
 * Stage 2 (Building): estate_planning, financial_planning, legal
 * Stage 3 (Strengthening): family_legacy, digital_legacy, insurance, end_of_life
 */
const CATEGORY_TO_STAGE: Record<string, number> = {
  faith_stewardship: 1,
  other: 1,
  estate_planning: 2,
  financial_planning: 2,
  legal: 2,
  family_legacy: 3,
  digital_legacy: 3,
  insurance: 3,
  end_of_life: 3,
};

/**
 * Stage configuration with icons and colors
 */
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

/**
 * Default featured article when none exists in database
 */
const DEFAULT_FEATURED_ARTICLE = {
  title: "The Gift of Clarity: Why Your Family Needs a Legacy Plan",
  excerpt:
    "Discover how thoughtful planning is one of the greatest acts of love you can give your family. This foundational guide will help you understand the 'why' behind legacy planning.",
  readTimeMinutes: 5,
  slug: "gift-of-clarity",
};

/**
 * Organize articles into stages based on their category
 */
function organizeArticlesIntoStages(articles: Article[]): Stage[] {
  // Group articles by stage
  const stageArticles: Record<number, Article[]> = {
    1: [],
    2: [],
    3: [],
  };

  for (const article of articles) {
    const stageNumber = CATEGORY_TO_STAGE[article.category] ?? 1;
    stageArticles[stageNumber].push(article);
  }

  // Build stage objects with articles
  return STAGE_CONFIG.map((config) => ({
    ...config,
    articles: stageArticles[config.number] || [],
  }));
}

/**
 * Find the featured article from the list
 * Shows "gift-of-clarity" first, then progresses to unread articles as user completes them
 * Follows the stage order: Stage 1 -> Stage 2 -> Stage 3
 */
function findFeaturedArticle(articles: Article[], readArticles: Set<string>): Article | null {
  // Primary article - show first if not read
  const giftOfClarity = articles.find((a) => a.slug === "gift-of-clarity");
  if (giftOfClarity && !readArticles.has(giftOfClarity.slug)) {
    return giftOfClarity;
  }

  // Group articles by stage for ordered progression
  const stageOrder = [1, 2, 3];
  for (const stageNum of stageOrder) {
    // Get articles for this stage
    const stageArticles = articles.filter((a) => {
      const articleStage = CATEGORY_TO_STAGE[a.category] ?? 1;
      return articleStage === stageNum;
    });

    // Find first unread article in this stage
    const unreadArticle = stageArticles.find((a) => !readArticles.has(a.slug));
    if (unreadArticle) {
      return unreadArticle;
    }
  }

  // All articles read - show the primary article again (or first article)
  return giftOfClarity || articles[0] || null;
}

export function LearningCenter() {
  // Fetch all published articles from the database
  const articles = useQuery(api.articles.listPublished, {
    limit: 50, // Get more articles for organizing into stages
  });

  // Fetch user's read articles
  const readArticlesData = useQuery(api.articles.getUserReadArticles, {});

  // Build set of read article slugs
  const readArticles = new Set(readArticlesData?.map((a) => a.slug) ?? []);

  // Loading state
  if (articles === undefined || readArticlesData === undefined) {
    return (
      <div className="flex items-center justify-center py-24" data-tour="learning-center-header">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Transform API response to Article type
  const typedArticles: Article[] = articles.map((article) => ({
    _id: article._id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    readTimeMinutes: article.readTimeMinutes,
    featuredImageUrl: article.featuredImageUrl,
    publishedAt: article.publishedAt,
  }));

  // Find featured article (progresses as user reads) and organize stages
  const featuredArticle = findFeaturedArticle(typedArticles, readArticles);

  // Filter out the featured article from stage articles to avoid duplication
  const stageArticles = featuredArticle
    ? typedArticles.filter((a) => a.slug !== featuredArticle.slug)
    : typedArticles;

  const stages = organizeArticlesIntoStages(stageArticles);

  // Calculate totals
  const totalArticles =
    stages.reduce((sum, stage) => sum + stage.articles.length, 0) + (featuredArticle ? 1 : 0);
  const readCount = readArticles.size;

  // Build featured article props
  const featuredArticleProps = featuredArticle
    ? {
        title: featuredArticle.title,
        excerpt: featuredArticle.excerpt,
        readTimeMinutes: featuredArticle.readTimeMinutes,
        slug: featuredArticle.slug,
        isRead: readArticles.has(featuredArticle.slug),
      }
    : {
        ...DEFAULT_FEATURED_ARTICLE,
        isRead: false,
      };

  // Check if we have any articles to display
  const hasArticles = totalArticles > 0;

  return (
    <div className="space-y-6" data-tour="learning-center-header">
      {/* Hero with Featured Article */}
      <LearningHero
        featuredArticle={featuredArticleProps}
        totalArticles={hasArticles ? totalArticles : 8} // Show placeholder count when empty
        readCount={readCount}
      />

      {hasArticles ? (
        <>
          {/* Desktop Stages */}
          <div className="hidden md:block" data-tour="learning-resources-section">
            <LearningStages stages={stages} readArticles={readArticles} />
          </div>

          {/* Mobile Accordion Stages */}
          <div className="md:hidden" data-tour="learning-resources-section">
            <LearningStagesMobile stages={stages} readArticles={readArticles} />
          </div>
        </>
      ) : (
        // Empty state - stages will appear as articles are published
        <div
          className="text-center py-12 text-muted-foreground"
          data-tour="learning-resources-section"
        >
          <p className="text-lg mb-2">Articles are being prepared for you.</p>
          <p className="text-sm">
            Check back soon for faith-centered resources on legacy planning.
          </p>
        </div>
      )}

      {/* Encouraging Footer Message */}
      <div
        className="mt-16 pt-8 border-t border-border/50"
        data-tour="stewardship-principles-section"
      >
        <EncouragingMessage />
      </div>
    </div>
  );
}
