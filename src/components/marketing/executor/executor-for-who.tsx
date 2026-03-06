import { Briefcase, Heart, UserCheck } from "lucide-react";
import { Card } from "../../ui/card";

export function ExecutorForWho() {
  const personas = [
    {
      icon: UserCheck,
      iconBg: "bg-pathible-forest/10",
      iconColor: "text-pathible-forest",
      title: "You Just Became Executor",
      description:
        "Someone named you in their will, or the court appointed you. You need guidance, not legal lectures.",
    },
    {
      icon: Heart,
      iconBg: "bg-pathible-gold/10",
      iconColor: "text-pathible-gold",
      title: "You're Helping a Spouse or Parent",
      description:
        "Your loved one is overwhelmed. You're stepping in to help them navigate the process.",
    },
    {
      icon: Briefcase,
      iconBg: "bg-pathible-sage/15",
      iconColor: "text-pathible-sage",
      title: "You're a Professional",
      description:
        "Attorneys, financial advisors, and funeral directors who want a better tool for their clients.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Sound familiar?
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Built for you
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Whether you were named in a will or stepping in to help, Pathible meets you where you
            are.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
          {personas.map((persona) => (
            <Card
              key={persona.title}
              className="relative overflow-hidden rounded-3xl border border-pathible-sage/20 bg-white p-8 hover:shadow-lg hover:shadow-pathible-forest/5 hover:-translate-y-1 transition-all duration-500"
            >
              <div
                className={`w-12 h-12 rounded-xl ${persona.iconBg} flex items-center justify-center mb-6`}
              >
                <persona.icon className={`w-6 h-6 ${persona.iconColor}`} />
              </div>

              <h3 className="font-crimson text-2xl mb-3">{persona.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{persona.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
