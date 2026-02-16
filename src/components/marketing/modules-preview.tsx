import { BookOpen, Check, FileText, FolderLock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ModulesPreview() {
  const modules = [
    {
      title: "Heritage Vault",
      icon: FolderLock,
      lines: [
        "Keep legal, financial, and personal files organized",
        "Share securely with family members",
        "Find what you need with search and tags",
      ],
    },
    {
      title: "Financial Clarity",
      icon: TrendingUp,
      lines: [
        "Track bank accounts, investments, and property",
        "Document insurance policies and beneficiaries",
        "Give your family a clear financial picture",
      ],
    },
    {
      title: "Wisdom & Stories",
      icon: BookOpen,
      lines: [
        "Write your stories and life lessons",
        "Write letters to loved ones (even those not yet born)",
        "Write down what you believe",
      ],
    },
    {
      title: "Legacy Planning",
      icon: FileText,
      lines: [
        "Write down your wishes and who to call",
        "Show them where everything is",
        "Give your family guidance, not guesswork",
      ],
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 bg-linear-to-b from-card/30 to-pathible-sand overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Four ways to protect your family
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Files. Finances. Stories. Plans.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Everything in one place. No more scattered files or wondering where things are.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {modules.map((m, index) => (
            <Card
              key={m.title}
              className="group relative overflow-hidden rounded-3xl border border-pathible-sage/20 bg-white shadow-sm hover:shadow-lg hover:shadow-pathible-forest/5 hover:-translate-y-1 transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-8 lg:p-10">
                <CardHeader className="p-0 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-pathible-forest/10 flex items-center justify-center">
                      <m.icon className="w-5 h-5 text-pathible-forest" />
                    </div>
                    <CardTitle className="font-crimson text-2xl lg:text-3xl">{m.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-4">
                    {m.lines.map((l) => (
                      <li key={l} className="flex items-start gap-4">
                        <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-pathible-forest/10 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-pathible-forest" />
                        </div>
                        <span className="text-muted-foreground text-lg leading-relaxed">{l}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-pathible-forest via-pathible-sage to-pathible-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
