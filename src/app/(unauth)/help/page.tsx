import {
  BookOpen,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQ_ITEMS, faqPageSchema, generatePageMetadata, SEO_CONFIG } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
  title: "Help Center",
  description:
    "Get help with Pathible. Find answers to frequently asked questions, learn how to use features, and contact our support team.",
  path: "/help",
});

const HELP_CATEGORIES = [
  {
    title: "Getting Started",
    description: "New to Pathible? Start here.",
    icon: BookOpen,
    links: [
      { label: "Create your account", href: "/signup" },
      { label: "Choose a plan", href: "/pricing" },
    ],
    bullets: null,
  },
  {
    title: "Heritage Vault",
    description: "Store and organize your important documents.",
    icon: FileText,
    links: null,
    bullets: [
      "Upload documents, photos, and videos securely",
      "Organize files by category",
      "Control who can access each document",
    ],
  },
  {
    title: "Family Network",
    description: "Connect and collaborate with family members.",
    icon: Users,
    links: null,
    bullets: [
      "Invite family members to your household",
      "Create family units for different branches",
      "Manage member roles and permissions",
    ],
  },
  {
    title: "Financial Clarity",
    description: "Track accounts, properties, and insurance.",
    icon: Wallet,
    links: null,
    bullets: [
      "Add bank and investment accounts",
      "Track real estate and property",
      "Record insurance policies",
    ],
  },
  {
    title: "Privacy & Security",
    description: "Your data protection and privacy.",
    icon: Shield,
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
    bullets: null,
  },
] as const;

export default function HelpPage() {
  return (
    <PublicPageLayout>
      <JsonLd data={[faqPageSchema]} />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-linear-to-b from-pathible-sand/50 to-background overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-linear-to-br from-pathible-sage/10 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pathible-forest/10 mb-6">
            <HelpCircle className="w-8 h-8 text-pathible-forest" />
          </div>
          <h1 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Find answers to your questions and learn how to make the most of Pathible for your
            family's legacy.
          </p>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-crimson text-3xl sm:text-4xl mb-12 text-center">Browse by Topic</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_CATEGORIES.map((category) => (
              <Card
                key={category.title}
                className="hover:shadow-md transition-shadow border-pathible-sage/20"
              >
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-pathible-forest/10 flex items-center justify-center mb-3">
                    <category.icon className="w-5 h-5 text-pathible-forest" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.links?.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-pathible-forest hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    {category.bullets?.map((bullet) => (
                      <li key={bullet} className="text-sm text-muted-foreground">
                        • {bullet}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-linear-to-b from-pathible-sand/30 to-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-crimson text-3xl sm:text-4xl mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">
              Quick answers to common questions about Pathible.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((item) => {
              const itemKey = item.question
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .slice(0, 50);
              return (
                <AccordionItem
                  key={itemKey}
                  value={itemKey}
                  className="bg-white rounded-2xl border border-pathible-sage/20 px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-medium text-lg py-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-crimson text-3xl sm:text-4xl mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground text-lg">
              Our support team is here to help you preserve your family's legacy.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            <Card className="text-center border-pathible-sage/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-pathible-forest/10 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-pathible-forest" />
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Get instant answers from our support team.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click the chat icon in the bottom right corner to start a conversation.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-pathible-sage/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-pathible-forest/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-pathible-forest" />
                </div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Send us a message anytime.</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:support@${SEO_CONFIG.baseUrl.replace("https://", "")}`}
                  className="text-sm text-pathible-forest hover:underline"
                >
                  support@pathible.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
