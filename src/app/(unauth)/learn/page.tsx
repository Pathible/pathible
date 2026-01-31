import type { Metadata } from "next";
import Link from "next/link";
import { PublicLearningHero } from "@/components/learning/public";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { generatePageMetadata } from "@/lib/seo-config";
import { getPublicArticles } from "@/lib/static-articles";
import { LearnArticlesSection } from "./LearnArticlesSection";

export const metadata: Metadata = generatePageMetadata({
  title: "Learn - Family Legacy Planning Guides & Resources",
  description:
    "Free guides and checklists for family legacy planning, estate organization, and protecting your loved ones from chaos. Learn how to get your affairs in order.",
  path: "/learn",
});

export default function LearnPage() {
  // Get static articles for SEO - Google will see this content immediately
  const staticArticles = getPublicArticles();

  return (
    <PublicPageLayout>
      <PublicLearningHero />

      {/* Server-rendered article links for SEO crawlers */}
      <nav className="sr-only" aria-label="Article index for search engines">
        <h2>Family Legacy Planning Articles</h2>
        <ul>
          {staticArticles.map((article) => (
            <li key={article.slug}>
              <Link href={`/learn/${article.slug}`}>
                <strong>{article.title}</strong>
              </Link>
              <p>{article.excerpt}</p>
            </li>
          ))}
        </ul>
      </nav>

      {/* Client component with full interactive content */}
      <LearnArticlesSection />
    </PublicPageLayout>
  );
}
