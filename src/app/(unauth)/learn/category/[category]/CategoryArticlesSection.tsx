"use client";

import { useQuery } from "convex/react";
import { BookOpen, Loader2 } from "lucide-react";
import { PublicArticleCard } from "@/components/learning/public";
import { api } from "@/convex/_generated/api";
import type { ArticleCategory } from "@/convex/shared/categories";

interface CategoryArticlesSectionProps {
  category: ArticleCategory;
}

export function CategoryArticlesSection({ category }: CategoryArticlesSectionProps) {
  const articles = useQuery(api.articles.listPublicArticles, {
    category,
    limit: 100,
  });

  const isLoading = articles === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-2xl">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No articles in this category yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <PublicArticleCard key={article._id} article={article} />
      ))}
    </div>
  );
}
