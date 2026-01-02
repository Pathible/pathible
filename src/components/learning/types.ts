import type { LucideIcon } from "lucide-react";

/**
 * Article data structure as returned from the Convex API
 */
export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTimeMinutes: number;
  featuredImageUrl?: string;
  publishedAt?: number;
}

/**
 * Stage configuration for organizing articles by journey phase
 */
export interface Stage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accentColor: "primary" | "secondary" | "accent";
  articles: Article[];
}

/**
 * Featured article for the hero section
 */
export interface FeaturedArticle {
  title: string;
  excerpt: string;
  readTimeMinutes: number;
  slug: string;
  isRead: boolean;
}

/**
 * Props for the LearningHero component
 */
export interface LearningHeroProps {
  featuredArticle: FeaturedArticle;
  totalArticles: number;
  readCount: number;
}

/**
 * Props for stage-based layouts
 */
export interface LearningStagesProps {
  stages: Stage[];
  readArticles: Set<string>;
}

/**
 * Props for individual article cards
 */
export interface ArticleCardProps {
  article: Article;
  isRead: boolean;
  accentColor?: "primary" | "secondary" | "accent";
}

/**
 * Props for compact article cards (mobile)
 */
export interface ArticleCardCompactProps {
  article: Pick<Article, "slug" | "title" | "readTimeMinutes">;
  isRead: boolean;
}
