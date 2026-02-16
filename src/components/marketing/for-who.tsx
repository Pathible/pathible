import { BookHeart, Sparkles, Users } from "lucide-react";
import { Card } from "../ui/card";

export function ForWhoSection() {
  const personas = [
    {
      icon: Users,
      iconBg: "bg-pathible-forest/10",
      iconColor: "text-pathible-forest",
      title: "You've Been Through It",
      description:
        "You spent months sorting through the mess. You swore you'd never do that to your kids. Now you can actually prevent it.",
    },
    {
      icon: BookHeart,
      iconBg: "bg-pathible-gold/10",
      iconColor: "text-pathible-gold",
      title: "You're Watching It Happen",
      description:
        "Your parents aren't prepared, and it worries you. Start together, while there's time.",
    },
    {
      icon: Sparkles,
      iconBg: "bg-pathible-sage/15",
      iconColor: "text-pathible-sage",
      title: "You're Starting Fresh",
      description:
        "You're building a family and want to protect them from the beginning. Start small. It compounds.",
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
            You&apos;re not alone
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Most of us have been there. Or we&apos;re watching it unfold right now.
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
