"use client";

import { useQuery } from "convex/react";
import { BookOpen, Clock, Heart, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ComingSoonBadge } from "@/components/coming-soon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function LearningCenter() {
  // Fetch all published articles from the database
  const articles = useQuery(api.articles.listPublished, {
    limit: 12,
  });

  const principles = [
    {
      title: "Everything Belongs to God",
      verse: "The earth is the Lord's, and everything in it. - Psalm 24:1",
      description: "We are stewards, not owners, of all God has entrusted to us.",
    },
    {
      title: "Generosity Reflects God's Heart",
      verse: "Give, and it will be given to you. - Luke 6:38",
      description: "Generous giving is a way to participate in God's work in the world.",
    },
    {
      title: "Plan Wisely for Tomorrow",
      verse: "The prudent see danger and take refuge. - Proverbs 27:12",
      description: "Planning and preparation honor God and protect your family.",
    },
  ];

  const quotes = [
    {
      text: "For where your treasure is, there your heart will be also.",
      reference: "Matthew 6:21",
    },
    {
      text: "Honor the Lord with your wealth, with the firstfruits of all your crops.",
      reference: "Proverbs 3:9",
    },
    {
      text: "Whoever can be trusted with very little can also be trusted with much.",
      reference: "Luke 16:10",
    },
  ];

  const hasArticles = articles && articles.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card data-tour="learning-center-header">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Faith & Finances</CardTitle>
            {!hasArticles && <ComingSoonBadge size="sm" />}
          </div>
          <CardDescription className="text-base">
            {hasArticles
              ? "Explore biblical principles for managing money and building a legacy of faith."
              : "Explore biblical principles for managing money and building a legacy of faith. Full articles and resources are coming soon."}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Learning Articles */}
      <div data-tour="learning-resources-section">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Learning Resources</h2>
        </div>

        {articles === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasArticles ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link key={article._id} href={`/financial/articles/${article.slug}`}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="text-xs text-primary font-medium mb-2">
                      {CATEGORY_LABELS[article.category] || article.category}
                    </div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTimeMinutes} min read</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder articles when none exist */}
            {[
              {
                title: "Biblical Principles of Stewardship",
                description: "Understanding God's view of money and possessions through Scripture",
                category: "Faith & Money",
                readTime: "5 min read",
              },
              {
                title: "Giving with Purpose",
                description: "How to create a giving plan that aligns with your faith values",
                category: "Generosity",
                readTime: "4 min read",
              },
              {
                title: "Planning for Your Family's Future",
                description: "Estate planning through the lens of biblical wisdom",
                category: "Legacy Planning",
                readTime: "7 min read",
              },
            ].map((article) => (
              <Card key={article.title} className="opacity-75">
                <CardHeader>
                  <div className="text-xs text-primary font-medium mb-2">{article.category}</div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{article.readTime}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Stewardship Principles */}
      <div data-tour="stewardship-principles-section">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Stewardship Principles</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <Card key={principle.title}>
              <CardHeader>
                <CardTitle className="text-lg mb-2">{principle.title}</CardTitle>
                <div className="bg-primary/5 border-l-4 border-primary p-3 rounded mb-3">
                  <p className="text-sm italic text-muted-foreground">{principle.verse}</p>
                </div>
                <CardDescription>{principle.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Biblical Quotes */}
      <Card data-tour="biblical-wisdom-section">
        <CardHeader>
          <CardTitle>Biblical Wisdom on Stewardship</CardTitle>
          <CardDescription>Scripture verses to guide your financial decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.reference} className="border-l-4 border-primary/50 pl-4 py-2">
                <p className="text-base mb-2">{quote.text}</p>
                <p className="text-sm text-muted-foreground font-medium">{quote.reference}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
