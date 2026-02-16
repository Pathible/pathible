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
            Have you ever had to sort through a loved one&apos;s{" "}
            <span className="relative inline-block">
              <span className="relative z-10">mess</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-pathible-gold/30 -rotate-1 rounded-sm" />
            </span>{" "}
            while grieving?
          </h1>

          {/* THE empathy beat - separate, weighted, a breath */}
          <p className="mt-12 font-crimson text-3xl sm:text-4xl text-pathible-forest animate-fade-in-up animation-delay-200">
            We have.
          </p>

          {/* Supporting subtext */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto animate-fade-in-up animation-delay-300">
            And we built something so your family won&apos;t have to go through what we did.
          </p>

          <div className="mt-10 animate-fade-in-up animation-delay-400">
            <Button
              asChild
              size="lg"
              className="bg-pathible-forest hover:bg-pathible-green-hover px-10 py-7 rounded-2xl text-white text-lg font-medium shadow-lg shadow-pathible-forest/20 hover:shadow-xl hover:shadow-pathible-forest/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in-up animation-delay-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">Bank-level encryption</span>
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
