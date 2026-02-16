export function PublicLearningHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Organic background shapes - matching homepage */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-linear-to-br from-pathible-sage/15 via-pathible-forest/8 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[350px] h-[350px] rounded-full bg-linear-to-tr from-pathible-gold/12 via-pathible-sand to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.015]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline with gold accent - matching homepage pattern */}
          <h1 className="font-crimson text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground animate-fade-in-up animation-delay-100">
            Clarity for your{" "}
            <span className="relative inline-block">
              <span className="relative z-10">family.</span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-pathible-gold/40 -rotate-1 rounded-sm" />
            </span>
            <br className="sm:hidden" /> Before they{" "}
            <span className="relative inline-block">
              <span className="relative z-10">need it.</span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-pathible-gold/40 rotate-1 rounded-sm" />
            </span>
          </h1>

          {/* Supporting text - Crimson like homepage */}
          <p className="mt-6 text-lg sm:text-xl text-foreground/70 leading-relaxed max-w-2xl mx-auto animate-fade-in-up animation-delay-200 font-crimson">
            Short, practical guides to help you plan with purpose, so your loved ones never have to
            search through chaos.
          </p>
        </div>
      </div>
    </section>
  );
}
