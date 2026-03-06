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
  tagline: "Get everything in one place for your family. So they never have to.",
  description:
    "Have you ever had to sort through a loved one's mess while grieving? We have. Pathible gets everything in one place for your family, so they never have to.",
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
    "Financial Clarity - Track accounts, property, and insurance",
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
      "Pathible helps you get everything in one place for your family. Store your important documents, track your finances, save your stories and letters, and write down your wishes. So when the time comes, your family finds what they need instead of searching through a mess. Rooted in Proverbs 13:22: 'A good man leaves an inheritance to his children's children.'",
  },
  {
    question: "How is Pathible different from Dropbox or Google Drive?",
    answer:
      "Dropbox stores files. Pathible helps you organize everything your family will need and add your story to it. You can write letters to your grandchildren, write down what you believe, and show them exactly where to find things. It's not just storage. It's everything in one place, with meaning.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Pathible uses bank-level encryption to protect all your documents and data. You own your data completely. We never sell or share your information. Your family's files stay private and secure.",
  },
  {
    question: "Who is Pathible for?",
    answer:
      "Pathible is for three groups: (1) People who have been through sorting a loved one's mess and never want to put their family through the same. (2) People watching their parents age and want to help them get organized. (3) Young families who want to start now. If you want your family to find what they need without the chaos, Pathible is for you.",
  },
  {
    question: "How much does Pathible cost?",
    answer:
      "Pathible offers three plans: Foundations for getting started, Heritage for more storage and features, and Legacy for families who want everything. Visit our pricing page for current rates.",
  },
  {
    question: "What is the Heritage Vault?",
    answer:
      "The Heritage Vault is where you store your important files. Wills, insurance, passwords, deeds, medical records. Everything organized so your family can find it. You can share it with them and they'll know exactly where everything is.",
  },
  {
    question: "What is Financial Clarity?",
    answer:
      "Financial Clarity helps you document your family's financial picture in one place. Track bank accounts, investments, property, and insurance policies. Add notes about beneficiaries and key contacts. When your family needs to find things, they'll know exactly where to look.",
  },
  {
    question: "What are Wisdom & Stories?",
    answer:
      "Wisdom & Stories is where you save what matters most. Write your stories. Write letters to your kids and grandkids (even ones not born yet). Write down what you believe. Your family will read these again and again.",
  },
  {
    question: "What is Legacy Planning in Pathible?",
    answer:
      "Legacy Planning helps you write down your wishes and who to call. Doctors, lawyers, advisors. You show your family where everything is. The goal is simple: your family gets clarity instead of confusion when they need it most.",
  },
] as const;

// =============================================================================
// Executor FAQ Content - Used for both UI and FAQPage schema
// =============================================================================
export const EXECUTOR_FAQ_ITEMS = [
  {
    question: "What is estate administration?",
    answer:
      "Estate administration is the process of settling someone's affairs after they pass away. This includes gathering assets, paying debts and taxes, distributing property to beneficiaries, and filing required court documents. As executor, you're responsible for managing this process — Pathible gives you a clear path to follow.",
  },
  {
    question: "Do I need a lawyer to settle an estate?",
    answer:
      "It depends on the complexity of the estate. Simple estates with clear wills may not require an attorney. Complex estates with disputes, business interests, or multi-state property often do. Pathible helps you organize everything regardless — and makes working with an attorney more efficient if you need one.",
  },
  {
    question: "How is Pathible different from hiring a probate attorney?",
    answer:
      "Pathible doesn't replace legal counsel. It's the organizational backbone that keeps you on track. Think of it this way: your attorney handles the legal strategy, Pathible handles the day-to-day tracking of tasks, assets, documents, and communications.",
  },
  {
    question: "What if there's no will?",
    answer:
      "When someone dies without a will (called 'dying intestate'), state laws determine how assets are distributed. The process is more complex but still manageable. Pathible's checklist adapts to intestate situations and helps you navigate the additional court requirements.",
  },
  {
    question: "How long does estate administration take?",
    answer:
      "Most estates take 6 to 18 months to fully settle, though simple estates can close faster and complex ones may take longer. Pathible helps you track progress across every phase so nothing falls through the cracks.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Pathible uses bank-level encryption to protect all your documents and data. Estate records are especially sensitive — we treat security as a core feature, not an afterthought. You own your data completely and can export or delete it anytime.",
  },
] as const;

// =============================================================================
// Executor SoftwareApplication Schema
// =============================================================================
export const executorSoftwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SEO_CONFIG.baseUrl}/#executor-software`,
  name: "Pathible Estate Administration",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Estate administration guidance with 48 expert-curated steps. Track assets, manage documents, and settle an estate with confidence.",
  url: `${SEO_CONFIG.baseUrl}/for-executors`,
  provider: { "@id": `${SEO_CONFIG.baseUrl}/#organization` },
  featureList: [
    "48-step expert-curated estate checklist",
    "Asset and property tracker",
    "Secure document vault for estate records",
    "Distribution tracking and documentation",
    "Communications log for attorneys, banks, and family",
    "Complete estate export and reporting",
  ],
};

// =============================================================================
// Executor FAQPage Schema - Generated from EXECUTOR_FAQ_ITEMS
// =============================================================================
export const executorFaqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: EXECUTOR_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

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
  executors: [
    "estate administration checklist",
    "executor checklist after death",
    "how to settle an estate",
    "estate executor guide",
    "probate checklist",
    "estate administration software",
    "executor responsibilities",
  ],
} as const;
