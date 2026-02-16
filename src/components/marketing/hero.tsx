import { ArrowRight, Heart, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large soft gradient blob - top right */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-linear-to-br from-pathible-sage/20 via-pathible-forest/10 to-transparent blur-3xl" />
        {/* Smaller accent blob - bottom left */}
        <div className="absolute -bottom-48 -left-32 w-[400px] h-[400px] rounded-full bg-linear-to-tr from-pathible-gold/15 via-pathible-sand to-transparent blur-3xl" />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.015]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-4xl mx-auto text-center">
          {/* THE hero tagline - the single dominant visual element */}
          <h1 className="font-crimson text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-foreground animate-fade-in-up animation-delay-100">
            Have you ever had to{" "}
            <span className="relative inline-block">
              <span className="relative z-10">sort through</span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-destructive/20 -rotate-1 rounded-sm" />
            </span>{" "}
            a loved one&apos;s{" "}
            <span className="relative inline-block">
              <span className="relative z-10">mess</span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-destructive/20 -rotate-1 rounded-sm" />
            </span>{" "}
            <span className="relative inline-block">
              <span className="relative z-10">while grieving?</span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-pathible-gold/40 rotate-1 rounded-sm" />
            </span>
          </h1>

          {/* Supporting subtext */}
          <p className="mt-8 text-xl sm:text-2xl text-foreground/80 leading-relaxed max-w-2xl mx-auto animate-fade-in-up animation-delay-200 font-crimson">
            We have. And we built something so yours won&apos;t have to.
          </p>

          <div className="mt-12 flex gap-4 flex-wrap justify-center animate-fade-in-up animation-delay-300">
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

        {/* Floating trust indicators */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in-up animation-delay-400">
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
            <span className="text-sm">Families of faith</span>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-16 text-card/60"
          aria-hidden="true"
        >
          <path
            d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
