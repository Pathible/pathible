import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  FolderLock,
  Lock,
  PiggyBank,
  ScrollText,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { ScrollButton } from "@/components/ScrollButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Index() {
  return (
    <PublicPageLayout>
      <HeroSection />
      <ValuePillars />
      <HowItWorks />
      <ModulesPreview />
      <Testimonial />
      <CTASection />
    </PublicPageLayout>
  );
}

// --------------------------- Hero ---------------------------
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large soft gradient blob - top right */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-linear-to-br from-pathible-sage/20 via-pathible-forest/10 to-transparent blur-3xl" />
        {/* Smaller accent blob - bottom left */}
        <div className="absolute -bottom-48 -left-32 w-[400px] h-[400px] rounded-full bg-linear-to-tr from-pathible-gold/15 via-pathible-sand to-transparent blur-3xl" />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.015]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-36 lg:py-44">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow text */}
          <p className="inline-flex items-center gap-2 text-pathible-forest font-medium tracking-wide text-sm uppercase mb-6 animate-fade-in">
            <span className="w-8 h-px bg-pathible-forest/40" />
            Family Legacy Platform
            <span className="w-8 h-px bg-pathible-forest/40" />
          </p>

          <h1 className="font-crimson text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-foreground animate-fade-in-up">
            A peaceful home for everything your family will{" "}
            <span className="relative inline-block">
              <span className="relative z-10">need</span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-pathible-gold/30 -rotate-1 rounded-sm" />
            </span>{" "}
            and{" "}
            <span className="relative inline-block">
              <span className="relative z-10">remember</span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-pathible-sage/40 rotate-1 rounded-sm" />
            </span>
            .
          </h1>

          <p className="mt-8 text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Pathible brings your most important documents, stories, and wishes together in one
            secure place—so the people you love have{" "}
            <em className="text-foreground not-italic font-medium">clarity</em>, not confusion.
          </p>

          <div className="mt-12 flex gap-4 flex-wrap justify-center animate-fade-in-up animation-delay-400">
            <Button
              asChild
              size="lg"
              className="bg-pathible-forest hover:bg-pathible-green-hover px-10 py-7 rounded-2xl text-white text-lg font-medium shadow-lg shadow-pathible-forest/20 hover:shadow-xl hover:shadow-pathible-forest/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Floating trust indicators */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in-up animation-delay-600">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">Bank-level encryption</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">You own your data</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pathible-forest" />
            <span className="text-sm">Built for families</span>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-16 text-card/60"
          aria-hidden="true"
        >
          <path
            d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}

// ---------------------- Value Pillars ----------------------
function ValuePillars() {
  const pillars = [
    {
      icon: FolderLock,
      title: "Heritage Vault",
      body: "Keep your legal, financial, and personal files safe and organized. Everything your family needs in one secure place.",
      accent: "from-pathible-forest/10 to-pathible-sage/10",
    },
    {
      icon: BookOpen,
      title: "Wisdom & Education",
      body: "Share your stories, beliefs, and letters with the people you love. Give them something to return to for years to come.",
      accent: "from-pathible-gold/10 to-amber-100/50",
    },
    {
      icon: ScrollText,
      title: "Legacy Planning",
      body: "Turn your values into clear instructions. Get legal-ready drafts written in plain language that actually makes sense.",
      accent: "from-pathible-sage/10 to-emerald-100/30",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-linear-to-br from-pathible-sage/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            What makes us different
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Security, story, and stewardship
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            All in one calm, thoughtfully designed experience.
          </p>
        </div>

        <div className="grid gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

// ---------------------- How It Works ----------------------
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Gather",
      body: "Upload your essential documents. Add simple notes about where to find things. It's that easy.",
    },
    {
      number: "02",
      title: "Give Meaning",
      body: "Record a story. Write a letter. Save your family's core beliefs. This is where legacy lives.",
    },
    {
      number: "03",
      title: "Prepare",
      body: "Answer gentle prompts that help you create a clear Legacy Summary and legal-ready drafts.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 bg-linear-to-b from-pathible-sand to-card/30 overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Simple process
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Three steps to peace of mind
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            No complicated setup. No overwhelming features. Just a clear path forward.
          </p>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-24 left-[16.67%] right-[16.67%] h-px bg-linear-to-r from-pathible-forest/20 via-pathible-gold/40 to-pathible-forest/20 hidden lg:block" />

          <div className="grid gap-8 lg:gap-12 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  {/* Number badge */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-white shadow-lg shadow-pathible-forest/10 flex items-center justify-center border-2 border-pathible-forest/10">
                      <span className="font-crimson text-2xl text-pathible-forest font-semibold">
                        {s.number}
                      </span>
                    </div>
                    {/* Pulse effect */}
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-pathible-forest/10 animate-pulse" />
                  </div>

                  <h3 className="font-crimson text-2xl lg:text-3xl mb-4">{s.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">{s.body}</p>
                </div>

                {/* Arrow between steps (mobile/tablet) */}
                {i < steps.length - 1 && (
                  <div className="flex justify-center my-4 sm:hidden">
                    <ArrowRight className="w-5 h-5 text-pathible-forest/30 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------- Modules Preview ----------------------
function ModulesPreview() {
  const modules = [
    {
      title: "Heritage Vault",
      icon: FolderLock,
      lines: [
        "Keep legal, financial, and personal files organized",
        "Share securely with family",
        "Find what you need with search and tags",
      ],
    },
    {
      title: "Wisdom & Education",
      icon: BookOpen,
      lines: [
        "Share your stories and lessons",
        "Write letters to loved ones",
        "Create your Core Beliefs document",
      ],
    },
    {
      title: "Legacy Planning",
      icon: FileText,
      lines: [
        "Document your Final Wishes & Key Contacts",
        "Create a Document Access Map",
        "Get legal-ready summaries",
      ],
    },
    {
      title: "Financial Intelligence",
      icon: PiggyBank,
      lines: [
        "See all your accounts in one view",
        "Access stewardship resources",
        "Plan for charitable giving (coming soon)",
      ],
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            All-in-one platform
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Everything in one peaceful place
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            No more scattered files, forgotten passwords, or wondering where things are.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((m, index) => (
            <Card
              key={m.title}
              className="group relative overflow-hidden rounded-3xl border border-pathible-sage/20 bg-linear-to-br from-white to-pathible-sand/30 shadow-sm hover:shadow-lg hover:shadow-pathible-forest/5 hover:-translate-y-1 transition-all duration-500"
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

// ---------------------- Testimonial ----------------------
function Testimonial() {
  return (
    <section className="relative py-24 sm:py-32 bg-linear-to-b from-card/30 via-pathible-sand to-background overflow-hidden">
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
            <p className="font-crimson text-3xl sm:text-4xl lg:text-5xl leading-relaxed text-foreground italic">
              "For the first time, everything my family needs is in one place. And so is what I want
              them to remember."
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-pathible-forest to-pathible-sage flex items-center justify-center text-white font-crimson text-xl">
                P
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Pathible Member</p>
                <p className="text-sm text-muted-foreground">Heritage Plan</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ---------------------- CTA Section ----------------------
function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-pathible-forest via-pathible-green-hover to-pathible-forest" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.04]" />

      <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
        <p className="text-pathible-sage font-medium tracking-wide text-sm uppercase mb-6">
          Start your legacy today
        </p>
        <h3 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-8 leading-tight text-white">
          Peace doesn't happen by accident.{" "}
          <span className="text-pathible-gold">It happens by preparation.</span>
        </h3>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Start with Foundations today. Add deeper layers as your story grows.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white hover:bg-pathible-sand text-pathible-forest px-10 py-7 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Link href="/signup" className="flex items-center gap-2">
              Start with Foundations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="text-white/90 hover:text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-medium"
          >
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
