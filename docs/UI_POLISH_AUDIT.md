# UI Polish Audit Report

**Date:** February 16, 2026
**Scope:** Full application - public pages, authenticated dashboard, admin portal
**Method:** Visual inspection + code review against the UI Polish skill checklist

---

## Executive Summary

Pathible has strong bones: the copy is excellent, the information architecture makes sense, and the color palette (warm sand, forest green, gold) is well-chosen for a faith-based family platform. However, the UI has several telltale AI-generated patterns that undermine the premium feel the product deserves. The single biggest issue is the **ubiquitous sage-green bordered cards** that make every page look like a wireframe prototype rather than finished software.

**Overall grade: B-** -- Good foundation, needs targeted polish to feel production-ready.

---

## Critical Issues (Fix First)

### 1. The Border Problem -- "Everything Looks Like a Wireframe"
**Severity: HIGH | Affects: Every page**

Nearly every content container uses a visible 1-2px sage-green border with rounded corners. This "boxes within boxes" pattern is the #1 visual indicator that the UI was AI-generated. On the dashboard alone, there are 4 stat cards, a "Next Step" card, and a "Daily Reflection" card -- all with prominent green borders.

**Where it appears:**
- `src/app/(auth)/(dashboard)/dashboard/components/dashboard-stat-card.tsx` -- `border-2` on Card
- Every `<Card>` usage across the app inherits visible borders from `globals.css` (`--border: 135 17% 56%`)
- Vault KPI cards, Financial sections, Wisdom navigation cards, Family unit cards, Legacy wizard, Admin cards

**Fix:**
- Change the global `--border` variable from sage green to a subtle neutral (e.g., `210 8% 88%` or `30 6% 88%`)
- Remove `border-2` from stat cards; use `border` (1px) or no border with subtle shadow
- Use background color differentiation instead of borders for card hierarchy
- Reserve colored borders for active/selected states only

**Files to change:**
- `src/app/globals.css` (lines 95-96: `--border` and `--input` variables)
- `src/app/(auth)/(dashboard)/dashboard/components/dashboard-stat-card.tsx` (line 48)
- Audit all Card usages across dashboard pages

---

### 2. Landing Page Has No Product Visuals
**Severity: HIGH | Affects: `src/app/page.tsx`, all marketing components**

The landing page is entirely text and icons -- there isn't a single screenshot, mockup, or visual proof of the product. The feature cards (Heritage Vault, Financial Clarity, Wisdom & Stories, Legacy Planning) use the classic AI pattern: icon + heading + paragraph.

**What's missing:**
- Hero section: No product screenshot or demo visual
- Feature sections: Generic icon+text cards instead of actual app screenshots
- "How Pathible Works" (4 steps): Numbered circles (01-04) with text -- very generic
- No social proof (testimonials, user count, press mentions)

**Fix:**
- Add actual product screenshots to the hero section (angled with `perspective()` transform)
- Replace feature cards with screenshot + description layouts (alternating left/right)
- Add at least 2-3 testimonial quotes
- Consider a brief animated demo or product walkthrough

**Files to change:**
- `src/components/marketing/hero.tsx`
- `src/components/marketing/modules-preview.tsx`
- `src/components/marketing/value-pillars.tsx`
- `src/components/marketing/how-it-works.tsx`

---

### 3. KPI Cards Are Bare Numbers
**Severity: MEDIUM | Affects: Dashboard, Vault, Financial, Admin**

Every KPI/stat card is just a number + label + description. No sparklines, no deltas, no trend indicators, no context. The dashboard shows "0" for Heritage Vault and "0%" for Legacy Plan -- bare numbers that don't tell the user anything actionable.

**Current pattern (dashboard-stat-card.tsx):**
```
[Icon]                    [Arrow]
42
Heritage Vault
Safe for your family someday
```

**Should be:**
```
Heritage Vault
42 documents         +3 this week
[sparkline/mini chart]
```

**Files to change:**
- `src/app/(auth)/(dashboard)/dashboard/components/dashboard-stat-card.tsx`
- `src/app/(auth)/(dashboard)/vault/page.tsx` (vault KPI cards)
- `src/app/(auth)/(dashboard)/financial/components/financial-content.tsx`
- `src/app/(auth)/admin/page.tsx`

---

## Major Issues

### 4. Pricing Page Anti-Patterns
**Severity: MEDIUM | Affects: `src/app/(unauth)/select-plan/`**

- Plan descriptions are **massive paragraphs** (5+ sentences each) that no one will read
- Feature lists across tiers are nearly identical -- the classic mistake of showing what each tier *includes* rather than what it *adds*
- No visual emphasis on the recommended plan (Heritage should be highlighted)
- No annual savings percentage displayed prominently
- "Switch to this plan" buttons all have equal visual weight

**Fix:**
- Cut plan descriptions to 1 sentence max
- Show what each upgrade ADDS, not what it includes
- Scale up the Heritage tier card (recommended) with a border or badge
- Show "Save X%" prominently on the annual toggle
- Primary CTA on recommended plan, ghost buttons on others

---

### 5. Profile Settings Is a Long Scroll
**Severity: MEDIUM | Affects: `src/app/(auth)/(dashboard)/profile-settings/page.tsx`**

The settings page dumps everything on one scrolling page: Personal Info, Contact Info, Subscription, and Danger Zone. Per the settings reference, this should use **tabbed organization**.

**Fix:**
- Add tabs: "Profile" | "Subscription" | "Account"
- Profile tab: Name, email, contact info
- Subscription tab: Plan display, billing details, change plan
- Account tab: Danger zone (delete account)

---

### 6. Avatar Circles Use Gradient Green
**Severity: MEDIUM | Affects: Family page, header**

The circular avatar initials (JG, EG, MG) use a gradient green fill -- a classic AI-generated pattern. The header also shows "JG" in a green circle.

**Fix:**
- Use a muted neutral background for avatar circles (e.g., warm gray or sand)
- Or use a subtle single-tone color (not gradient)
- Consider using actual profile photos when available

**Files to change:**
- Header user menu component
- `src/app/(auth)/(dashboard)/family/page.tsx` (family member avatars)

---

### 7. Admin Tables Show Too Many Visible Actions
**Severity: MEDIUM | Affects: Admin content, admin email**

The content manager table shows **5 icon-only action buttons** per row (view, archive, lock, something, delete). The email templates table shows 3. This violates the progressive disclosure principle -- secondary actions should be in a triple-dot menu.

**Current:** `[eye] [folder] [lock] [clipboard] [trash]`
**Should be:** `[eye]  [...]` (with edit/archive/delete in dropdown)

**Files to change:**
- `src/app/(auth)/admin/content/page.tsx`
- `src/app/(auth)/admin/email/page.tsx`

---

### 8. Financial Account Row Shows Edit/Delete Inline
**Severity: LOW-MEDIUM | Affects: Financial Clarity page**

Each financial account row shows pencil and trash icons directly. These should be in a triple-dot menu.

**Files to change:**
- `src/app/(auth)/(dashboard)/financial/components/financial-content.tsx`

---

## Minor Issues

### 9. Excessive Section Spacing on Landing Page
**Severity: LOW | Affects: Landing page**

The gaps between landing page sections are very large (appears to be 100-150px+). The space between the manifesto card and the "Four Ways to Protect Your Family" section is particularly excessive.

**Fix:** Tighten section gaps to 80-100px max. The manifesto-to-features transition should be 64-80px.

---

### 10. "Navigation" Label in Sidebar
**Severity: LOW | Affects: `src/components/app-sidebar.tsx`**

The sidebar has a "Navigation" label above the nav items. This is redundant -- it's obviously navigation. Remove it.

**File:** `src/components/app-sidebar.tsx` (line 155)

---

### 11. Category Filter Chips on Vault Page
**Severity: LOW | Affects: Vault page**

The vault page shows 8 category filter chips, all showing "(0)". When empty, this feels cluttered. Consider hiding zero-count categories or using a dropdown filter instead.

---

### 12. "Coming Soon" Badge Style
**Severity: LOW | Affects: Wisdom page**

The "Coming Soon" badge on "Shared Wisdom Pages" uses a bright green circle + text that looks like a status indicator rather than a feature flag. Use a muted gray badge instead.

---

### 13. Duplicate Content Across Landing Page Sections
**Severity: LOW | Affects: Landing page marketing components**

The landing page has two feature grid sections that present the same 4 modules (Vault, Financial, Wisdom, Legacy) with different copy:
1. "Four Ways to Protect Your Family" -- icon + heading + paragraph cards
2. "Everything in one place" -- icon + heading + checklist cards

This is content repetition. Consolidate into one compelling section with visuals.

**Files to change:**
- `src/components/marketing/modules-preview.tsx`
- `src/components/marketing/value-pillars.tsx`

---

### 14. Save Buttons Use Accent Green When Disabled-Looking
**Severity: LOW | Affects: Profile Settings**

"Save Name" and "Save Contact Info" buttons appear in muted green even when no changes have been made. They should be ghost/disabled until the user actually modifies a field.

---

### 15. Wisdom Page Layout Feels Like a Menu
**Severity: LOW | Affects: Wisdom & Stories page**

The wisdom page shows 4 navigation cards (Share Wisdom, Library, Core Beliefs, Shared Pages) arranged in a 2x2 grid, plus 2 stat cards. This feels like a secondary navigation menu rather than a workspace. Consider showing recent entries or a writing prompt instead.

---

## What's Already Good

These elements should be preserved:

- **Color palette**: Sand/forest-green/gold is warm, distinctive, and on-brand. Not the typical AI blue
- **Typography**: Crimson serif for headings + Inter for body creates good contrast and personality
- **Copy quality**: Headlines like "Have you ever had to sort through a loved one's mess while grieving?" are powerful
- **Hero underline highlights**: The pink/gold underlines on key words in headings are a nice distinctive touch
- **Information architecture**: 6 clear nav items, logical page grouping
- **Trust indicators**: "Bank-level encryption / You own your data / Families of faith" bar is effective
- **Daily Reflection card**: The Bible verse + reflection on the dashboard is a nice on-brand touch
- **Legacy Planning wizard**: Progress bar + step-by-step questions is well-structured
- **Admin sidebar**: Clean grouping with MAIN and SETTINGS sections
- **Admin tables**: Functional with good column choices
- **Empty states**: Present and reasonably well-written (vault, properties, insurance)
- **Footer**: Clean, minimal, appropriate

---

## Prioritized Fix Order

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | Fix border color system (global `--border` to neutral) | Small | Huge -- transforms entire app feel |
| 2 | Add product screenshots to landing page | Medium | Huge -- conversion impact |
| 3 | Consolidate duplicate landing page sections | Small | Medium -- cleaner narrative |
| 4 | Enrich KPI cards (at least add trend context) | Medium | Medium -- feels more professional |
| 5 | Tab profile settings page | Medium | Medium -- better UX |
| 6 | Highlight recommended pricing tier | Small | Medium -- conversion impact |
| 7 | Collapse admin table actions to dot menu | Small | Medium -- cleaner admin |
| 8 | Fix avatar circles (remove gradient green) | Small | Small -- removes AI tell |
| 9 | Collapse financial account actions to dot menu | Small | Small -- consistency |
| 10 | Remove "Navigation" sidebar label | Tiny | Tiny -- polish |
| 11 | Tighten landing page spacing | Small | Small -- polish |
| 12 | Fix Coming Soon badge style | Tiny | Tiny -- polish |

---

## Summary of Files That Need Changes

### Global / Design System
- `src/app/globals.css` -- border color, input color variables

### Landing Page
- `src/components/marketing/hero.tsx` -- add product visual
- `src/components/marketing/modules-preview.tsx` -- consolidate or add screenshots
- `src/components/marketing/value-pillars.tsx` -- consolidate with modules-preview
- `src/components/marketing/how-it-works.tsx` -- less generic visual treatment

### Dashboard
- `src/app/(auth)/(dashboard)/dashboard/components/dashboard-stat-card.tsx` -- enrich KPI cards

### Vault
- `src/app/(auth)/(dashboard)/vault/page.tsx` -- category filter treatment

### Financial
- `src/app/(auth)/(dashboard)/financial/components/financial-content.tsx` -- collapse actions

### Family
- `src/app/(auth)/(dashboard)/family/page.tsx` -- avatar style

### Wisdom
- `src/app/(auth)/(dashboard)/wisdom/page.tsx` -- layout reconsideration

### Settings
- `src/app/(auth)/(dashboard)/profile-settings/page.tsx` -- add tabs

### Pricing
- `src/app/(unauth)/select-plan/page.tsx` -- tier emphasis, trim copy

### Admin
- `src/app/(auth)/admin/content/page.tsx` -- collapse row actions
- `src/app/(auth)/admin/email/page.tsx` -- collapse row actions

### Shared Components
- `src/components/app-sidebar.tsx` -- remove "Navigation" label
- Header component -- avatar circle style
