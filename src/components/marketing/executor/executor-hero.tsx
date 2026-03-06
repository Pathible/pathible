import { ClipboardCheck, FolderLock, MapPin } from "lucide-react";
import { WaitlistForm } from "./waitlist-form";

export function ExecutorHero() {
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
          <h1 className="font-crimson text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] tracking-tight text-foreground animate-fade-in-up">
            Someone you love just{" "}
            <span className="relative inline-block">
              <span className="relative z-10">died.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-pathible-gold/30 -rotate-1 rounded-sm" />
            </span>
            <br />
            And now you&apos;re in charge.
          </h1>

          <p className="mt-12 font-crimson text-3xl sm:text-4xl text-pathible-forest animate-fade-in-up animation-delay-200">
            We&apos;ve been the executor too.
          </p>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto animate-fade-in-up animation-delay-300">
            Let Pathible guide you through it. 48 expert-curated steps. One clear path forward.
          </p>

          <div className="mt-10 animate-fade-in-up animation-delay-400">
            <WaitlistForm variant="hero" />
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in-up animation-delay-500">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">Expert-curated checklist</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">Secure document storage</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">Clear path forward</span>
          </div>
        </div>
      </div>
    </section>
  );
}
