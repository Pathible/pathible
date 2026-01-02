# Biblical Wisdom Rotation Feature - Design Specification

## Overview

A reusable component that displays rotating biblical wisdom throughout the Pathible app, reinforcing the faith-centered identity and providing moments of spiritual grounding during legacy planning tasks.

**Design Philosophy:**
- Gentle, not preachy - wisdom appears naturally, not forced
- Contextually relevant - verses match the section's purpose
- Visually subtle - complements rather than dominates the UI
- Spiritually grounding - reminds users of the "why" behind their planning

---

## 1. Feature Scope

### MVP (Phase 1)
- Single reusable `<BiblicalWisdom />` component
- Hardcoded collection of ~30 curated verses
- Random rotation on each page load
- Deployed on Dashboard and Faith & Finances sections

### V2 (Phase 2)
- Database-backed verse storage (`biblicalWisdom` table)
- Admin management via Content Manager
- Category/tag system for contextual display
- Deployed across all major sections

### V3 (Phase 3)
- User favorites/bookmarks
- Share functionality
- Journey-based progression (verses unlock as user completes tasks)
- Daily verse notification option

---

## 2. Component Design

### Primary Component: `<BiblicalWisdom />`

```tsx
// /src/components/biblical-wisdom/BiblicalWisdom.tsx

interface BiblicalWisdomProps {
  /** Which context to pull verses from */
  context?: "general" | "stewardship" | "legacy" | "family" | "wisdom" | "protection";
  /** Visual variant */
  variant?: "card" | "inline" | "banner";
  /** Whether to show the category label */
  showCategory?: boolean;
  /** Custom className for styling */
  className?: string;
}
```

### Visual Variants

#### Card Variant (Default)
Best for: Dashboard, section headers, dedicated wisdom areas

```tsx
<Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
  <CardContent className="py-6">
    <div className="flex gap-4">
      <div className="shrink-0">
        <BookOpen className="h-6 w-6 text-primary/60" />
      </div>
      <div>
        <blockquote className="text-base italic text-foreground/90 mb-2">
          "For where your treasure is, there your heart will be also."
        </blockquote>
        <cite className="text-sm font-medium text-primary">
          Matthew 6:21
        </cite>
      </div>
    </div>
  </CardContent>
</Card>
```

#### Inline Variant
Best for: Sidebars, compact spaces, lists

```tsx
<div className="border-l-4 border-primary/50 pl-4 py-2">
  <p className="text-sm italic text-muted-foreground">
    "The prudent see danger and take refuge."
  </p>
  <p className="text-xs font-medium text-primary mt-1">
    Proverbs 27:12
  </p>
</div>
```

#### Banner Variant
Best for: Page headers, welcome areas

```tsx
<div className="bg-primary/5 rounded-lg px-6 py-4 text-center">
  <p className="text-lg italic text-foreground/90 mb-1">
    "Honor the Lord with your wealth, with the firstfruits of all your crops."
  </p>
  <p className="text-sm font-medium text-primary">
    Proverbs 3:9
  </p>
</div>
```

---

## 3. Verse Collection

### Category: General (Dashboard)
Foundational verses about stewardship and planning.

| Verse | Reference | Theme |
|-------|-----------|-------|
| "For where your treasure is, there your heart will be also." | Matthew 6:21 | Heart posture |
| "The earth is the Lord's, and everything in it." | Psalm 24:1 | Ownership |
| "Whoever can be trusted with very little can also be trusted with much." | Luke 16:10 | Faithfulness |
| "Commit to the Lord whatever you do, and he will establish your plans." | Proverbs 16:3 | Trust |
| "But seek first his kingdom and his righteousness, and all these things will be given to you as well." | Matthew 6:33 | Priorities |

### Category: Stewardship (Financial)
Verses about money, generosity, and financial wisdom.

| Verse | Reference | Theme |
|-------|-----------|-------|
| "Honor the Lord with your wealth, with the firstfruits of all your crops." | Proverbs 3:9 | Giving first |
| "Give, and it will be given to you." | Luke 6:38 | Generosity |
| "The generous will themselves be blessed, for they share their food with the poor." | Proverbs 22:9 | Blessing others |
| "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." | 2 Corinthians 9:7 | Joyful giving |
| "Do not store up for yourselves treasures on earth... but store up for yourselves treasures in heaven." | Matthew 6:19-20 | Eternal perspective |

### Category: Legacy (Legacy Planning)
Verses about inheritance, future generations, and lasting impact.

| Verse | Reference | Theme |
|-------|-----------|-------|
| "A good person leaves an inheritance for their children's children." | Proverbs 13:22 | Generational thinking |
| "Children are a heritage from the Lord, offspring a reward from him." | Psalm 127:3 | Children as gift |
| "Tell it to your children, and let your children tell it to their children, and their children to the next generation." | Joel 1:3 | Passing on faith |
| "Start children off on the way they should go, and even when they are old they will not turn from it." | Proverbs 22:6 | Training |
| "I have been young, and now am old, yet I have not seen the righteous forsaken or their children begging bread." | Psalm 37:25 | God's provision |

### Category: Family (Family Ecosystem)
Verses about family relationships and unity.

| Verse | Reference | Theme |
|-------|-----------|-------|
| "How good and pleasant it is when God's people live together in unity!" | Psalm 133:1 | Unity |
| "Love is patient, love is kind. It does not envy, it does not boast, it is not proud." | 1 Corinthians 13:4 | Love |
| "Be completely humble and gentle; be patient, bearing with one another in love." | Ephesians 4:2 | Patience |
| "Above all, love each other deeply, because love covers over a multitude of sins." | 1 Peter 4:8 | Forgiveness |
| "As for me and my household, we will serve the Lord." | Joshua 24:15 | Family commitment |

### Category: Wisdom (Wisdom Entries)
Verses about wisdom, teaching, and passing on knowledge.

| Verse | Reference | Theme |
|-------|-----------|-------|
| "The fear of the Lord is the beginning of wisdom." | Proverbs 9:10 | Foundation |
| "Get wisdom, get understanding; do not forget my words or turn away from them." | Proverbs 4:5 | Pursuit |
| "Listen to advice and accept discipline, and at the end you will be counted among the wise." | Proverbs 19:20 | Teachability |
| "The wise store up knowledge, but the mouth of a fool invites ruin." | Proverbs 10:14 | Storing wisdom |
| "Teach us to number our days, that we may gain a heart of wisdom." | Psalm 90:12 | Mortality |

### Category: Protection (Vault)
Verses about God's protection and provision.

| Verse | Reference | Theme |
|-------|-----------|-------|
| "The Lord is my rock, my fortress and my deliverer." | Psalm 18:2 | Security |
| "The prudent see danger and take refuge, but the simple keep going and pay the penalty." | Proverbs 27:12 | Preparation |
| "The name of the Lord is a fortified tower; the righteous run to it and are safe." | Proverbs 18:10 | Refuge |
| "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty." | Psalm 91:1 | Rest |
| "Be strong and courageous. Do not be afraid... for the Lord your God goes with you." | Deuteronomy 31:6 | Courage |

---

## 4. Placement Strategy

### Dashboard
**Location:** Welcome area, below the greeting
**Variant:** Card
**Context:** General
**Rotation:** Daily (same verse all day for consistency)

```tsx
// Dashboard layout
<div className="space-y-6">
  <WelcomeHeader user={user} />
  <BiblicalWisdom context="general" variant="card" />
  <QuickActions />
  {/* ... */}
</div>
```

### Financial (Faith & Finances Tab)
**Location:** After the encouraging message footer
**Variant:** Card
**Context:** Stewardship
**Rotation:** Per session

### Legacy Page
**Location:** Page header area
**Variant:** Banner
**Context:** Legacy
**Rotation:** Per session

### Wisdom Page
**Location:** Sidebar or header
**Variant:** Inline
**Context:** Wisdom
**Rotation:** Per page load

### Vault Page
**Location:** Header area
**Variant:** Banner
**Context:** Protection
**Rotation:** Per session

### Family Page
**Location:** After family unit cards
**Variant:** Card
**Context:** Family
**Rotation:** Per session

---

## 5. Database Schema (V2)

```typescript
// convex/schema.ts

biblicalWisdom: defineTable({
  // Content
  verse: v.string(),           // The verse text
  reference: v.string(),       // e.g., "Matthew 6:21"
  book: v.string(),            // e.g., "Matthew"
  chapter: v.number(),         // e.g., 6
  verseNumber: v.string(),     // e.g., "21" or "19-20"

  // Categorization
  category: v.string(),        // "general" | "stewardship" | "legacy" | etc.
  themes: v.array(v.string()), // ["generosity", "heart", "priorities"]

  // Metadata
  translation: v.string(),     // "NIV" | "ESV" | "KJV" etc.
  isActive: v.boolean(),       // Can be toggled off by admin

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_category", ["category", "isActive"])
  .index("by_active", ["isActive"]),
```

---

## 6. Admin Management (V2)

### Content Manager Integration

Add a "Biblical Wisdom" section to the admin content manager:

```
/admin/content
├── Articles
├── Biblical Wisdom  ← New section
└── Tours
```

**Features:**
- List all verses with category filters
- Add/edit/delete verses
- Toggle active status
- Preview verse in different variants
- Bulk import from CSV

---

## 7. Rotation Logic

### MVP: Simple Random
```typescript
function getRandomVerse(context: string): Verse {
  const verses = VERSES.filter(v => v.category === context);
  return verses[Math.floor(Math.random() * verses.length)];
}
```

### V2: Daily Rotation with Variety
```typescript
function getDailyVerse(context: string, userId?: string): Verse {
  // Use date as seed for consistent daily verse
  const today = new Date().toISOString().split('T')[0];
  const seed = hashString(today + context);

  const verses = await getActiveVerses(context);
  const index = seed % verses.length;

  return verses[index];
}
```

### V3: Personalized Selection
Consider user's:
- Recently viewed verses (avoid repeats)
- Saved favorites (occasionally resurface)
- Current journey stage (unlock progressive verses)
- Time since last login (welcome back verses)

---

## 8. Animation & Transitions

### Fade-in on Load
```css
.verse-enter {
  opacity: 0;
  transform: translateY(10px);
}

.verse-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
```

### Subtle Pulse on Hover (Optional)
```css
.verse-card:hover {
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1);
}
```

---

## 9. Accessibility

| Feature | Implementation |
|---------|----------------|
| Screen readers | Proper `<blockquote>` and `<cite>` semantics |
| Color contrast | All text meets WCAG AA standards |
| Motion | Respects `prefers-reduced-motion` |
| Focus states | Visible focus ring on interactive elements |

---

## 10. Mobile Considerations

- Card variant: Full width, slightly reduced padding
- Banner variant: Smaller text, single line if possible
- Inline variant: Same as desktop
- Touch targets: If favoriting added, ensure 44x44px minimum

---

## 11. Implementation Checklist

### MVP (Phase 1)
- [ ] Create `src/components/biblical-wisdom/` directory
- [ ] Create `BiblicalWisdom.tsx` component with variants
- [ ] Create `verses.ts` with hardcoded verse collection
- [ ] Create `types.ts` for interfaces
- [ ] Create `index.ts` barrel export
- [ ] Add to Dashboard
- [ ] Add to Faith & Finances (Learning Center)
- [ ] Test responsive behavior

### V2 (Phase 2)
- [ ] Add `biblicalWisdom` table to Convex schema
- [ ] Create Convex queries: `list`, `getByCategory`, `getRandom`
- [ ] Create Convex mutations: `create`, `update`, `remove`, `toggleActive`
- [ ] Add admin UI for verse management
- [ ] Migrate hardcoded verses to database
- [ ] Add to remaining sections (Legacy, Wisdom, Vault, Family)

### V3 (Phase 3)
- [ ] Add user favorites functionality
- [ ] Add share capability
- [ ] Implement journey-based unlocking
- [ ] Add daily notification option
- [ ] Analytics: track which verses resonate most

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| User engagement | Users spend 2+ seconds on verse cards |
| Return visits | 10% increase in daily active users |
| Feature adoption | 50%+ of users see verses on each visit |
| Favorites (V3) | 20%+ of users save at least one verse |

---

## Summary

The Biblical Wisdom rotation feature provides:

1. **Spiritual grounding** throughout the legacy planning journey
2. **Contextual relevance** with category-based verse selection
3. **Visual consistency** with three flexible component variants
4. **Scalability** from hardcoded MVP to admin-managed database
5. **Brand reinforcement** of Pathible's faith-centered identity

This feature transforms Pathible from a tool that *mentions* faith to one that *breathes* faith throughout the entire experience.
