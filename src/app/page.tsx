import { Check } from "lucide-react";
import Link from "next/link";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { ScrollButton } from "@/components/ScrollButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Index() {
  return (
    <PublicPageLayout>
      <HeroSection />
      <TrustBar />
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
    <section className="relative overflow-hidden bg-linear-to-b from-background to-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-crimson text-5xl sm:text-6xl leading-tight tracking-tight text-foreground">
            A peaceful home for everything your family will need and remember.
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-muted-foreground leading-relaxed">
            Pathible brings your most important documents, stories, and wishes together in one
            secure place so the people you love have clarity, not confusion.
          </p>
          <div className="mt-10 flex gap-4 flex-wrap justify-center">
            <Button
              asChild
              className="bg-primary hover:bg-pathible-green-hover px-8 py-7 rounded-xl text-white text-lg min-h-[56px]"
            >
              <Link href="/signup">Start with Foundations</Link>
            </Button>
            <ScrollButton
              targetId="how-it-works"
              size="lg"
              variant="outline"
              className="border-2 border-accent hover:bg-accent/10 font-medium rounded-xl text-lg px-8 py-4 min-h-[56px]"
            >
              See how it works
            </ScrollButton>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------- Trust Bar -------------------------
function TrustBar() {
  const items = [
    "Private by design",
    "Encrypted at rest & in transit",
    "You own your data",
    "Built for families",
  ];
  return (
    <section aria-label="trust" className="border-y border-accent/20 bg-card/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        {items.map((t) => (
          <div key={t} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------- Value Pillars ----------------------
function ValuePillars() {
  const pillars = [
    {
      title: "Heritage Vault",
      body: "Keep your legal, financial, and personal files safe and organized. Everything your family needs in one secure place.",
    },
    {
      title: "Wisdom & Education",
      body: "Share your stories, beliefs, and letters with the people you love. Give them something to return to for years to come.",
    },
    {
      title: "Legacy Planning",
      body: "Turn your values into clear instructions. Get legal-ready drafts written in plain language that actually makes sense.",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-crimson text-4xl sm:text-5xl mb-4">What makes Pathible different</h2>
          <p className="text-xl text-muted-foreground">
            Security, story, and stewardship. All in one calm experience.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <Card
              key={p.title}
              className="rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-8 bg-card border-border/50"
            >
              <CardHeader className="p-0 pb-4">
                <CardTitle className="font-crimson text-2xl">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground text-lg leading-relaxed">{p.body}</p>
              </CardContent>
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
      title: "Gather",
      body: "Upload your essential documents. Add simple notes about where to find things. It's that easy.",
    },
    {
      title: "Give Meaning",
      body: "Record a story. Write a letter. Save your family's core beliefs. This is where legacy lives.",
    },
    {
      title: "Prepare",
      body: "Answer gentle prompts that help you create a clear Legacy Summary and legal-ready drafts.",
    },
  ];
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-linear-to-b from-card/30 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-crimson text-4xl sm:text-5xl mb-4">How it works</h2>
          <p className="text-xl text-muted-foreground">Three simple steps to peace of mind.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Card
              key={s.title}
              className="rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-8 bg-card border-border/50"
            >
              <CardHeader className="p-0 pb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 text-accent font-crimson text-xl mb-4">
                  {i + 1}
                </div>
                <CardTitle className="font-crimson text-2xl">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground text-lg leading-relaxed">{s.body}</p>
              </CardContent>
            </Card>
          ))}
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
      lines: [
        "Keep legal, financial, and personal files organized",
        "Share securely with family",
        "Find what you need with search and tags",
      ],
    },
    {
      title: "Wisdom & Education",
      lines: [
        "Share your stories and lessons",
        "Write letters to loved ones",
        "Create your Core Beliefs document",
      ],
    },
    {
      title: "Legacy Planning",
      lines: [
        "Document your Final Wishes & Key Contacts",
        "Create a Document Access Map",
        "Get legal-ready summaries",
      ],
    },
    {
      title: "Financial Intelligence",
      lines: [
        "See all your accounts in one view",
        "Access stewardship resources",
        "Plan for charitable giving (coming soon)",
      ],
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-crimson text-4xl sm:text-5xl mb-4">
            Everything in one peaceful place
          </h2>
          <p className="text-xl text-muted-foreground">
            No more scattered files, forgotten passwords, or wondering where things are.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {modules.map((m) => (
            <Card
              key={m.title}
              className="rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-8 bg-card border-border/50"
            >
              <CardHeader className="p-0 pb-6">
                <CardTitle className="font-crimson text-2xl">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-3 text-muted-foreground">
                  {m.lines.map((l) => (
                    <li key={l} className="flex items-start gap-3">
                      <Check className="mt-1 h-5 w-5 text-accent shrink-0" />
                      <span className="text-base sm:text-lg leading-relaxed">{l}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
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
    <section className="py-20 sm:py-28 bg-linear-to-b from-background to-card/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="rounded-3xl p-12 sm:p-16 text-center bg-card border-border/50 shadow-lg">
          <p className="font-crimson text-3xl sm:text-4xl leading-relaxed text-foreground">
            "For the first time, everything my family needs is in one place. And so is what I want
            them to remember."
          </p>
          <p className="mt-6 text-lg text-muted-foreground">— Pathible member</p>
        </Card>
      </div>
    </section>
  );
}

// ---------------------- CTA Section ----------------------
function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-linear-to-b from-card/30 to-background">
      <div className="mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
        <h3 className="font-crimson text-4xl sm:text-5xl mb-6 leading-tight">
          Peace doesn't happen by accident. It happens by preparation.
        </h3>
        <p className="text-xl text-muted-foreground mb-10">
          Start with Foundations today. Add deeper layers as your story grows.
        </p>
        <div className="flex items-center justify-center">
          <Button
            asChild
            className="bg-primary hover:bg-pathible-green-hover px-8 py-7 rounded-xl text-white text-lg min-h-[56px]"
          >
            <Link href="/signup">Start with Foundations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
