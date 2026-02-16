import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { ARTICLE_CATEGORY_LABELS, LEGACY_CATEGORY_MAPPING } from "@/convex/shared/categories";

import type { ArticleCardProps } from "./types";

function getCategoryDisplayLabel(category: string): string {
  if (category in LEGACY_CATEGORY_MAPPING) {
    const newCategory = LEGACY_CATEGORY_MAPPING[category];
    return ARTICLE_CATEGORY_LABELS[newCategory];
  }
  if (category in ARTICLE_CATEGORY_LABELS) {
    return ARTICLE_CATEGORY_LABELS[category as keyof typeof ARTICLE_CATEGORY_LABELS];
  }
  return category;
}

export function ArticleCard({ article, isRead }: ArticleCardProps) {
  return (
    <Link
      href={`/learn/${article.slug}`}
      className={`group relative block rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-pathible-forest/5 hover:-translate-y-0.5 ${
        isRead ? "opacity-65" : ""
      }`}
    >
      {/* Left accent line on hover */}
      <div className="absolute top-4 bottom-4 left-0 w-1 rounded-full bg-pathible-gold/0 group-hover:bg-pathible-gold/60 transition-all duration-300" />

      {/* Category + read indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-pathible-forest/60">
          {getCategoryDisplayLabel(article.category)}
        </span>
        {isRead && <CheckCircle className="h-4 w-4 text-pathible-forest/50" aria-label="Read" />}
      </div>

      {/* Title */}
      <h3 className="font-crimson text-xl leading-snug mb-2 group-hover:text-pathible-forest transition-colors duration-200">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5">
        {article.excerpt}
      </p>

      {/* Footer: read time + arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Clock className="h-3.5 w-3.5" />
          <span>{article.readTimeMinutes} min read</span>
        </div>
        <ArrowRight className="h-4 w-4 text-pathible-forest/0 group-hover:text-pathible-forest/60 transition-all duration-200 -translate-x-2 group-hover:translate-x-0" />
      </div>
    </Link>
  );
}
