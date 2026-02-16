import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function CTASection() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-pathible-forest via-pathible-green-hover to-pathible-forest" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.04]" />

      <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
        <p className="text-pathible-sage font-medium tracking-wide text-sm uppercase mb-6">
          Break the cycle
        </p>
        <h3 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-8 leading-tight text-white">
          Get everything in one place.{" "}
          <span className="text-pathible-gold">So they never have to.</span>
        </h3>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          You know how hard it was. Don't pass that on. Start today.
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
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="text-white/90 hover:text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-medium"
          >
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
