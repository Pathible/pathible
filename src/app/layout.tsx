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

export const metadata: Metadata = {
  title: "Pathible - A peaceful home for everything your family will need",
  description:
    "Keep your most important documents, stories, and wishes together in one secure place.",
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
