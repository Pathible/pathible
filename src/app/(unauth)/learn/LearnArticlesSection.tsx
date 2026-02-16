"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Article } from "@/components/learning";
import { ArticleCard } from "@/components/learning";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { ARTICLE_CATEGORY_LABELS, LEGACY_CATEGORY_MAPPING } from "@/convex/shared/categories";

function getNormalizedCategory(category: string): string {
  if (category in LEGACY_CATEGORY_MAPPING) {
    return LEGACY_CATEGORY_MAPPING[category];
  }
  return category;
}

export function LearnArticlesSection() {
  const { isSignedIn } = useUser();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const publicArticles = useQuery(api.articles.listPublicArticles, { limit: 50 });
  const readArticlesData = useQuery(api.articles.getUserReadArticles, isSignedIn ? {} : "skip");

  if (publicArticles === undefined) {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  const readArticles = new Set(readArticlesData?.map((a) => a.slug) ?? []);

  const articles: Article[] = publicArticles.map((article) => ({
    _id: article._id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    readTimeMinutes: article.readTimeMinutes,
    featuredImageUrl: article.featuredImageUrl,
    publishedAt: article.publishedAt,
  }));

  // Collect categories that have articles, preserving a stable order
  const categoryOrder: string[] = [];
  const seen = new Set<string>();
  for (const a of articles) {
    const normalized = getNormalizedCategory(a.category);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      categoryOrder.push(normalized);
    }
  }

  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => getNormalizedCategory(a.category) === activeCategory);

  return (
    <>
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                activeCategory === "all"
                  ? "bg-pathible-forest text-white shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              All
            </button>
            {categoryOrder.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                  activeCategory === cat
                    ? "bg-pathible-forest text-white shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                {ARTICLE_CATEGORY_LABELS[cat as keyof typeof ARTICLE_CATEGORY_LABELS] ?? cat}
              </button>
            ))}
          </div>

          {/* Article grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  isRead={readArticles.has(article.slug)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-16">
              No articles in this category yet.
            </p>
          )}
        </div>
      </section>

      {/* CTA for anonymous users - matching homepage emotional tone */}
      {!isSignedIn && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-pathible-forest via-pathible-green-hover to-pathible-forest" />
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03]" />

          <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="font-crimson text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight text-white">
              Your family deserves{" "}
              <span className="relative inline-block">
                <span className="relative z-10">clarity, not chaos.</span>
                <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-pathible-gold/40 rotate-1 rounded-sm" />
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-crimson">
              Create a free account to track your progress and start organizing what matters most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white hover:bg-pathible-sand text-pathible-forest px-10 py-7 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
