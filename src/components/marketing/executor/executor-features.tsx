import {
  ClipboardCheck,
  Download,
  FolderLock,
  GitBranch,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { Card } from "../../ui/card";

export function ExecutorFeatures() {
  const features = [
    {
      title: "Expert Checklist",
      icon: ClipboardCheck,
      description: "48 steps organized by phase. Nothing falls through the cracks.",
    },
    {
      title: "Asset Tracker",
      icon: Wallet,
      description: "Log every account, property, and policy. Track values and transfers.",
    },
    {
      title: "Document Vault",
      icon: FolderLock,
      description: "Store death certificates, court orders, and correspondence securely.",
    },
    {
      title: "Distributions",
      icon: GitBranch,
      description: "Record who receives what. Track transfers and acknowledgments.",
    },
    {
      title: "Communications Log",
      icon: MessageSquare,
      description: "Document every call, email, and meeting with attorneys, banks, and family.",
    },
    {
      title: "Estate Export",
      icon: Download,
      description: "Generate complete estate reports for courts, attorneys, or your records.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 bg-linear-to-b from-card/30 to-pathible-sand overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Everything you need
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            One tool. Every task.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((f) => (
            <Card
              key={f.title}
              className="group relative overflow-hidden rounded-3xl border border-pathible-sage/20 bg-white p-8 lg:p-10 hover:shadow-lg hover:shadow-pathible-forest/5 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-pathible-forest/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-pathible-forest" />
                </div>
                <h3 className="font-crimson text-2xl lg:text-3xl">{f.title}</h3>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">{f.description}</p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-pathible-forest via-pathible-sage to-pathible-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
