export function ThePlan() {
  const steps = [
    {
      number: "01",
      title: "Upload one document",
      body: "Start with a will, insurance policy, or another document your family would need.",
    },
    {
      number: "02",
      title: "Record one account",
      body: "Write down where an important account is held and who your family should contact.",
    },
    {
      number: "03",
      title: "Invite someone you trust",
      body: "Give a trusted family member access and show them where to start.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28 bg-linear-to-b from-pathible-sand to-card/30 overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Here&apos;s the plan
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Three simple steps
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Build your family plan with three practical actions. Our guides help you decide what to
            add.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="absolute top-10 left-[16%] right-[16%] h-px bg-linear-to-r from-pathible-forest/20 via-pathible-gold/40 to-pathible-forest/20 hidden lg:block" />

          <div className="grid gap-12 lg:gap-8 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="text-center">
                <div className="relative mb-8 inline-block">
                  <div className="w-20 h-20 rounded-full bg-white shadow-lg shadow-pathible-forest/10 flex items-center justify-center border-2 border-pathible-forest/10">
                    <span className="font-crimson text-2xl text-pathible-forest font-semibold">
                      {s.number}
                    </span>
                  </div>
                </div>
                <h3 className="font-crimson text-2xl lg:text-3xl mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-xs mx-auto">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
