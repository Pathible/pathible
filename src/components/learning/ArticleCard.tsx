import { CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ARTICLE_CATEGORY_LABELS, LEGACY_CATEGORY_MAPPING } from "@/convex/shared/categories";

import type { ArticleCardProps } from "./types";

/**
 * Get display label for a category, handling both legacy and new category values
 */
function getCategoryDisplayLabel(category: string): string {
  // Check if it's a legacy category that needs mapping
  if (category in LEGACY_CATEGORY_MAPPING) {
    const newCategory = LEGACY_CATEGORY_MAPPING[category];
    return ARTICLE_CATEGORY_LABELS[newCategory];
  }
  // Check if it's a new category
  if (category in ARTICLE_CATEGORY_LABELS) {
    return ARTICLE_CATEGORY_LABELS[category as keyof typeof ARTICLE_CATEGORY_LABELS];
  }
  // Fallback to the raw category value
  return category;
}

/**
 * Standard article card for desktop layout
 * Shows category badge, title, excerpt, and read time
 */
export function ArticleCard({ article, isRead, accentColor = "primary" }: ArticleCardProps) {
  // Map accent colors to hover border classes
  const hoverBorderClass = {
    primary: "hover:border-primary/40",
    secondary: "hover:border-secondary/40",
    accent: "hover:border-accent/40",
  }[accentColor];

  return (
    <Link href={`/learn/${article.slug}`}>
      <Card
        className={`
          h-full
          transition-all duration-200
          hover:shadow-md ${hoverBorderClass}
          ${isRead ? "opacity-70 bg-muted/30" : "bg-card"}
        `}
      >
        <CardHeader className="pb-2">
          {/* Category & Read Status Row */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs font-normal border-muted-foreground/30">
              {getCategoryDisplayLabel(article.category)}
            </Badge>
            {isRead && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Article read</span>
              </div>
            )}
          </div>

          {/* Title */}
          <CardTitle className="text-lg font-crimson leading-snug line-clamp-2">
            {article.title}
          </CardTitle>

          {/* Excerpt */}
          <CardDescription className="line-clamp-2 mt-1">{article.excerpt}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Read Time */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{article.readTimeMinutes} min read</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
