# Landing Page Patterns

## Why AI Landing Pages Fail

Landing pages are where you lose most customers if the UI looks AI-generated. There is a subconscious standard of quality that establishes trust. AI landing pages fail because they use generic icon+text feature grids, stock-feeling layouts, and lack any real visual substance.

## Core Principle

Landing pages are about presentation, not complexity. The better the presentation, the better the conversion. Focus on making fewer things look exceptional rather than showing everything.

## Graphics & Visual Assets

The single biggest improvement to any AI landing page is replacing generic icons with actual product visuals.

### Product Screenshots

- Use actual screenshots of your application as hero images and feature illustrations
- Apply subtle CSS transforms for depth and visual interest:
  - `transform: perspective(1000px) rotateY(-5deg)` for angled views
  - `transform: skewY(-2deg)` for dynamic feel
  - Combine with subtle shadow for floating effect
- Frame screenshots in browser chrome or device mockups
- Crop to highlight the most impressive/relevant part of the UI

### Feature Sections

Instead of icon + heading + paragraph grids:

- Show a cropped, annotated screenshot of the feature in action
- Use the same visual treatment (skew, shadow, perspective) consistently
- Alternate image left/right for visual rhythm
- Each feature section should demonstrate, not describe

### Hero Section

- Product screenshot or animated demo as the primary visual
- Keep the headline to one clear value proposition
- One primary CTA button, one secondary link at most
- Subtle background texture or gradient (not solid white or solid dark)

## Layout Patterns

### Section Structure

```
┌─────────────────────────────────────────┐
│            HERO                          │
│  Headline + subhead + CTA + product img │
├─────────────────────────────────────────┤
│         SOCIAL PROOF BAR                │
│   Logo strip or key metric              │
├─────────────────────────────────────────┤
│         FEATURE 1                       │
│   Screenshot left  |  Text right        │
├─────────────────────────────────────────┤
│         FEATURE 2                       │
│   Text left  |  Screenshot right        │
├─────────────────────────────────────────┤
│         PRICING                         │
│   2-4 plan cards, current highlighted   │
├─────────────────────────────────────────┤
│         TESTIMONIALS                    │
│   2-3 quotes with names and photos      │
├─────────────────────────────────────────┤
│         FINAL CTA                       │
│   Repeat primary action                 │
├─────────────────────────────────────────┤
│         FOOTER                          │
│   Links, legal, social                  │
└─────────────────────────────────────────┘
```

### Spacing

- Generous vertical spacing between sections (80-120px)
- Tighter internal spacing within sections
- Max content width of 1200px, centered
- Full-width backgrounds with contained content

## Pricing Section

### AI Pricing Anti-Patterns

- 5+ plan tiers (overwhelming)
- Price less prominent than plan name
- No indication of what the upgrade gets you
- Discount not shown clearly
- Feature lists that are identical except one item

### Professional Pricing Pattern

- 3-4 tiers maximum. Drop the least popular tier
- Plan name: small text. Price: largest text
- Show the discount if there is one ("Save 20%")
- Highlight what the NEXT tier adds (not what it includes)
- Visually emphasize the recommended plan (border, scale, badge)
- Annual/monthly toggle with clear savings indicator
- Enterprise tier can be a "Contact us" card

Example structure:

```
┌──────────┬──────────────┬──────────┐
│ Standard │ Pro          │ Business │
│          │ ★ Popular    │          │
│ $9/mo    │ $29/mo       │ Custom   │
│          │ $19/mo billed│          │
│          │ annually     │          │
│          │ Save 34%     │          │
│          │              │          │
│ 1k links │ Everything   │ Everything│
│ Basic    │ in Standard  │ in Pro   │
│ analytics│ + Analytics  │ + SSO    │
│          │ + Custom     │ + SLA    │
│          │   domains    │ + API    │
│          │ + Team (5)   │          │
│ [Start]  │ [Get Pro]    │ [Contact]│
└──────────┴──────────────┴──────────┘
```

## Typography for Landing Pages

- Display font for hero headline (something with character)
- Clean, readable body font for descriptions
- Large headline sizes (48-72px for hero)
- Generous line height for body text (1.6-1.8)
- Limit to 60-70 characters per line for readability

## Animation

- Staggered fade-in on scroll for sections
- Subtle parallax on hero product image
- Hover effects on interactive elements
- Keep animations under 300ms for snappiness
- Use `prefers-reduced-motion` media query as a fallback
