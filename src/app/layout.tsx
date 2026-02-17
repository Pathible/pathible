import type { Metadata } from "next";
import { Crimson_Text, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "./ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const baseUrl = "https://pathible.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Pathible - Faith-Based Family Legacy Platform",
    template: "%s | Pathible",
  },
  description:
    "Have you ever had to sort through a loved one's mess while grieving? We have. Pathible gets everything in one place for your family, so they never have to.",
  keywords: [
    "family legacy planning",
    "faith-based estate planning",
    "Christian family legacy",
    "digital document vault",
    "family story preservation",
    "generational wealth",
    "inheritance planning",
    "family values",
    "legacy planning",
    "secure document storage",
  ],
  authors: [{ name: "Pathible" }],
  creator: "Pathible",
  publisher: "Pathible",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Pathible",
    title: "Pathible - Get Everything in One Place for Your Family",
    description:
      "Have you ever had to sort through a loved one's mess while grieving? We have. Pathible gets everything in one place, so they never have to.",
    // Images auto-injected from opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Pathible - Get Everything in One Place for Your Family",
    description:
      "Have you ever had to sort through a loved one's mess while grieving? We have. Pathible gets everything in one place, so they never have to.",
    // Images auto-injected from opengraph-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${crimsonText.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {children}
            <Toaster />
            <Analytics />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
