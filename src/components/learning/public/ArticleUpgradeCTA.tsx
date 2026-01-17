import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ArticleUpgradeCTA() {
  return (
    <div className="relative mt-8">
      {/* Fade overlay effect */}
      <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* CTA Card */}
      <div className="relative bg-gradient-to-br from-pathible-sand via-background to-pathible-gold/5 border border-pathible-sage/20 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pathible-gold/10 mb-4">
          <Sparkles className="w-6 h-6 text-pathible-gold" />
        </div>

        <h3 className="font-crimson text-2xl mb-3">Continue Reading</h3>

        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Subscribe to Pathible to access the full article and unlock all our educational resources
          on faith-based financial planning.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl px-8"
          >
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link href="/pricing">View Plans</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Already a subscriber?{" "}
          <Link href="/login" className="text-pathible-forest hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
