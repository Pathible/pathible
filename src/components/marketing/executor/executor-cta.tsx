import { WaitlistForm } from "./waitlist-form";

export function ExecutorCTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-pathible-forest via-pathible-green-hover to-pathible-forest" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.04]" />

      <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
        <h3 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight text-white">
          48 steps. One clear path.
        </h3>
        <p className="font-crimson text-3xl sm:text-4xl lg:text-5xl text-pathible-gold mb-12">
          So you can grieve. Not guess.
        </p>

        <p className="text-lg sm:text-xl text-white/70 mb-12 max-w-xl mx-auto leading-relaxed">
          You didn&apos;t ask for this responsibility. But you can handle it.
        </p>

        <WaitlistForm variant="cta" />
      </div>
    </section>
  );
}
