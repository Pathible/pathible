import { Check, X } from "lucide-react";
import { Card } from "../../ui/card";

export function ExecutorStakes() {
  const without = [
    "You miss a deadline you didn't know about",
    "Assets fall through the cracks",
    "Family members argue over who gets what",
    "You carry the weight alone",
  ];

  const withPathible = [
    "Every deadline on a checklist",
    "Every asset tracked and documented",
    "Distributions recorded and transparent",
    "A clear path forward, start to finish",
  ];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            The difference
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Two paths forward
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Without Pathible */}
          <Card className="rounded-3xl p-8 lg:p-10 bg-foreground/3 border-foreground/10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-8">
              Without Pathible
            </p>
            <ul className="space-y-5">
              {without.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="h-3 w-3 text-destructive" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* With Pathible */}
          <Card className="rounded-3xl p-8 lg:p-10 bg-linear-to-br from-pathible-forest to-pathible-green-hover border-0 shadow-lg shadow-pathible-forest/10">
            <p className="text-sm font-medium text-pathible-sage uppercase tracking-wide mb-8">
              With Pathible
            </p>
            <ul className="space-y-5">
              {withPathible.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-white/90 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Scripture anchor */}
        <div className="mt-16 sm:mt-20 text-center max-w-2xl mx-auto">
          <blockquote className="font-crimson text-2xl sm:text-3xl lg:text-4xl text-foreground/80 leading-relaxed">
            &ldquo;Carry each other&apos;s burdens, and in this way you will fulfill the law of
            Christ.&rdquo;
          </blockquote>
          <p className="mt-4 text-muted-foreground text-lg">Galatians 6:2</p>
        </div>
      </div>
    </section>
  );
}
