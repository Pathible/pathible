import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ARTICLE_CATEGORY_LABELS,
  type ArticleCategory,
  LEGACY_CATEGORY_MAPPING,
} from "@/convex/shared/categories";

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

interface PublicArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    readTimeMinutes: number;
    featuredImageUrl?: string;
  };
}

export function PublicArticleCard({ article }: PublicArticleCardProps) {
  return (
    <Link href={`/learn/${article.slug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-pathible-forest/40 bg-card group">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs font-normal border-muted-foreground/30">
              {getCategoryDisplayLabel(article.category)}
            </Badge>
          </div>

          <CardTitle className="text-lg font-crimson leading-snug line-clamp-2 group-hover:text-pathible-forest transition-colors">
            {article.title}
          </CardTitle>

          <CardDescription className="line-clamp-2 mt-1">{article.excerpt}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readTimeMinutes} min read</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-pathible-forest group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
