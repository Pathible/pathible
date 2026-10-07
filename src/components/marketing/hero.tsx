import { ArrowRight, Heart, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-linear-to-br from-pathible-sage/20 via-pathible-forest/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-48 -left-32 w-[400px] h-[400px] rounded-full bg-linear-to-tr from-pathible-gold/15 via-pathible-sand to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.015]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-4xl mx-auto text-center">
          {/* THE problem question - clean, massive, unmissable */}
          <h1 className="font-crimson text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] tracking-tight text-foreground animate-fade-in-up">
            Help your family find what they need in an emergency.
          </h1>

          {/* THE empathy beat - separate, weighted, a breath */}
          <p className="mt-12 font-crimson text-3xl sm:text-4xl text-pathible-forest animate-fade-in-up animation-delay-200">
            Your documents. Your accounts. Your wishes.
          </p>

          {/* Supporting subtext */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto animate-fade-in-up animation-delay-300">
            Organize the essentials in one family workspace. Start with an important document, then
            give someone you trust access.
          </p>

          <div className="mt-10 flex flex-col items-center gap-5 animate-fade-in-up animation-delay-400">
            <Button
              asChild
              size="lg"
              className="bg-pathible-forest hover:bg-pathible-green-hover px-10 py-7 rounded-2xl text-white text-lg font-medium shadow-lg shadow-pathible-forest/20 hover:shadow-xl hover:shadow-pathible-forest/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link href="/signup" data-testid="hero-start" className="flex items-center gap-2">
                Organize My Family
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Link
              href="/learn/the-family-access-map"
              data-testid="hero-guide"
              className="text-pathible-forest underline underline-offset-4"
            >
              Read the family access guide
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in-up animation-delay-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">Manage family access</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">You own your data</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">Built for families of faith</span>
          </div>
        </div>
      </div>
    </section>
  );
}
