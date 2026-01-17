import { BookOpen } from "lucide-react";

export function PublicLearningHero() {
  return (
    <section className="relative py-16 sm:py-24 bg-linear-to-b from-pathible-sand/50 to-background overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-linear-to-br from-pathible-sage/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[300px] h-[300px] rounded-full bg-linear-to-br from-pathible-gold/10 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pathible-forest/10 mb-6">
          <BookOpen className="w-8 h-8 text-pathible-forest" />
        </div>
        <h1 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
          Faith & Finances
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
          Biblical wisdom for building a legacy that honors God and blesses your family.
        </p>
        <p className="text-base text-muted-foreground/80 max-w-xl mx-auto">
          Take your time with these resources. They're here whenever you're ready to explore.
        </p>
      </div>
    </section>
  );
}
