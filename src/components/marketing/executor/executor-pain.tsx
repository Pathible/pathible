import { Clock, FileStack, HelpCircle, Phone, Users } from "lucide-react";
import { Card } from "../../ui/card";

export function ExecutorPain() {
  const painPoints = [
    {
      icon: Phone,
      text: "Every phone call reveals another account",
    },
    {
      icon: FileStack,
      text: "You're drowning in paperwork you didn't create",
    },
    {
      icon: HelpCircle,
      text: "Nobody taught you how to be an executor",
    },
    {
      icon: Users,
      text: "Family members are asking questions you can't answer",
    },
    {
      icon: Clock,
      text: "Deadlines you didn't know existed are approaching",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            You know this feeling
          </p>
          <h2 className="font-crimson text-3xl sm:text-4xl lg:text-5xl leading-tight">
            You don&apos;t know where to start
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {painPoints.map((point) => (
            <Card
              key={point.text}
              className="rounded-3xl border border-pathible-sage/20 bg-white p-6 lg:p-8"
            >
              <div className="w-10 h-10 rounded-lg bg-pathible-forest/10 flex items-center justify-center mb-4">
                <point.icon className="w-5 h-5 text-pathible-forest" />
              </div>
              <p className="font-crimson text-xl text-foreground/70 leading-relaxed">
                {point.text}
              </p>
            </Card>
          ))}
        </div>

        {/* Decorative gold divider */}
        <div className="flex justify-center my-12 sm:my-16">
          <div className="w-12 h-px bg-pathible-gold" />
        </div>

        <p className="text-center font-crimson text-2xl sm:text-3xl text-foreground leading-relaxed">
          You didn&apos;t ask for this. But here you are.
        </p>
      </div>
    </section>
  );
}
