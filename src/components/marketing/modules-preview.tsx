import { BookOpen, FileText, FolderLock, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";

export function ModulesPreview() {
  const modules = [
    {
      title: "Heritage Vault",
      icon: FolderLock,
      description: "Wills, insurance, deeds, and important files. Organized and searchable.",
    },
    {
      title: "Financial Clarity",
      icon: TrendingUp,
      description: "Bank accounts, investments, property, and beneficiaries. All documented.",
    },
    {
      title: "Wisdom & Stories",
      icon: BookOpen,
      description: "Letters, memories, beliefs, and life lessons. Your voice, preserved.",
    },
    {
      title: "Legacy Planning",
      icon: FileText,
      description: "Your wishes, key contacts, and guidance. No guessing.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 bg-linear-to-b from-card/30 to-pathible-sand overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Everything in one place
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Files. Finances. Stories. Plans.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {modules.map((m) => (
            <Card
              key={m.title}
              className="group relative overflow-hidden rounded-3xl border border-pathible-sage/20 bg-white p-8 lg:p-10 hover:shadow-lg hover:shadow-pathible-forest/5 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-pathible-forest/10 flex items-center justify-center shrink-0">
                  <m.icon className="w-5 h-5 text-pathible-forest" />
                </div>
                <h3 className="font-crimson text-2xl lg:text-3xl">{m.title}</h3>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">{m.description}</p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-pathible-forest via-pathible-sage to-pathible-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
