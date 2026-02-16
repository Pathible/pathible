import { BookOpen, FileText, FolderLock, LayoutDashboard, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";

export function GuideSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Guide card */}
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-linear-to-br from-pathible-forest to-pathible-green-hover p-10 sm:p-14 lg:p-20 shadow-2xl shadow-pathible-forest/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-pathible-gold/10 blur-3xl" />

          <div className="relative text-center max-w-3xl mx-auto">
            <p className="font-crimson text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-8">
              We built this because we needed it.
            </p>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-4">
              After losing someone we love, we spent months sorting through the chaos. The will was
              in a drawer we&apos;d checked twice. One bank account didn&apos;t surface for six
              months.
            </p>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              We swore we&apos;d never put our families through that.{" "}
              <span className="text-pathible-gold font-medium">
                That&apos;s why Pathible exists.
              </span>
            </p>
          </div>
        </Card>

        {/* Product mockup */}
        <div className="mt-16 sm:mt-20 relative">
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 bg-linear-to-b from-pathible-sage/10 via-pathible-forest/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

          <div className="relative rounded-2xl shadow-2xl shadow-pathible-charcoal/10 overflow-hidden border border-pathible-sage/20 bg-white">
            {/* Browser toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-pathible-sand/50 border-b border-pathible-sage/10">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-pathible-forest/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-pathible-gold/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-pathible-sage/30" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground/60">pathible.com</span>
              </div>
            </div>

            {/* App layout */}
            <div className="flex flex-col">
              {/* App header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-pathible-sage/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-pathible-forest/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full border border-pathible-forest/30" />
                    </div>
                    <span className="text-sm font-crimson font-medium">Pathible</span>
                  </div>
                  <span className="text-xs text-muted-foreground">The Smith Family</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-pathible-forest/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-pathible-forest">SJ</span>
                </div>
              </div>

              {/* Sidebar + main content */}
              <div className="flex">
                {/* Sidebar */}
                <div className="w-44 shrink-0 border-r border-pathible-sage/10 py-4 hidden md:block">
                  <nav className="space-y-0.5 px-2">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-pathible-sand text-sm text-foreground font-medium">
                      <LayoutDashboard className="w-4 h-4 text-pathible-forest" />
                      Dashboard
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground">
                      <FolderLock className="w-4 h-4" />
                      Heritage Vault
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      Financial Clarity
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      Wisdom &amp; Stories
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      Legacy Planning
                    </div>
                  </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 sm:p-6 bg-pathible-sand/30">
                  <p className="font-crimson text-lg sm:text-xl mb-4 text-foreground">
                    Welcome back, Sarah!
                  </p>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <MockupStatCard
                      icon={<FolderLock className="w-3.5 h-3.5 text-pathible-forest/60" />}
                      value="14"
                      label="Heritage Vault"
                      sublabel="Safe for your family"
                    />
                    <MockupStatCard
                      icon={<TrendingUp className="w-3.5 h-3.5 text-pathible-forest/60" />}
                      value="$285K"
                      label="Financial Clarity"
                      sublabel="Your financial picture"
                    />
                    <MockupStatCard
                      icon={<BookOpen className="w-3.5 h-3.5 text-pathible-forest/60" />}
                      value="8"
                      label="Wisdom & Stories"
                      sublabel="Passed down for generations"
                    />
                    <MockupStatCard
                      icon={<FileText className="w-3.5 h-3.5 text-pathible-forest/60" />}
                      value="85%"
                      label="Legacy Plan"
                      sublabel="Your story, your intentions"
                    />
                  </div>

                  {/* Action cards */}
                  <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="rounded-xl bg-white border border-pathible-sage/15 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FolderLock className="w-4 h-4 text-pathible-forest" />
                        <span className="text-sm font-medium">Heritage Vault</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        14 documents stored securely for your family
                      </p>
                    </div>
                    <div className="rounded-xl bg-white border border-pathible-sage/15 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText className="w-4 h-4 text-pathible-forest" />
                        <span className="text-sm font-medium">Legacy Plan</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Key contacts and wishes documented
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockupStatCard({
  icon,
  value,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-pathible-sage/15 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-lg sm:text-xl font-crimson font-semibold">{value}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/60">{sublabel}</p>
    </div>
  );
}
