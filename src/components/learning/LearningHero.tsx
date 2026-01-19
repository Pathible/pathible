import { ArrowRight, BookOpen, CheckCircle, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { LearningHeroProps } from "./types";

/**
 * Hero section for the Learning Resources page
 * Features a prominent "Start Here" article and simple progress indicator
 */
export function LearningHero({ featuredArticle, totalArticles, readCount }: LearningHeroProps) {
  return (
    <section className="mb-12">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-crimson">Faith & Finances</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Biblical wisdom for building a legacy that honors God and blesses your family. Take your
          time - these resources are here whenever you are ready.
        </p>
      </div>

      {/* Featured "Start Here" Card */}
      <Link href={`/financial/articles/${featuredArticle.slug}`}>
        <Card
          className={`
            relative overflow-hidden
            bg-linear-to-br from-primary/5 via-transparent to-accent/5
            border-primary/20
            hover:border-primary/40 hover:shadow-lg
            transition-all duration-300
            ${featuredArticle.isRead ? "opacity-80" : ""}
          `}
        >
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-0 font-medium">
                <Sparkles className="h-3 w-3 mr-1" />
                Start Here
              </Badge>
              {featuredArticle.isRead && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-primary" aria-hidden="true" />
                  <span>Read</span>
                </span>
              )}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-crimson leading-tight">
              {featuredArticle.title}
            </CardTitle>
            <CardDescription className="text-base mt-2 leading-relaxed">
              {featuredArticle.excerpt}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{featuredArticle.readTimeMinutes} min read</span>
              </div>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary hover:bg-primary/10"
              >
                Begin Reading
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Simple Progress Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          You have read <span className="font-medium text-foreground">{readCount}</span> of{" "}
          <span className="font-medium text-foreground">{totalArticles}</span> articles
          <span className="sr-only">. {totalArticles - readCount} remaining.</span>
        </p>
      </div>
    </section>
  );
}
