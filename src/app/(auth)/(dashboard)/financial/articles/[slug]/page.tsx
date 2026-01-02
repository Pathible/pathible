"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Clock, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

const CATEGORY_LABELS: Record<string, string> = {
  estate_planning: "Estate Planning",
  financial_planning: "Financial Planning",
  family_legacy: "Family Legacy",
  legal: "Legal",
  insurance: "Insurance",
  digital_legacy: "Digital Legacy",
  end_of_life: "End of Life",
  faith_stewardship: "Faith & Stewardship",
  other: "Other",
};

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const hasIncrementedView = useRef(false);

  const article = useQuery(api.articles.getBySlug, { slug });
  const incrementViewCount = useMutation(api.articles.incrementViewCount);

  // Increment view count once when article loads
  useEffect(() => {
    if (article && !hasIncrementedView.current) {
      hasIncrementedView.current = true;
      incrementViewCount({ id: article._id });
    }
  }, [article, incrementViewCount]);

  if (article === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/financial">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Financial
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground">
              This article may have been removed or is no longer published.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/financial">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Faith & Finances
        </Link>
      </Button>

      {/* Article Header */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {CATEGORY_LABELS[article.category] || article.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{article.readTimeMinutes} min read</span>
            </div>
          </div>
          <h1 className="font-crimson text-3xl md:text-4xl font-semibold leading-tight">
            {article.title}
          </h1>
          <p className="text-lg text-muted-foreground">{article.excerpt}</p>
          {article.publishedAt && (
            <p className="text-sm text-muted-foreground">
              Published{" "}
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Article Content */}
      <Card>
        <CardContent className="py-8">
          <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-crimson prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-blockquote:border-primary prose-blockquote:italic prose-blockquote:text-muted-foreground prose-li:my-1">
            <Markdown>{article.content}</Markdown>
          </article>
        </CardContent>
      </Card>

      {/* Bottom Navigation */}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/financial">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Faith & Finances
          </Link>
        </Button>
      </div>
    </div>
  );
}
