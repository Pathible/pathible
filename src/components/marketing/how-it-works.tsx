import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload",
      body: "Store your important documents in the Heritage Vault. Wills, insurance, deeds. Everything in one secure place.",
    },
    {
      number: "02",
      title: "Organize",
      body: "Track your finances, property, and accounts. Give your family a clear picture of where everything is.",
    },
    {
      number: "03",
      title: "Write",
      body: "Share your stories, beliefs, and letters. What you've learned. What you want them to know.",
    },
    {
      number: "04",
      title: "Plan",
      body: "Document your wishes and key contacts. Who to call. What you want. No guessing.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 bg-linear-to-b from-pathible-sand to-card/30 overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            How Pathible Works
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Four simple steps
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            No complicated setup. No overwhelming features. Just a clear path forward.
          </p>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-12 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-pathible-forest/20 via-pathible-gold/40 to-pathible-forest/20 hidden lg:block" />

          <div className="grid gap-8 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  {/* Number badge */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-white shadow-lg shadow-pathible-forest/10 flex items-center justify-center border-2 border-pathible-forest/10">
                      <span className="font-crimson text-2xl text-pathible-forest font-semibold">
                        {s.number}
                      </span>
                    </div>
                    {/* Pulse effect */}
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-pathible-forest/10 animate-pulse" />
                  </div>

                  <h3 className="font-crimson text-2xl lg:text-3xl mb-4">{s.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">{s.body}</p>
                </div>

                {/* Arrow between steps (mobile/tablet) */}
                {i < steps.length - 1 && (
                  <div className="flex justify-center my-4 sm:hidden">
                    <ArrowRight className="w-5 h-5 text-pathible-forest/30 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
