export function PainSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white">
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            You know this feeling
          </p>
          <h2 className="font-crimson text-3xl sm:text-4xl lg:text-5xl leading-tight">
            The months that follow
          </h2>
        </div>

        <div className="space-y-6 sm:space-y-8 text-center max-w-2xl mx-auto">
          <p className="font-crimson text-xl sm:text-2xl text-foreground/70 leading-relaxed">
            Searching the same drawer. For the third time.
          </p>
          <p className="font-crimson text-xl sm:text-2xl text-foreground/70 leading-relaxed">
            Calling banks to prove who you are.
          </p>
          <p className="font-crimson text-xl sm:text-2xl text-foreground/70 leading-relaxed">
            Arguing with siblings about what she wanted.
          </p>
          <p className="font-crimson text-xl sm:text-2xl text-foreground/70 leading-relaxed">
            Making decisions, without her voice.
          </p>
        </div>

        {/* Decorative gold divider */}
        <div className="flex justify-center my-12 sm:my-16">
          <div className="w-12 h-px bg-pathible-gold" />
        </div>

        <p className="text-center font-crimson text-2xl sm:text-3xl text-foreground leading-relaxed">
          Nobody prepares you for the mess.
        </p>
      </div>
    </section>
  );
}
