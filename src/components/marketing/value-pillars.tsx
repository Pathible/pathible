import { BookOpen, FolderLock, ScrollText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ValuePillars() {
  const pillars = [
    {
      icon: FolderLock,
      title: "Heritage Vault",
      body: "Keep your legal, financial, and personal files safe and organized. Everything your family needs, in one place they can find.",
      accent: "from-pathible-forest/10 to-pathible-sage/10",
    },
    {
      icon: TrendingUp,
      title: "Financial Clarity",
      body: "Know where everything is. Track accounts, property, and insurance so your family can find it all when they need to.",
      accent: "from-pathible-gold/10 to-amber-100/50",
    },
    {
      icon: BookOpen,
      title: "Wisdom & Stories",
      body: "Pass down your faith, not just your finances. Write stories, letters, and what you believe for the people you love. Something they'll read again and again.",
      accent: "from-pathible-sage/10 to-emerald-100/30",
    },
    {
      icon: ScrollText,
      title: "Legacy Planning",
      body: "Write down what you want them to do. Document your wishes, key contacts, and guidance so your family knows instead of guesses.",
      accent: "from-pathible-warm-gray/10 to-stone-100/30",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-linear-to-br from-pathible-sage/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Four ways to protect your family
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Files. Finances. Stories. Plans.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Everything in one place. So they never have to search.
          </p>
        </div>

        <div className="grid gap-6 lg:gap-8 sm:grid-cols-2">
          {pillars.map((p, index) => (
            <Card
              key={p.title}
              className="group relative overflow-hidden rounded-3xl border-0 shadow-lg shadow-black/3 hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1 transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${p.accent} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Card content */}
              <div className="relative p-8 lg:p-10">
                <CardHeader className="p-0 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-pathible-forest/10 flex items-center justify-center mb-4">
                    <p.icon className="w-6 h-6 text-pathible-forest" />
                  </div>
                  <CardTitle className="font-crimson text-2xl lg:text-3xl">{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground text-lg leading-relaxed">{p.body}</p>
                </CardContent>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-linear-to-br from-pathible-forest/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
