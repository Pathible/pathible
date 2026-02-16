"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, BookOpen, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
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

interface ArticleContentProps {
  slug: string;
}

export function ArticleContent({ slug }: ArticleContentProps) {
  const article = useQuery(api.articles.getPublicBySlug, { slug });
  const incrementPublicViewCount = useMutation(api.articles.incrementPublicViewCount);
  const hasTrackedView = useRef(false);

  // Track article view once when article loads
  useEffect(() => {
    if (article && !hasTrackedView.current) {
      hasTrackedView.current = true;

      // Increment view count in Convex (for internal analytics)
      // Fire-and-forget with error suppression - analytics shouldn't break the app
      incrementPublicViewCount({ slug }).catch(() => {
        // Silently ignore - view tracking is non-critical
      });

      // Track in PostHog (for detailed analytics)
      try {
        posthog.capture("article_viewed", {
          article_slug: slug,
          article_title: article.title,
          article_category: article.category,
          read_time_minutes: article.readTimeMinutes,
        });
      } catch {
        // Silently ignore - analytics shouldn't break the app
      }
    }
  }, [article, slug, incrementPublicViewCount]);

  if (article === undefined) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
          <h1 className="font-crimson text-3xl mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link href="/learn">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learn
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/learn"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-pathible-forest transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learn
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="text-xs font-normal">
              {getCategoryDisplayLabel(article.category)}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{article.readTimeMinutes} min read</span>
            </div>
          </div>

          <h1 className="font-crimson text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">{article.excerpt}</p>
        </header>

        {/* Featured Image */}
        {article.featuredImageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden relative aspect-video">
            <Image
              src={article.featuredImageUrl}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-crimson prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-pathible-forest prose-a:no-underline hover:prose-a:underline prose-li:text-foreground/90 prose-strong:text-foreground prose-hr:border-pathible-sage/30">
          <ReactMarkdown
            components={{
              // Skip H1 rendering since title is already displayed in the header
              h1: () => null,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-pathible-sage/20 text-center">
          <p className="text-muted-foreground mb-4">Want more resources like this?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/learn">Explore More Articles</Link>
            </Button>
            <Button
              asChild
              className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl"
            >
              <Link href="/signup">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
