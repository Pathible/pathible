import { Check } from "lucide-react";
import { Card } from "../ui/card";

export function WhyPathible() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-linear-to-br from-pathible-forest to-pathible-green-hover p-8 sm:p-12 lg:p-16 shadow-2xl shadow-pathible-forest/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-pathible-gold/10 blur-3xl" />

          <div className="relative text-center">
            <p className="text-pathible-sage font-medium tracking-wide text-sm uppercase mb-4">
              One place. Everything they need.
            </p>
            <h2 className="font-crimson text-3xl sm:text-4xl lg:text-5xl text-white mb-6 leading-tight">
              Your files. Your finances. Your stories. Together.
            </h2>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto mb-8">
              Your family needs to find the will and know where the accounts are. They also need to
              hear your story. Pathible keeps it all in one place, so they don't have to search.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-white/90 text-sm sm:text-base">
                  <span className="font-medium">Store files:</span> Wills, insurance, and deeds. All
                  in one secure place.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-white/90 text-sm sm:text-base">
                  <span className="font-medium">Track finances:</span> Accounts, property, and
                  insurance documented for your family.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-white/90 text-sm sm:text-base">
                  <span className="font-medium">Write stories:</span> Letters, memories, and your
                  words to your family.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-white/90 text-sm sm:text-base">
                  <span className="font-medium">Share faith:</span> Your beliefs and values, for
                  your kids and grandkids.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
