import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.pathible.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Protected auth routes
          "/dashboard/",
          "/vault/",
          "/wisdom/",
          "/legacy/",
          "/financial/",
          "/family/",
          "/family-preferences/",
          "/profile-settings/",
          "/migrate/",
          // Admin routes
          "/admin/",
          "/estate/",
          "/share/",
          "/unsubscribe",
          // API routes
          "/api/",
          // Onboarding and plan selection (post-signup)
          "/onboarding/",
          "/select-plan/",
          // Clerk auth routes
          "/sign-in/",
          "/sign-up/",
          "/sign-out/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
