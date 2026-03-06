import { Card } from "../../ui/card";

export function ExecutorGuide() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-linear-to-br from-pathible-forest to-pathible-green-hover p-10 sm:p-14 lg:p-20 shadow-2xl shadow-pathible-forest/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-pathible-gold/10 blur-3xl" />

          <div className="relative text-center max-w-3xl mx-auto">
            <p className="font-crimson text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-8">
              We built this because we needed it.
            </p>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-4">
              When we had to settle an estate, we searched for a tool that could guide us through
              it. We found checklists buried in PDFs. Legal jargon without context. Software built
              for attorneys, not families.
            </p>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              So we built Pathible.{" "}
            </p>
            <p className="text-pathible-gold text-lg sm:text-xl font-medium">
              A clear path through the hardest job nobody prepared you for.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
