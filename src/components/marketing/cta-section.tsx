import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function CTASection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-pathible-forest via-pathible-green-hover to-pathible-forest" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.04]" />

      <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
        <h3 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight text-white">
          Make your family's next step easier.
        </h3>
        <p className="font-crimson text-3xl sm:text-4xl lg:text-5xl text-pathible-gold mb-12">
          Start with one important document.
        </p>

        <p className="text-lg sm:text-xl text-white/70 mb-12 max-w-xl mx-auto leading-relaxed">
          Create your family workspace, add an essential document, and invite someone you trust.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white hover:bg-pathible-sand text-pathible-forest px-10 py-7 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Link href="/signup" className="flex items-center gap-2">
              Organize My Family
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
