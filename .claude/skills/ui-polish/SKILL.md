---
name: ui-polish
description: Transform AI-generated or rough UI into professional, production-quality interfaces. Use this skill whenever the user asks to improve, polish, refine, or redesign any UI component, dashboard, landing page, settings page, billing page, or SaaS interface. Also trigger when the user mentions "make it look professional", "clean up the UI", "it looks like AI made it", "vibe coded", "make it production ready", or asks for design review of existing components. This skill applies to React, HTML/CSS, and any frontend code that needs visual refinement. Even if the user just says "make it look better" or "this looks generic", use this skill.
---

# UI Polish: From Vibe Code to Production Software

This skill transforms AI-generated or rough UI into interfaces that look like they were designed by a human with taste. AI-generated UIs have telltale patterns that immediately signal low quality. This skill systematically eliminates those patterns and replaces them with professional design decisions.

Before making any changes, read the relevant reference file for the type of UI being polished:

- **Dashboards & data-heavy pages**: Read `references/dashboard-patterns.md`
- **Landing pages & marketing**: Read `references/landing-page-patterns.md`
- **Settings, billing, account pages**: Read `references/settings-patterns.md`
- **General component polish**: Read `references/component-patterns.md`

For color theory and palette construction, always consult `references/color-system.md`.

## The AI Slop Checklist

Before writing any code, audit the existing UI against these common AI-generated anti-patterns. Every single one of these is a red flag that screams "AI made this":

### 1. Color Problems

AI always reaches for bright, saturated colors that clash. Look for:

- Bright blue backgrounds, especially dark blue dashboards
- Rainbow icon sets with no cohesion
- Gradient profile circles with initials
- Colors doing the work that information should do (colorful buttons/icons instead of actual data)

**Fix**: Muted, intentional palettes. One dominant color, one accent. Let data visualizations carry the color, not decorative elements. See `references/color-system.md`.

### 2. Layout Problems

AI loves to repeat information and waste space. Look for:

- The same KPIs appearing multiple times across different views
- Sidebars stuffed with links that belong in subpages
- Cards with too many visible actions (buttons, chips, tags all showing at once)
- Forms using full-page layouts when a modal would work better
- Even column distributions when asymmetry would communicate hierarchy better

**Fix**: Every piece of information appears exactly once. Collapse secondary actions into menus. Use modals for focused tasks. Create clear visual hierarchy through layout asymmetry.

### 3. Information Density Problems

AI either makes things too sparse or too busy, never finding the right density. Look for:

- Massive KPI cards with just a number and label
- Tables/lists missing useful secondary information
- Bar charts where a map, donut, or sparkline would tell a better story
- Missing micro-charts and inline visualizations

**Fix**: Pack useful information densely with good visual hierarchy. Add sparklines and micro-charts to KPIs. Show secondary data (icons, metadata) inline. Choose chart types that match the data story.

### 4. Component Problems

AI defaults to generic component choices. Look for:

- Action buttons displayed prominently when they should be in a dot menu
- Chips/tags taking up space when icons would suffice
- Full date strings where relative time or compact dates work better
- Settings pages as flat lists instead of tabbed sections

**Fix**: Collapse secondary actions into triple-dot menus. Use icon-only where labels are redundant. Group related settings into tabs. Use progressive disclosure.

### 5. Icon Problems

AI uses default or mismatched icon libraries. Look for:

- Heroicons or emoji used as primary icons
- Inconsistent icon weights/styles across the interface
- Icons used decoratively with no information value

**Fix**: Use a single, consistent icon library (Lucide, Phosphor, or similar). Icons should communicate information, not decorate. Every icon should have a purpose.

## The Polish Process

Follow this sequence when polishing any UI:

### Step 1: Audit

Run through the AI Slop Checklist above. Note every issue found.

### Step 2: Information Architecture

Before touching visuals, fix the information hierarchy:

- Remove duplicate information across views
- Decide what deserves primary, secondary, and tertiary visual weight
- Identify actions that should be hidden behind progressive disclosure
- Map out which data belongs on which page/tab

### Step 3: Color System

Apply a professional color palette (see `references/color-system.md`):

- Choose a single base hue for the brand/app identity
- Derive all other colors from that base
- Reserve saturated colors exclusively for data visualization and status indicators
- Backgrounds, borders, and text should use neutrals

### Step 4: Layout Restructure

Fix spatial composition:

- Tighten spacing globally (AI always uses too much padding)
- Left-align navigation elements
- Use asymmetric column layouts where appropriate (e.g., 2/3 + 1/3 for billing)
- Collapse busy sidebars into compact nav with popovers for secondary actions
- Convert sparse full-page forms into focused modals

### Step 5: Component Refinement

Polish individual components:

- Collapse visible button groups into triple-dot menus
- Replace text chips with icon-only indicators where context is clear
- Add micro-charts (sparklines, small donuts) to KPI displays
- Replace generic bar charts with contextually appropriate visualizations (maps for geo data, donuts for proportions, area charts for trends)
- Use tabs to organize complex pages (billing, settings, analytics)

### Step 6: Data Enrichment

Make the interface more informative without adding clutter:

- Add toggle controls for data views (e.g., split by individual items)
- Include secondary metadata inline with helpful icons
- Show comparison data and deltas where meaningful
- Use real data patterns in examples, not lorem ipsum

### Step 7: Landing Page (if applicable)

Landing pages lose customers if they look AI-generated. Apply these principles:

- Use actual screenshots/mockups of the product as graphics
- Replace generic icon+text feature blocks with visual previews
- Apply subtle transforms (skew, rotation) to product screenshots for depth
- Focus on presentation quality over feature quantity
- See `references/landing-page-patterns.md` for full guidance

## Code Standards

When writing the polished UI code:

### Typography

- Never use Inter, Roboto, Arial, or system fonts as the primary typeface
- Use a distinctive display font for headings paired with a clean body font
- Import from Google Fonts or use a bundled font
- Establish a clear type scale: use `text-xs` through `text-2xl` with purpose

### Spacing

- Tighten default spacing. AI always adds too much padding
- Use consistent spacing units (4px base grid)
- Cards: `p-4` not `p-6` or `p-8`
- Gaps between cards: `gap-3` or `gap-4`, not `gap-6`

### Borders & Shadows

- Use subtle borders (`border-gray-200` or custom muted borders)
- Avoid heavy drop shadows. Use `shadow-sm` or none
- Consider using border-left accents for status indication

### Animations

- Add subtle transitions on hover states (150-200ms)
- Use staggered reveal animations on page load for polish
- Keep motion purposeful, not decorative

### Dark Mode Considerations

- If building dark mode, use deep neutrals (not pure black)
- Reduce contrast slightly for comfortable reading
- Muted accent colors work better in dark themes

## What NOT to Do

- Do not add decorative gradients (especially purple-to-blue)
- Do not use gradient background circles for avatars/initials
- Do not repeat KPIs or summary data across multiple views
- Do not show all actions on cards. Collapse to dot menus
- Do not use bright icon colors. Use muted or monochrome icons
- Do not default to bar charts. Choose the right visualization for the data
- Do not make modals when a full page is needed, or full pages when a modal suffices
- Do not skip the audit step. Always check what exists before redesigning

## Framework-Specific Notes

### React / JSX

- Use Tailwind utility classes (they are available in Claude artifacts)
- Available libraries: `lucide-react`, `recharts`, `d3`, `shadcn/ui`
- Use `useState` for interactive states (tabs, toggles, popovers)
- Single-file components preferred for artifacts

### HTML / CSS

- Use CSS custom properties for the color system
- Prefer CSS Grid and Flexbox for layout
- Use `@import` for Google Fonts
- Keep JavaScript minimal and vanilla
