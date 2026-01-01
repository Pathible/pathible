import { Heart, Lock, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-pathible-sage/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
              <Image
                src="/pathible-logo.svg"
                alt="Pathible"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground hover:bg-pathible-forest/5 px-2 sm:px-4"
              >
                <Link href="/login">Sign in</Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-pathible-forest hover:bg-pathible-green-hover text-white rounded-xl px-3 sm:px-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="relative bg-linear-to-b from-pathible-sand to-white border-t border-pathible-sage/10 overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-linear-to-b from-pathible-forest/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          {/* Main footer content */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
            {/* Brand section */}
            <div className="max-w-sm">
              <Image
                src="/pathible-logo.svg"
                alt="Pathible"
                width={140}
                height={48}
                className="h-12 w-auto mb-6"
              />
              <p className="font-crimson text-2xl text-foreground leading-relaxed mb-4">
                Your voice. Your values. Your legacy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A peaceful home for everything your family will need and remember.
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-pathible-forest/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-pathible-forest" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Private by Design</p>
                  <p className="text-sm text-muted-foreground">
                    Bank-level encryption protects your data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-pathible-forest/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-pathible-forest" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">You Own Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Export or delete anytime, no questions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-pathible-forest/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-pathible-forest" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Built for Families</p>
                  <p className="text-sm text-muted-foreground">
                    Designed with love for what matters most
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-pathible-sage/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Pathible. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-pathible-forest transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-pathible-forest transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
