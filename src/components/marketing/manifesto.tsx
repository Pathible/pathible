import { Card } from "../ui/card";

export function Manifesto() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Decorative quotes */}
      <div className="absolute top-12 left-1/4 text-pathible-forest/5 font-crimson text-[200px] leading-none pointer-events-none hidden lg:block">
        "
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden rounded-[2.5rem] p-12 sm:p-16 lg:p-20 text-center bg-white border-0 shadow-2xl shadow-pathible-forest/10">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-linear-to-br from-pathible-sage/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-linear-to-br from-pathible-gold/20 to-transparent blur-3xl" />

          <div className="relative">
            <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-6">
              Our Belief
            </p>

            <blockquote className="font-crimson text-2xl sm:text-3xl lg:text-4xl leading-relaxed text-foreground mb-8">
              "A good man leaves an inheritance to his children's children."
            </blockquote>
            <p className="text-muted-foreground text-lg mb-10">Proverbs 13:22</p>

            <div className="space-y-4 text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              <p>
                We believe your{" "}
                <span className="text-foreground font-medium">
                  grandchildren deserve to know you
                </span>
                .
              </p>
              <p>
                We believe your{" "}
                <span className="text-foreground font-medium">stories are worth saving</span>.
              </p>
              <p>
                We believe your{" "}
                <span className="text-foreground font-medium">family shouldn't have to guess</span>.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-pathible-sage/20">
              <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
                That's why we built Pathible. To help your family find what they need. And{" "}
                <span className="text-foreground font-medium">hear your story</span>.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
