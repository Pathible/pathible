import { BookHeart, Check, Sparkles, Users } from "lucide-react";
import { Card } from "../ui/card";

export function ForWhoSection() {
  const personas = [
    {
      icon: Users,
      title: "You've Been Through It",
      subtitle: "And you don't want your family to go through the same",
      iconBg: "bg-pathible-forest/10",
      iconColor: "text-pathible-forest",
      points: [
        "You spent months sorting through the mess",
        "You swore you'd never do that to your kids",
        "Now you can actually do it",
      ],
    },
    {
      icon: BookHeart,
      title: "You're Watching It Happen",
      subtitle: "Your parents aren't prepared. And it worries you.",
      iconBg: "bg-pathible-gold/10",
      iconColor: "text-pathible-gold",
      points: [
        "You don't know where their documents are",
        "You're dreading the conversations ahead",
        "Start together, while there's time",
      ],
    },
    {
      icon: Sparkles,
      title: "You're Starting Fresh",
      subtitle: "You want to do it right from the beginning",
      iconBg: "bg-pathible-sage/15",
      iconColor: "text-pathible-sage",
      points: [
        "You're building a family and want to protect them",
        "You don't have much yet. But you can start small.",
        "The best time to start was yesterday. The second best is today.",
      ],
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Sound familiar?
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            You're not alone
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Most of us have been there. Or we're watching it unfold right now.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
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

              <h3 className="font-crimson text-2xl mb-2">{persona.title}</h3>
              <p className="text-muted-foreground mb-6">{persona.subtitle}</p>

              <ul className="space-y-3">
                {persona.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <div className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-pathible-forest/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-pathible-forest" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
