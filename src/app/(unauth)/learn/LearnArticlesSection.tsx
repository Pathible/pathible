"use client";

import { useQuery } from "convex/react";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { PublicArticleCard, SubscriberTeaser } from "@/components/learning/public";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export function LearnArticlesSection() {
  const publicArticles = useQuery(api.articles.listPublicArticles, { limit: 20 });
  const subscriberPreviews = useQuery(api.articles.listSubscriberArticlePreviews, { limit: 6 });

  const isLoading = publicArticles === undefined || subscriberPreviews === undefined;

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  const hasPublicArticles = publicArticles && publicArticles.length > 0;
  const hasSubscriberArticles = subscriberPreviews && subscriberPreviews.length > 0;

  return (
    <>
      {/* Public Articles Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-crimson text-3xl sm:text-4xl mb-4">Free Resources</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Start your journey with these foundational articles on faith-based legacy planning.
            </p>
          </div>

          {hasPublicArticles ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publicArticles.map((article) => (
                <PublicArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">New articles coming soon. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscriber Articles Preview Section */}
      {hasSubscriberArticles && (
        <section className="py-16 sm:py-24 bg-linear-to-b from-pathible-sand/30 to-background">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-crimson text-3xl sm:text-4xl mb-4">More for Subscribers</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Unlock detailed guides, actionable templates, and advanced planning resources with a
                Pathible subscription.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {subscriberPreviews.map((article) => (
                <SubscriberTeaser key={article._id} article={article} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                asChild
                size="lg"
                className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl px-8"
              >
                <Link href="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Already a subscriber?{" "}
                <Link href="/login" className="text-pathible-forest hover:underline">
                  Sign in to access all content
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-crimson text-3xl sm:text-4xl mb-4">Ready to Build Your Legacy?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Pathible helps you organize important documents, plan for the future, and pass on what
            matters most to your family.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl px-8"
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
