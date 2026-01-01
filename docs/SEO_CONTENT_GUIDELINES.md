# SEO & Content Guidelines for Pathible

This document provides guidelines for maintaining SEO quality and AI discoverability across Pathible's public pages.

---

## Heading Hierarchy Rules

Every page should follow proper semantic heading structure:

```
<h1> - Page title (one per page)
  <h2> - Major sections
    <h3> - Subsections
      <h4> - Details within subsections
```

**Guidelines:**
- Never skip heading levels (e.g., don't go from h1 to h3)
- Use headings for structure, not styling
- Include target keywords naturally in h1 and h2 tags
- Keep headings concise (under 60 characters for SEO)

---

## Meta Description Format

Each page needs a unique meta description in its layout or page metadata:

```typescript
export const metadata: Metadata = {
  title: "Page Title | Pathible",
  description: "150-160 characters describing the page content with primary keywords.",
  alternates: { canonical: "/page-path" },
};
```

**Guidelines:**
- Length: 150-160 characters (Google truncates at ~155)
- Include primary keyword within first 100 characters
- Write for humans, not just search engines
- Include a call-to-action when appropriate
- Make each description unique across pages

---

## Alt Text Guidelines

All images must have descriptive alt text:

```tsx
<Image
  src="/path/to/image.jpg"
  alt="Family gathering around table reviewing documents together"
/>
```

**Guidelines:**
- Describe the image content, not its purpose
- Include keywords naturally when relevant
- Keep alt text under 125 characters
- Don't start with "Image of" or "Picture of"
- For decorative images, use `alt=""`

---

## Internal Linking Strategy

**Link Structure:**
- Homepage links to all major feature pages
- Feature pages cross-link to related features
- All pages link back to homepage via navigation
- Use descriptive anchor text (not "click here")

**Anchor Text Examples:**
- Good: "secure document vault for families"
- Good: "family legacy planning tools"
- Bad: "click here"
- Bad: "learn more"

**Priority Pages (ensure linked from multiple locations):**
1. Homepage (`/`)
2. Pricing (`/pricing`)
3. Feature pages (future: `/features/vault`, `/features/wisdom`, etc.)

---

## Target Keywords by Persona

### Primary Keywords (Homepage)
- family legacy planning
- faith-based estate planning
- Christian family legacy
- digital document vault
- family story preservation
- secure family documents
- legacy planning platform

### Faith-Driven Families (40s-70s)
- pass down faith to grandchildren
- Christian inheritance planning
- leave a spiritual legacy
- family values preservation
- faith-based family planning
- biblical estate planning

### Adult Children / Caregivers
- organize parents documents
- help elderly parents paperwork
- digital estate organization
- family document management
- caregiver document checklist
- aging parents paperwork help

### Young Families Starting Early
- when to start estate planning
- new parent document checklist
- young family estate planning
- digital family vault
- organize family documents
- family planning for new parents

---

## JSON-LD Structured Data

All public pages should include appropriate structured data for AI discoverability.

**Available Schemas (in `src/lib/seo-config.ts`):**
- `organizationSchema` - Company information
- `websiteSchema` - Site-wide search/structure
- `softwareApplicationSchema` - Product categorization
- `faqPageSchema` - FAQ section for rich results

**Usage:**
```tsx
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo-config";

export default function Page() {
  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema]} />
      {/* Page content */}
    </>
  );
}
```

---

## FAQ Content for AI Discoverability

FAQs are critical for AI systems (ChatGPT, Claude, Perplexity) to cite Pathible accurately.

**Guidelines for FAQ Answers:**
- Write definitive, quotable statements
- Lead with the answer, then explain
- Include the question's keywords in the answer
- Keep answers between 50-150 words
- Avoid jargon; write at 8th-grade reading level

**Example:**
```
Q: What is Pathible?
A: Pathible is a faith-based family legacy platform designed to help
families preserve what matters most. It provides a secure digital vault
for important documents, tools for recording family stories and wisdom,
and features for planning how to pass down both material and spiritual
inheritances to future generations.
```

---

## Page-Specific SEO Checklist

Before publishing any new public page, verify:

- [ ] Unique, keyword-rich `<title>` tag (50-60 characters)
- [ ] Unique meta description (150-160 characters)
- [ ] Canonical URL set via `alternates.canonical`
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] All images have alt text
- [ ] Internal links use descriptive anchor text
- [ ] JSON-LD structured data included
- [ ] Page added to sitemap (`src/app/sitemap.ts`)
- [ ] Page accessible without auth (`src/proxy.ts`)

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/app/sitemap.ts` | Dynamic sitemap generation |
| `src/app/robots.ts` | Crawler directives |
| `src/app/layout.tsx` | Root metadata & Open Graph |
| `src/app/opengraph-image.tsx` | Dynamic OG image |
| `src/components/seo/JsonLd.tsx` | Structured data component |
| `src/lib/seo-config.ts` | Centralized schemas & FAQ |
| `src/proxy.ts` | Public route configuration |

---

## Testing & Validation Tools

After deploying, validate SEO using:

- [Google Search Console](https://search.google.com/search-console) - Indexing & errors
- [Google Rich Results Test](https://search.google.com/test/rich-results) - Structured data
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - OG tags
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Twitter cards
- [Schema.org Validator](https://validator.schema.org/) - JSON-LD validation

---

## Updating Content

When updating SEO content:

1. Update the source files listed above
2. Run `pnpm lint` to check for errors
3. Run `pnpm build` to verify production build
4. Test locally at relevant URLs
5. After deploy, use validation tools to verify
