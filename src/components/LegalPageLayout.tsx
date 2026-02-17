import { ArrowLeft, Calendar, FileText, Scale } from "lucide-react";
import Link from "next/link";
import { PublicPageLayout } from "./PublicPageLayout";

interface LegalPageLayoutProps {
  children: React.ReactNode;
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  version: string;
  type: "privacy" | "terms";
}

export function LegalPageLayout({
  children,
  title,
  effectiveDate,
  lastUpdated,
  version,
  type,
}: LegalPageLayoutProps) {
  return (
    <PublicPageLayout>
      {/* Hero section with subtle pattern */}
      <section className="relative bg-linear-to-b from-pathible-sand via-white to-background overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-linear-to-bl from-pathible-forest/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-linear-to-tr from-pathible-sage/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-pathible-forest transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Title with inline icon */}
          <div className="flex items-center gap-4 sm:gap-5 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pathible-forest/10 flex items-center justify-center shrink-0">
              {type === "privacy" ? (
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-pathible-forest" />
              ) : (
                <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-pathible-forest" />
              )}
            </div>
            <h1 className="font-crimson text-4xl sm:text-5xl lg:text-6xl leading-tight text-foreground">
              {title}
            </h1>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Effective: <span className="text-foreground font-medium">{effectiveDate}</span>
              </span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-pathible-sage/30" />
            <span className="text-sm">
              Last Updated: <span className="text-foreground font-medium">{lastUpdated}</span>
            </span>
            <div className="hidden sm:block w-px h-4 bg-pathible-sage/30" />
            <span className="text-sm">
              Version: <span className="text-foreground font-medium">{version}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="relative bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16">
          {/* Document container with paper-like styling */}
          <article className="relative bg-white rounded-3xl shadow-xl shadow-pathible-charcoal/5 border border-pathible-sage/10 overflow-hidden">
            {/* Subtle paper texture effect */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] pointer-events-none" />

            {/* Content */}
            <div className="relative px-6 sm:px-10 lg:px-16 py-12 sm:py-16 legal-content">
              {children}
            </div>

            {/* Bottom decoration */}
            <div className="h-2 bg-linear-to-r from-pathible-forest via-pathible-sage to-pathible-gold" />
          </article>

          {/* Related links */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {type === "privacy" ? (
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-pathible-forest transition-colors group"
              >
                <Scale className="w-4 h-4" />
                <span className="text-sm font-medium">View Terms of Service</span>
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-pathible-forest transition-colors group"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">View Privacy Policy</span>
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {/* Contact section */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground text-sm">
              Questions about this document? Contact us at{" "}
              <a
                href="mailto:legal@pathible.com"
                className="text-pathible-forest hover:text-pathible-green-hover underline underline-offset-4 transition-colors"
              >
                legal@pathible.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
