# Component Polish Patterns

## Cards

### Action Collapse

AI shows every action on every card. Professional cards use progressive disclosure:

**Before (AI-generated)**:

```
┌─────────────────────────────────────────┐
│ My Link                                  │
│ https://example.com/very-long-url        │
│ Created: Feb 16, 2026                    │
│ [Edit] [Delete] [Copy] [Share] [Stats]  │
│ [Marketing] [Social] [Q1]               │
└─────────────────────────────────────────┘
```

**After (polished)**:

```
┌─────────────────────────────────────────┐
│ My Link              Feb 16    847  •••  │
│ example.com/ver...   🔗 📊 🏷           │
└─────────────────────────────────────────┘
```

Key changes:

- Title and compact date on the same line
- Click count pulled to a prominent position
- Triple-dot menu replaces button row
- Tag chips replaced with small icons
- Full URL truncated
- Actions available in dot menu on click

### Card Spacing

- Internal padding: 12-16px (not 24px)
- Gap between cards: 8-12px
- Border: 1px subtle (not 2px)
- Border radius: 8px (not 16px)
- Shadow: none or shadow-sm (not shadow-lg)

## Buttons

### Hierarchy

Every view should have at most ONE primary button. Everything else is secondary or ghost.

- **Primary**: Filled background with accent color. One per view
- **Secondary**: Outlined or ghost. For less important actions
- **Ghost**: Text only, no border. For tertiary actions
- **Destructive**: Red/danger variant. Only for delete/remove actions

### Sizing

- Default: `h-9 px-4 text-sm`
- Small (in cards, tables): `h-7 px-3 text-xs`
- Large (hero CTAs): `h-11 px-6 text-base`

## Popovers & Dropdowns

### Triple-Dot Menu Content

Group actions logically with dividers:

```
┌─────────────┐
│ Edit         │
│ Duplicate    │
│ Copy URL     │
├─────────────┤
│ Share...     │
│ Move to...   │
├─────────────┤
│ Delete       │  ← Red text
└─────────────┘
```

### Filter Dropdowns

- Use multi-select checkboxes for filters
- Show active filter count as a badge
- Include a "Clear all" action
- Position consistently (below the trigger, left-aligned)

## Status Indicators

### Use Dots, Not Badges

Instead of large colored badges with text:

```
Before:  [✅ Active]  [⚠️ Expiring]  [❌ Expired]
After:   🟢 Active    🟡 Expiring    🔴 Expired
```

Even better, use small CSS circles:

```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
```

### Progress Indicators

- Use thin progress bars for quota/usage (height: 4-6px)
- Color transitions: green (0-60%), yellow (60-85%), red (85-100%)
- Show fraction text alongside: "847 / 1,000"

## Tabs

### Style Guidelines

- Underline style tabs for page-level navigation
- Pill/segment style tabs for in-section switching
- Active tab: border-bottom accent color (underline) or filled background (pill)
- Inactive: muted text, no border
- Tab count visible as subtle badge if relevant

### Tab Content Transitions

- No animation on tab switch (instant content swap)
- Loading skeleton if content is async
- Preserve scroll position within tabs

## Date Display

### Formatting Rules

- Relative for recent: "2h ago", "Yesterday", "3 days ago"
- Compact for older: "Feb 16", "Jan 3, 2025"
- Full only on hover/tooltip: "February 16, 2026 at 2:30 PM EST"
- Never show timestamps in card/list views

## Empty States

AI often ignores empty states entirely. Always design them:

- Illustration or icon (subtle, on-brand)
- Clear message: what would be here and how to add it
- Single CTA button to take the first action
- Keep it minimal. One sentence, one button

## Loading States

- Use skeleton screens, not spinners, for content areas
- Match the skeleton shape to the expected content layout
- Subtle pulse animation on skeletons
- Spinners only for discrete actions (button submissions, saves)

## Tooltips

- Use for icon-only buttons/actions to provide labels
- Keep tooltip text to 2-5 words
- Delay: 300-500ms before appearing
- Position: above the element by default
- No tooltips on touch devices
