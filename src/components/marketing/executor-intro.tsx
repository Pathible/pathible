import { ArrowRight, CheckSquare, FileText, FolderOpen, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: CheckSquare,
    title: "Expert Checklist",
    description: "48 expert-curated steps so nothing falls through the cracks.",
  },
  {
    icon: Package,
    title: "Asset Tracker",
    description: "Track every account, property, and policy in one place.",
  },
  {
    icon: FolderOpen,
    title: "Document Vault",
    description: "Secure storage for death certificates, court filings, and more.",
  },
  {
    icon: FileText,
    title: "Estate Export",
    description: "Generate complete reports for attorneys, courts, and family.",
  },
];

export function ExecutorIntroSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-pathible-sand/30">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            For executors
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Already in that moment?
          </h2>
          <p className="font-crimson text-2xl sm:text-3xl text-muted-foreground mb-6">
            We built something for that too.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            When someone you love dies and you&apos;re the one in charge, you need a clear path
            forward. Pathible&apos;s estate administration tools give you an expert-curated
            checklist, asset tracking, and document management — so you can focus on what matters.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto mb-12">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="rounded-2xl border border-pathible-sage/20 bg-white p-6 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-pathible-forest/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-5 h-5 text-pathible-forest" />
              </div>
              <h3 className="font-crimson text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl px-8 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Link href="/for-executors">
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
