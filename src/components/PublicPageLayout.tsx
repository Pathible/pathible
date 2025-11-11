import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MobileNav } from "./MobileNav";

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/pathible-logo.svg"
              alt="Pathible"
              width={120}
              height={40}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Pricing
            </Link>

            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="py-16 border-t border-border/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 text-base">
            <div>
              <Image
                src="/pathible-logo.svg"
                alt="Pathible"
                width={120}
                height={48}
                className="h-12 w-auto mb-3"
              />
              <p className="text-muted-foreground leading-relaxed">
                Your voice. Your values. Your legacy.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Resources</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/security"
                    className="hover:text-foreground transition-colors"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Assurance</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>You own your data</li>
                <li>Encrypted & private</li>
                <li>Cancel anytime</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-border/30" />
          <p className="text-center text-muted-foreground">
            © {new Date().getFullYear()} Pathible. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
