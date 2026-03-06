import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estate Administration Made Clear | Pathible",
  description:
    "Someone you love just died. And now you're in charge. Pathible guides you through estate administration with 48 expert-curated steps. So you can grieve. Not guess.",
  keywords: [
    "estate administration",
    "executor checklist",
    "settle an estate",
    "probate checklist",
    "estate executor guide",
  ],
  openGraph: {
    title: "Estate Administration Made Clear | Pathible",
    description:
      "48 expert-curated steps to guide you through estate administration. So you can grieve. Not guess.",
    url: "https://pathible.com/for-executors",
    siteName: "Pathible",
    images: [{ url: "https://pathible.com/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Estate Administration Made Clear | Pathible",
    description: "48 expert-curated steps to guide you through estate administration.",
  },
  alternates: {
    canonical: "https://pathible.com/for-executors",
  },
};

export default function ForExecutorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
