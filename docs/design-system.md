# Pathible Design System

> Complete component specifications and implementation guidelines for the Pathible UI.

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Typography](#typography)
3. [Colors](#colors)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Layout Patterns](#layout-patterns)
7. [Animation](#animation)
8. [Icons](#icons)

---

## Design Tokens

### CSS Custom Properties

All design tokens are defined as CSS custom properties in `globals.css`. Use these exclusively - never hardcode values.

```css
/* Usage in Tailwind */
bg-background      /* Warm sand background */
text-foreground    /* Deep charcoal text */
bg-primary         /* Forest green */
bg-secondary       /* Sage green */
bg-accent          /* Rich gold */
text-muted-foreground  /* Warm gray */
```

### Pathible Custom Colors

Beyond the standard shadcn/ui tokens, Pathible defines brand-specific colors:

```css
bg-pathible-sand       /* #F6F4F1 - Primary background */
bg-pathible-charcoal   /* #2C2C2C - Primary text */
bg-pathible-forest     /* #4B7F52 - Primary actions */
bg-pathible-sage       /* #7BA083 - Secondary elements */
bg-pathible-gold       /* #D4AF37 - Accents, focus */
bg-pathible-warm-gray  /* #8B8680 - Muted content */
bg-pathible-deep-gold  /* Darker gold for hover */
bg-pathible-green-hover   /* Darker green for hover */
bg-pathible-green-active  /* Darkest green for active */
```

---

## Typography

### Font Families

```css
font-crimson  /* Headings - Crimson Text serif */
font-inter    /* Body text - Inter sans-serif */
font-sans     /* System fallback - Geist Sans */
font-mono     /* Code - Geist Mono */
```

### Type Scale

| Class | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-h1` | 3rem/3.75rem | 1.1 | 600 | Page titles, hero |
| `text-h2` | 1.875rem/2.5rem | 1.25 | 600 | Section headers |
| `text-h3` | 1.5rem | 1.25 | 600 | Card titles |
| `text-body` | 1.125rem | 1.625 | 400 | Primary content |
| `text-secondary` | 1rem | 1.625 | 400 | Supporting text |
| `text-small` | 0.875rem | 1.5 | 400 | Labels, captions |
| `text-caption` | 0.75rem | 1.5 | 400 | Timestamps, hints |

### Heading Implementation

```tsx
// All headings use Crimson Text automatically via CSS
<h1 className="text-h1">Page Title</h1>
<h2 className="text-h2">Section Header</h2>
<h3 className="text-h3">Card Title</h3>

// Responsive headings (common pattern)
<h1 className="font-crimson text-4xl sm:text-5xl lg:text-6xl">
  Responsive Heading
</h1>
```

### Body Text

```tsx
// Standard body text
<p className="text-lg leading-relaxed">Content here</p>

// Muted supporting text
<p className="text-muted-foreground text-lg">
  Secondary content
</p>

// Small helper text
<p className="text-sm text-muted-foreground">
  Helper text
</p>
```

---

## Colors

### Semantic Color System

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `background` | `hsl(36, 33%, 95%)` | `hsl(0, 0%, 17%)` | Page background |
| `foreground` | `hsl(0, 0%, 17%)` | `hsl(36, 33%, 95%)` | Primary text |
| `card` | `hsl(0, 0%, 100%)` | `hsl(0, 0%, 23%)` | Card backgrounds |
| `card-foreground` | `hsl(0, 0%, 17%)` | `hsl(36, 33%, 95%)` | Card text |
| `primary` | `hsl(130, 25%, 39%)` | `hsl(130, 25%, 39%)` | Primary actions |
| `primary-foreground` | `hsl(0, 0%, 100%)` | `hsl(0, 0%, 100%)` | Primary button text |
| `secondary` | `hsl(135, 17%, 56%)` | `hsl(135, 17%, 56%)` | Secondary elements |
| `muted` | `hsl(30, 4%, 53%)` | `hsl(30, 4%, 53%)` | Muted backgrounds |
| `muted-foreground` | `hsl(30, 4%, 40%)` | `hsl(30, 4%, 70%)` | Muted text |
| `accent` | `hsl(46, 65%, 52%)` | `hsl(46, 65%, 52%)` | Gold accents |
| `destructive` | `hsl(0, 84%, 60%)` | `hsl(0, 63%, 31%)` | Error states |
| `border` | `hsl(135, 17%, 56%)` | `hsl(0, 0%, 29%)` | Borders |
| `ring` | `hsl(46, 65%, 52%)` | `hsl(46, 65%, 52%)` | Focus rings |

### Color Application

```tsx
// Primary action backgrounds
<button className="bg-primary hover:bg-primary/90">
  Primary Button
</button>

// Custom pathible colors for marketing
<div className="bg-pathible-forest text-white">
  Forest green section
</div>

// Gold accents
<span className="text-pathible-gold">
  Highlighted text
</span>

// Focus states (automatic with ring utilities)
<input className="focus-visible:ring-ring" />
```

---

## Spacing

### Spacing Scale

```
0.25rem (1)   = 4px
0.5rem  (2)   = 8px
0.75rem (3)   = 12px
1rem    (4)   = 16px
1.5rem  (6)   = 24px
2rem    (8)   = 32px
3rem    (12)  = 48px
4rem    (16)  = 64px
6rem    (24)  = 96px
```

### Component Spacing Guidelines

| Context | Spacing | Tailwind |
|---------|---------|----------|
| Button padding | 16px × 24px | `px-6 py-2` |
| Card padding | 24px | `p-6` |
| Section padding (y) | 64-96px | `py-16 sm:py-24` |
| Container padding (x) | 16-32px | `px-4 sm:px-6 lg:px-8` |
| Stack gap (items) | 16-24px | `space-y-4` or `gap-6` |
| Inline gap | 8-16px | `gap-2` or `gap-4` |

### Page Container

```tsx
// Standard page container
<div className="px-6 py-8 max-w-screen-2xl mx-auto">
  {/* Page content */}
</div>

// Marketing section container
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Section content */}
</div>

// Narrow content container (for readability)
<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
  {/* Long-form content */}
</div>
```

---

## Components

### Buttons

#### Variants

```tsx
import { Button } from "@/components/ui/button";

// Primary (default) - Forest green
<Button>Primary Action</Button>
<Button variant="default">Primary Action</Button>

// Secondary - Sage green
<Button variant="secondary">Secondary Action</Button>

// Outline - Bordered
<Button variant="outline">Outline Button</Button>

// Ghost - No background until hover
<Button variant="ghost">Ghost Button</Button>

// Destructive - Red for dangerous actions
<Button variant="destructive">Delete</Button>

// Link - Text-only with underline on hover
<Button variant="link">Link Style</Button>
```

#### Sizes

```tsx
// Small (h-8)
<Button size="sm">Small</Button>

// Default (h-9)
<Button size="default">Default</Button>

// Large (h-10)
<Button size="lg">Large</Button>

// Icon only (square)
<Button size="icon"><Icon /></Button>
<Button size="icon-sm"><Icon /></Button>
<Button size="icon-lg"><Icon /></Button>
```

#### Custom Marketing Buttons

```tsx
// Large CTA button (marketing pages)
<Button
  asChild
  size="lg"
  className="bg-pathible-forest hover:bg-pathible-green-hover px-10 py-7 rounded-2xl text-white text-lg font-medium shadow-lg shadow-pathible-forest/20 hover:shadow-xl hover:shadow-pathible-forest/30 hover:-translate-y-0.5 transition-all duration-300"
>
  <Link href="/signup">Get Started</Link>
</Button>
```

#### Component Classes (globals.css)

```css
.btn-primary    /* Forest green with hover/active states */
.btn-secondary  /* Sage green with lift effect */
.btn-ghost      /* Transparent with border, fills on hover */
.btn-accent     /* Gold with lift effect */
```

### Cards

#### Standard Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Dashboard Stat Card

```tsx
// Interactive card with hover effects
<Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
  <CardHeader>
    <div className="flex items-center justify-between">
      <Icon className="h-8 w-8 text-primary" />
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <CardTitle className="text-base mb-1">{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardContent>
</Card>
```

#### Feature Card (Marketing)

```tsx
<Card className="group relative overflow-hidden rounded-3xl border-0 shadow-lg shadow-black/3 hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1 transition-all duration-500">
  {/* Gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-pathible-forest/10 to-pathible-sage/10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

  <div className="relative p-8 lg:p-10">
    {/* Card content */}
  </div>
</Card>
```

#### Dashboard Card Utility Class

```css
.dashboard-card {
  @apply bg-card border border-border rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200;
}
```

### Form Inputs

#### Text Input

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="name@example.com"
  />
</div>
```

#### Input Styling

```tsx
// Inputs have these base styles:
// - h-9 height
// - Rounded-md borders
// - Sage green border color
// - Gold focus ring (3px)
// - Smooth transition on focus
```

#### Textarea

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea
  placeholder="Enter your message..."
  className="min-h-[120px]"
/>
```

#### Select

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox & Radio

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Checkbox
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>

// Radio Group
<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
</RadioGroup>
```

#### Form with Validation

```tsx
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="email@example.com" {...field} />
        </FormControl>
        <FormDescription>Your email address</FormDescription>
        <FormMessage /> {/* Shows validation errors */}
      </FormItem>
    )}
  />
</Form>
```

### Badges

```tsx
import { Badge } from "@/components/ui/badge";

// Default (primary)
<Badge>New</Badge>

// Secondary
<Badge variant="secondary">Draft</Badge>

// Outline
<Badge variant="outline">Category</Badge>

// Destructive
<Badge variant="destructive">Overdue</Badge>
```

### Alerts

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

// Default alert
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    Something you should know about.
  </AlertDescription>
</Alert>

// Destructive alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong.
  </AlertDescription>
</Alert>
```

### Dialogs & Modals

```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Description of what this dialog does.
      </DialogDescription>
    </DialogHeader>

    {/* Dialog body content */}

    <DialogFooter>
      <Button type="submit">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for tab 1</TabsContent>
  <TabsContent value="tab2">Content for tab 2</TabsContent>
</Tabs>
```

### Tables

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Active</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Progress

```tsx
import { Progress } from "@/components/ui/progress";

<Progress value={75} />
```

### Tooltips

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Tooltip content</p>
  </TooltipContent>
</Tooltip>
```

### Sidebar Navigation

```tsx
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

<SidebarProvider>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={true}>
                <Link href="/dashboard">
                  <HomeIcon />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    {/* Main content */}
  </SidebarInset>
</SidebarProvider>
```

### Skeleton Loading

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Text skeleton
<Skeleton className="h-4 w-[250px]" />

// Avatar skeleton
<Skeleton className="h-12 w-12 rounded-full" />

// Card skeleton
<Skeleton className="h-[125px] w-full rounded-xl" />
```

### Toast Notifications

```tsx
import { toast } from "sonner";

// Success toast
toast.success("Document saved successfully");

// Error toast
toast.error("Failed to upload file");

// Promise toast (for async operations)
toast.promise(saveDocument(), {
  loading: "Saving...",
  success: "Saved!",
  error: "Failed to save",
});
```

---

## Layout Patterns

### Page Header Pattern

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-4xl font-bold">Page Title</h1>
    </div>
    <p className="text-muted-foreground text-lg">
      Page description text here
    </p>
  </div>
  <div className="flex gap-2 shrink-0">
    <Button variant="outline">Secondary Action</Button>
    <Button>Primary Action</Button>
  </div>
</div>
```

### Stats Grid

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
</div>
```

### Content Section

```tsx
<div className="space-y-6">
  {/* Section header */}
  <div>
    <h2 className="text-2xl font-semibold mb-2">Section Title</h2>
    <p className="text-muted-foreground">Section description</p>
  </div>

  {/* Section content */}
  <Card>
    {/* ... */}
  </Card>
</div>
```

### Marketing Section

```tsx
<section className="py-24 sm:py-32">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* Section header */}
    <div className="text-center max-w-3xl mx-auto mb-20">
      <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
        Section Label
      </p>
      <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
        Section Headline
      </h2>
      <p className="text-xl text-muted-foreground leading-relaxed">
        Section description text
      </p>
    </div>

    {/* Section content */}
    <div className="grid gap-6 lg:gap-8 sm:grid-cols-2">
      {/* Content cards */}
    </div>
  </div>
</section>
```

### Two-Column Layout

```tsx
<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
  <div>
    {/* Main content */}
  </div>
  <div>
    {/* Sidebar content */}
  </div>
</div>
```

---

## Animation

### Animation Classes

```css
/* Entry animations */
.animate-fade-in        /* opacity 0 → 1 */
.animate-fade-in-up     /* opacity + translateY(20px) → 0 */
.animate-fade-in-down   /* opacity + translateY(-20px) → 0 */
.animate-scale-in       /* opacity + scale(0.95) → 1 */
.animate-slide-in-right /* opacity + translateX(20px) → 0 */

/* Animation delays */
.animation-delay-100  /* 100ms delay */
.animation-delay-200  /* 200ms delay */
.animation-delay-300  /* 300ms delay */
.animation-delay-400  /* 400ms delay */
.animation-delay-500  /* 500ms delay */
.animation-delay-600  /* 600ms delay */
.animation-delay-700  /* 700ms delay */
.animation-delay-800  /* 800ms delay */
```

### Transition Utilities

```tsx
// Standard transition
<div className="transition-all duration-200">

// Shadow transition on hover
<Card className="hover:shadow-lg transition-shadow">

// Transform transition
<div className="hover:-translate-y-1 transition-transform duration-300">

// Combined transitions
<Card className="hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
```

### Loading States

```css
/* Skeleton shimmer */
.skeleton {
  @apply animate-pulse bg-gradient-to-r from-muted via-background to-muted;
}

/* Spinner */
.spinner {
  @apply border-4 border-secondary border-t-primary rounded-full w-6 h-6 animate-spin;
}
```

---

## Icons

### Icon Library

Pathible uses **Lucide React** for all icons:

```tsx
import { Shield, FileText, Users, Heart, BookOpen } from "lucide-react";
```

### Icon Sizing

| Context | Size | Class |
|---------|------|-------|
| Inline with text | 16px | `h-4 w-4` |
| Button icon | 16-20px | `h-4 w-4` or `h-5 w-5` |
| Card header | 24-32px | `h-6 w-6` or `h-8 w-8` |
| Feature highlight | 24-32px | `h-6 w-6` or `h-8 w-8` |
| Hero/empty state | 48-64px | `h-12 w-12` or `h-16 w-16` |

### Icon Colors

```tsx
// Primary action icons
<Icon className="text-primary" />

// Muted/secondary icons
<Icon className="text-muted-foreground" />

// White icons (on colored backgrounds)
<Icon className="text-white" />

// Pathible forest green
<Icon className="text-pathible-forest" />
```

### Icon Containers

```tsx
// Rounded icon container
<div className="p-2 rounded-lg bg-primary/10">
  <Icon className="h-6 w-6 text-primary" />
</div>

// Square icon badge
<div className="w-12 h-12 rounded-xl bg-pathible-forest/10 flex items-center justify-center">
  <Icon className="w-6 h-6 text-pathible-forest" />
</div>
```

---

## Border Radius Reference

| Tailwind Class | Value | Usage |
|----------------|-------|-------|
| `rounded-sm` | calc(0.5rem - 4px) | Small elements |
| `rounded-md` | calc(0.5rem - 2px) | Inputs, badges |
| `rounded-lg` | 0.5rem (8px) | Buttons, cards |
| `rounded-xl` | calc(0.5rem + 4px) | Dashboard cards |
| `rounded-2xl` | 1rem (16px) | Large buttons |
| `rounded-3xl` | 1.5rem (24px) | Feature cards |
| `rounded-full` | 9999px | Avatars, badges |

---

## Shadow Reference

```tsx
// Subtle shadow
<div className="shadow-sm">

// Standard shadow
<div className="shadow">

// Elevated shadow
<div className="shadow-lg">

// Modal shadow
<div className="shadow-xl">

// Custom brand shadow
<div className="shadow-lg shadow-pathible-forest/20">
```

---

## Responsive Breakpoints

```
sm: 640px   /* Mobile landscape, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Common Responsive Patterns

```tsx
// Responsive grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// Responsive stack → row
<div className="flex flex-col sm:flex-row">

// Responsive text sizes
<h1 className="text-4xl sm:text-5xl lg:text-6xl">

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive visibility
<div className="hidden md:block">
<div className="md:hidden">
```

---

## Accessibility Checklist

### Color & Contrast
- [ ] Text meets 4.5:1 contrast ratio
- [ ] Large text meets 3:1 contrast ratio
- [ ] Interactive elements meet 3:1 contrast
- [ ] Color is not sole indicator of state

### Keyboard Navigation
- [ ] All interactive elements are focusable
- [ ] Focus order is logical
- [ ] Focus indicators are visible (gold ring)
- [ ] Skip links available

### Screen Readers
- [ ] Images have alt text
- [ ] Icons have sr-only labels
- [ ] Form fields have labels
- [ ] Error messages announced

### Motion
- [ ] Respects `prefers-reduced-motion`
- [ ] No auto-playing animations
- [ ] Critical info doesn't rely on motion

---

## Component Creation Guidelines

When creating new components:

1. **Use existing tokens** - Never hardcode colors, sizes, or fonts
2. **Follow established patterns** - Reference similar existing components
3. **Maintain consistency** - Same spacing, border radius, shadows
4. **Add hover states** - Interactive elements need feedback
5. **Include focus styles** - Gold ring, 3px width
6. **Support dark mode** - Test in both themes
7. **Be responsive** - Mobile-first, scale up
8. **Be accessible** - Keyboard, screen reader, contrast
9. **Animate thoughtfully** - Subtle, purposeful motion
10. **Document usage** - Add examples to this file

---

## Quick Reference

```tsx
// Standard page wrapper
<div className="px-6 py-8 max-w-screen-2xl mx-auto">

// Marketing section
<section className="py-24 sm:py-32">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

// Heading with Crimson
<h1 className="font-crimson text-4xl sm:text-5xl">

// Body text
<p className="text-lg text-muted-foreground leading-relaxed">

// Primary button
<Button className="bg-primary hover:bg-primary/90">

// Card with hover
<Card className="hover:shadow-lg transition-shadow">

// Icon with container
<div className="p-2 rounded-lg bg-primary/10">
  <Icon className="h-6 w-6 text-primary" />
</div>

// Focus ring (automatic)
className="focus-visible:ring-ring/50 focus-visible:ring-[3px]"

// Pathible colors
bg-pathible-sand
bg-pathible-forest
bg-pathible-sage
bg-pathible-gold
text-pathible-charcoal
```
