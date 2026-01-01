import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans - Start Your Family Legacy",
  description:
    "Simple, transparent pricing for Pathible. Choose Foundations, Growth, or Heritage plans to start preserving your family's documents, stories, and values.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing Plans | Pathible",
    description:
      "Simple, transparent pricing for Pathible. Start preserving your family's legacy today.",
    url: "https://pathible.com/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
