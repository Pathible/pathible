/**
 * SEO Configuration and Schema Templates for Pathible
 *
 * This file contains centralized SEO configuration including:
 * - JSON-LD schema templates for structured data
 * - FAQ content for AI discoverability
 * - Keyword targets
 */

export const SEO_CONFIG = {
  baseUrl: "https://pathible.com",
  siteName: "Pathible",
  tagline: "Don't leave them a mess. Leave them a blessing.",
  description:
    "Faith-based family legacy platform helping families preserve documents, stories, and values for generations.",
} as const;

// =============================================================================
// Organization Schema - Defines Pathible as an entity
// =============================================================================
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SEO_CONFIG.baseUrl}/#organization`,
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.baseUrl,
  logo: {
    "@type": "ImageObject",
    url: `${SEO_CONFIG.baseUrl}/pathible-logo.svg`,
    width: 200,
    height: 60,
  },
  description: SEO_CONFIG.description,
  foundingDate: "2025",
  sameAs: [
    "https://www.instagram.com/pathible.legacy/",
    "https://www.facebook.com/people/Pathible/61577949614554/",
  ],
};

// =============================================================================
// WebSite Schema - Site-wide schema with potential search action
// =============================================================================
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SEO_CONFIG.baseUrl}/#website`,
  url: SEO_CONFIG.baseUrl,
  name: SEO_CONFIG.siteName,
  description: SEO_CONFIG.description,
  publisher: {
    "@id": `${SEO_CONFIG.baseUrl}/#organization`,
  },
};

// =============================================================================
// SoftwareApplication Schema - Defines the product
// =============================================================================
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SEO_CONFIG.baseUrl}/#software`,
  name: SEO_CONFIG.siteName,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  description:
    "A faith-based family legacy platform that helps families preserve documents, stories, and values across generations.",
  url: SEO_CONFIG.baseUrl,
  provider: {
    "@id": `${SEO_CONFIG.baseUrl}/#organization`,
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "12",
    highPrice: "49",
    offerCount: "3",
  },
  featureList: [
    "Heritage Vault - Secure document storage",
    "Wisdom & Stories - Family story preservation",
    "Legacy Planning - Final wishes documentation",
    "Bank-level encryption",
    "Family member sharing",
    "Core beliefs documentation",
  ],
  screenshot: `${SEO_CONFIG.baseUrl}/opengraph-image`,
};

// =============================================================================
// FAQ Content - Used for both UI and FAQPage schema
// =============================================================================
export const FAQ_ITEMS = [
  {
    question: "What is Pathible?",
    answer:
      "Pathible is a faith-based family legacy platform that combines secure document storage with story preservation and legacy planning tools. It's designed for Christian families who want to organize important documents, preserve their life stories, and document their final wishes in one secure place. Rooted in Proverbs 13:22—'A good man leaves an inheritance to his children's children'—Pathible helps you leave a blessing, not a burden.",
  },
  {
    question: "How is Pathible different from Dropbox or Google Drive?",
    answer:
      "While cloud storage services like Dropbox store files, Pathible is purpose-built for family legacy. It provides guided prompts for documenting wishes, tools for writing letters to future generations, a Core Beliefs feature for recording family values, and organized categories specifically for estate and legacy documents. Unlike generic storage, Pathible helps you add meaning to what you store.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Pathible uses bank-level encryption (AES-256) to protect all documents and data. You own your data completely, and we never sell or share your information with third parties. Your family's legacy stays private and secure.",
  },
  {
    question: "Who is Pathible for?",
    answer:
      "Pathible serves three primary groups: (1) Faith-driven families in their 40s-70s building multigenerational legacies, (2) Adult children helping organize their aging parents' affairs and capture their stories, and (3) Young families who want to start documenting their legacy early. If you believe legacy is for your children's children, Pathible is for you.",
  },
  {
    question: "How much does Pathible cost?",
    answer:
      "Pathible offers three subscription plans: Foundations for families just starting their legacy journey, Growth for expanding legacies with more storage and features, and Heritage for comprehensive family archives with priority support. Visit our pricing page for current rates.",
  },
  {
    question: "What is the Heritage Vault?",
    answer:
      "The Heritage Vault is Pathible's secure document storage system. It organizes legal documents (wills, trusts, powers of attorney), financial documents (insurance policies, account information), property documents (deeds, vehicle titles), and personal documents (medical records, family history) in one searchable, shareable location. Your family will know exactly where to find everything.",
  },
  {
    question: "What are Wisdom & Stories?",
    answer:
      "Wisdom & Stories is Pathible's family storytelling feature. It helps you record life stories, write letters to loved ones (including those not yet born), document your Core Beliefs, and preserve the 'why' behind your life decisions for future generations. This is where legacy truly lives—not just in documents, but in the meaning behind them.",
  },
  {
    question: "What is Legacy Planning in Pathible?",
    answer:
      "Legacy Planning helps you document final wishes, key contacts (attorneys, financial advisors, doctors), create a Document Access Map showing where important items are located, and provide clear guidance to your family. The goal is simple: give your family clarity instead of confusion when they need it most.",
  },
] as const;

// =============================================================================
// FAQPage Schema - Generated from FAQ_ITEMS
// =============================================================================
export const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

// =============================================================================
// Helper function to generate page-specific metadata
// =============================================================================
export function generatePageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}) {
  const url = `${SEO_CONFIG.baseUrl}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SEO_CONFIG.siteName}`,
      description,
      url,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: `${SEO_CONFIG.baseUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${title} - ${SEO_CONFIG.siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | ${SEO_CONFIG.siteName}`,
      description,
      images: [`${SEO_CONFIG.baseUrl}/opengraph-image`],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

// =============================================================================
// Target Keywords by Persona
// =============================================================================
export const TARGET_KEYWORDS = {
  primary: [
    "family legacy planning",
    "faith-based estate planning",
    "Christian family legacy",
    "digital document vault",
    "family story preservation",
  ],
  faithFamilies: [
    "pass down faith to grandchildren",
    "Christian inheritance planning",
    "biblical legacy",
    "proverbs 13:22 inheritance",
    "spiritual legacy for children",
  ],
  caregivers: [
    "organize parents documents",
    "help elderly parents paperwork",
    "important documents for aging parents",
    "family document organization",
    "where to find parents will",
  ],
  youngFamilies: [
    "when to start estate planning",
    "new parent document checklist",
    "family traditions to start",
    "digital baby journal",
    "young family estate planning",
  ],
} as const;
