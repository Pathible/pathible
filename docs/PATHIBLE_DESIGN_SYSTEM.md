# Pathible Design System - Next.js 16 + Tailwind CSS v4

Complete migration guide and reference for the Pathible design system.

## What Changed

### From Vite + Tailwind v3 → Next.js 16 + Tailwind v4

1. **CSS Structure**: Moved from `@tailwind base/components/utilities` to `@import "tailwindcss"`
2. **Theme Configuration**: Moved from `tailwind.config.ts` to `@theme inline` block in CSS
3. **Color Tokens**: All custom colors now exposed via `@theme inline` for Tailwind utilities
4. **Font System**: Added Inter font alongside existing Geist Sans, Geist Mono, and Crimson Text

## Color Palette

### Pathible Foundation Colors

```css
/* Light Mode */
--background: hsl(36, 33%, 95%)  /* Warm sand #F6F4F1 */
--foreground: hsl(0, 0%, 17%)    /* Deep charcoal #2C2C2C */
--primary: hsl(130, 25%, 39%)    /* Forest green #4B7F52 */
--secondary: hsl(135, 17%, 56%)  /* Sage green #7BA083 */
--accent: hsl(46, 65%, 52%)      /* Rich gold #D4AF37 */
--muted: hsl(30, 4%, 53%)        /* Warm gray #8B8680 */
--card: hsl(0, 0%, 100%)         /* Pure white */
```

### Custom Pathible Tokens

Available as Tailwind utilities: `bg-pathible-{color}`, `text-pathible-{color}`, `border-pathible-{color}`

- `pathible-sand` - Warm sand background
- `pathible-charcoal` - Deep charcoal text
- `pathible-forest` - Forest green (brand primary)
- `pathible-gold` - Rich gold accent
- `pathible-sage` - Sage green secondary
- `pathible-warm-gray` - Warm gray for muted elements
- `pathible-deep-gold` - Deeper gold for hover states
- `pathible-green-hover` - Hover state for green buttons
- `pathible-green-active` - Active state for green buttons

### Admin Theme Colors

For admin/dashboard interfaces:

- `admin-bg` - Dark background
- `admin-card` - Card background
- `admin-text` - Light text
- `admin-border` - Border color

## Typography

### Font Families

```tsx
// Available as Tailwind utilities
font - inter; // Inter - UI text (default body)
font - crimson; // Crimson Text - Headings (default h1-h6)
font - sans; // Geist Sans - Alternative sans-serif
font - mono; // Geist Mono - Code/monospace
```

### Type Scale Utilities

```tsx
<h1 className="text-h1">Display Heading</h1>        // 36px mobile, 48px desktop
<h2 className="text-h2">Section Title</h2>          // 24px mobile, 32px desktop
<h3 className="text-h3">Subsection</h3>             // 20px
<p className="text-body">Body text</p>              // 18px
<p className="text-secondary">Secondary text</p>    // 16px
<span className="text-small">Small text</span>      // 14px
<span className="text-caption">Caption</span>       // 12px
```

## Component Classes

### Button Variants

```tsx
// Primary action button (Forest green)
<button className="btn-primary">Save Changes</button>

// Secondary action button (Sage green with lift effect)
<button className="btn-secondary">Learn More</button>

// Ghost button (Transparent with green border)
<button className="btn-ghost">Cancel</button>

// Accent button (Gold with lift effect)
<button className="btn-accent">Get Started</button>
```

All buttons include:

- Minimum 44px height for accessibility
- Focus ring with gold accent
- Smooth transitions
- Active state animations

### Card Components

```tsx
// Standard dashboard card with hover effect
<div className="dashboard-card">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>

// Admin theme card
<div className="admin-card p-6">
  <h3>Admin Content</h3>
</div>

// Apply admin theme to sections
<section className="admin-theme p-8">
  <div className="admin-card">...</div>
</section>
```

### Form Inputs

```tsx
// Styled input field with focus states
<input type="text" className="input-field w-full" placeholder="Enter text..." />
```

Features:

- 2px sage green border
- Gold focus ring
- Smooth transitions
- Accessible contrast

### Loading States

```tsx
// Skeleton loader
<div className="skeleton h-10 w-full rounded-lg"></div>

// Spinner
<div className="spinner"></div>

// Checkmark animation (for SVG)
<svg className="w-16 h-16">
  <path className="checkmark" d="..." />
</svg>
```

## Dark Mode

Dark mode is implemented using the `.dark` class on parent elements:

```tsx
// Next.js example with next-themes
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class" defaultTheme="light">
  {children}
</ThemeProvider>;
```

Dark mode colors automatically adjust:

- Background becomes charcoal
- Text becomes warm sand
- Cards get darker tones
- Borders become subtle

## Using Custom Colors

### Direct HSL Usage

```tsx
// For hover states
<button className="bg-primary hover:bg-[hsl(130,25%,32%)]">
  Hover Me
</button>

// For custom text colors
<span className="text-[hsl(46,65%,52%)]">Gold Text</span>
```

### Via Design Tokens

```tsx
// Using Pathible custom tokens
<div className="bg-pathible-sand border-pathible-sage">
  <h2 className="text-pathible-forest">Forest Green Heading</h2>
  <button className="bg-pathible-gold hover:bg-pathible-deep-gold">
    Gold Button
  </button>
</div>
```

## Sidebar Tokens

For navigation sidebars:

```tsx
// Sidebar uses special tokens
<aside className="bg-sidebar-background border-sidebar-border">
  <button className="text-sidebar-foreground hover:bg-sidebar-accent">
    Navigation Item
  </button>
</aside>
```

## Spacing & Layout

### Standard Spacing Scale

Uses Tailwind's default spacing (rem-based):

- `p-2` = 0.5rem (8px) - Tight
- `p-4` = 1rem (16px) - Default small
- `p-6` = 1.5rem (24px) - Medium (used in cards)
- `p-8` = 2rem (32px) - Large sections
- `p-12` = 3rem (48px) - Hero spacing

### Border Radius

```tsx
// Available radius utilities
rounded - sm; // --radius-sm (calc(0.5rem - 4px))
rounded - md; // --radius-md (calc(0.5rem - 2px))
rounded - lg; // --radius-lg (0.5rem) - Default
rounded - xl; // --radius-xl (calc(0.5rem + 4px))
```

## Best Practices

### Component Composition

```tsx
// Good: Reusable card component
export function FeatureCard({ title, description, icon }) {
  return (
    <div className="dashboard-card">
      <div className="text-pathible-gold mb-4">{icon}</div>
      <h3 className="text-h3 text-pathible-forest mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
```

### Accessible Forms

```tsx
// Good: Accessible form with proper labeling
<div className="space-y-2">
  <label htmlFor="email" className="text-small font-medium">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    className="input-field"
    aria-describedby="email-hint"
  />
  <p id="email-hint" className="text-caption text-muted-foreground">
    We'll never share your email.
  </p>
</div>
```

### Responsive Design

```tsx
// Good: Mobile-first responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="dashboard-card">Card 1</div>
  <div className="dashboard-card">Card 2</div>
  <div className="dashboard-card">Card 3</div>
</div>
```

## Animation Guidelines

### Transitions

All interactive elements should have smooth transitions:

- `transition-colors duration-200` - Color changes
- `transition-all duration-200` - Multiple properties
- `hover:-translate-y-0.5` - Subtle lift effect
- `active:scale-[0.98]` - Press feedback

### Custom Animations

The checkmark animation is available for success states:

```tsx
<svg viewBox="0 0 100 100" className="w-16 h-16">
  <path className="checkmark" d="M20,55 L40,75 L80,25" fill="none" />
</svg>
```

## File Locations

### Updated Files

1. **`/Users/jimgibbs/Code/pathible/src/app/globals.css`**

   - Complete Tailwind v4 migration
   - All Pathible colors and tokens
   - Component classes
   - Custom animations

2. **`/Users/jimgibbs/Code/pathible/src/app/layout.tsx`**
   - Added Inter font import
   - All font variables properly configured

### No Config File Needed

Tailwind v4 uses CSS-first configuration, so no `tailwind.config.ts` file is required. All theme customization happens in `globals.css` via the `@theme inline` block.

## Migration Checklist

- [x] Converted CSS to Tailwind v4 syntax
- [x] Preserved all Pathible brand colors
- [x] Added custom color tokens to theme
- [x] Implemented component classes
- [x] Added typography utilities
- [x] Configured Inter font
- [x] Maintained dark mode support
- [x] Added admin theme support
- [x] Preserved sidebar tokens
- [x] Implemented animations
- [x] Added border radius tokens

## Quick Reference

### Most Common Patterns

```tsx
// Hero section
<section className="bg-pathible-sand py-12 md:py-24">
  <h1 className="text-h1 text-pathible-forest">Welcome to Pathible</h1>
  <p className="text-body text-muted-foreground mt-4">Your family's story...</p>
  <button className="btn-primary mt-8">Get Started</button>
</section>

// Feature grid
<div className="grid md:grid-cols-3 gap-6">
  <div className="dashboard-card">
    <h3 className="text-h3 text-pathible-forest mb-2">Secure</h3>
    <p className="text-secondary">Bank-level encryption...</p>
  </div>
  {/* More cards... */}
</div>

// Form section
<form className="space-y-6 max-w-md">
  <input type="text" className="input-field" placeholder="Name" />
  <input type="email" className="input-field" placeholder="Email" />
  <button type="submit" className="btn-primary w-full">Submit</button>
</form>
```

## Support

For questions or issues with the design system, refer to this guide or check the implementation in `globals.css`.
