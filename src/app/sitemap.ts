import type { MetadataRoute } from "next";

/**
 * Public article slugs for sitemap generation
 * These should be kept in sync with the seed data in convex/seeds/articles.ts
 */
const publicArticleSlugs = [
  // Beliefs & Values
  "what-does-biblical-stewardship-really-mean",
  "teaching-children-money-and-faith",
  // Family Legacy
  "five-conversations-every-family-should-have",
  "gift-of-clarity-why-your-family-needs-legacy-plan",
  // Financial Clarity
  "getting-your-financial-house-in-order",
  "understanding-insurance-what-your-family-needs-to-know",
  // Legal Basics & Digital Access
  "essential-documents-every-family-should-have",
  "creating-document-access-map-for-loved-ones",
  // Public Articles - Pathible Benefits
  "why-we-built-pathible",
  "getting-started-with-pathible",
  "what-makes-pathible-different",
  "dont-leave-your-family-a-mess-checklist",
  // SEO-Optimized Content
  "estate-planning-checklist-25-essential-documents",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pathible.com";

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2025-12-14"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2025-12-14"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic article pages
  const articlePages: MetadataRoute.Sitemap = publicArticleSlugs.map((slug) => ({
    url: `${baseUrl}/learn/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages];
}
