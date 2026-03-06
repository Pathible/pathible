import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ExecutorCrossLink() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden bg-pathible-sand">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
          Not settling an estate?
        </p>
        <h3 className="font-crimson text-3xl sm:text-4xl mb-4 leading-tight">Planning ahead?</h3>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
          See how Pathible helps you get organized before it&apos;s needed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-pathible-forest font-medium hover:underline text-lg"
        >
          Explore Legacy Planning
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
