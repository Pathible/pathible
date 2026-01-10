# UI Standards - Icon & Component Patterns

This document defines the icon conventions and UI patterns for the Pathible dashboard. All components should follow these standards for consistency.

**Related Documentation**: See [PATHIBLE_DESIGN_SYSTEM.md](./PATHIBLE_DESIGN_SYSTEM.md) for colors, typography, and component classes.

---

## Icon Conventions

All icons use [lucide-react](https://lucide.dev/). Import icons directly from the library.

### Standard Action Icons

| Action         | Icon            | Import            | Size                     | Usage Context                    |
| -------------- | --------------- | ----------------- | ------------------------ | -------------------------------- |
| Edit           | Pencil          | `Pencil`          | h-4 w-4                  | Edit buttons, inline edit        |
| Delete         | Trash2          | `Trash2`          | h-4 w-4                  | Delete buttons, remove actions   |
| View/Preview   | Eye             | `Eye`             | h-4 w-4                  | View details, preview content    |
| Add/Create     | Plus            | `Plus`            | h-4 w-4                  | Add new items                    |
| Settings       | Settings        | `Settings`        | h-4 w-4                  | Settings panels, configuration   |
| Info/Help      | Info            | `Info`            | h-4 w-4                  | Tooltips, help text              |
| Close/Cancel   | X               | `X`               | h-4 w-4                  | Close modals, cancel actions     |
| Download       | Download        | `Download`        | h-4 w-4                  | Download files                   |
| Upload         | Upload          | `Upload`          | h-4 w-4                  | Upload files                     |
| Search         | Search          | `Search`          | h-4 w-4                  | Search inputs                    |
| Filter         | Filter          | `Filter`          | h-4 w-4                  | Filter controls                  |
| Sort           | ArrowUpDown     | `ArrowUpDown`     | h-4 w-4                  | Sort columns/lists               |
| Expand         | ChevronDown     | `ChevronDown`     | h-4 w-4                  | Expand accordions, dropdowns     |
| Collapse       | ChevronUp       | `ChevronUp`       | h-4 w-4                  | Collapse sections                |
| Navigate Back  | ArrowLeft       | `ArrowLeft`       | h-4 w-4                  | Back navigation                  |
| Navigate Next  | ArrowRight      | `ArrowRight`      | h-4 w-4                  | Forward navigation               |
| Loading        | Loader2         | `Loader2`         | h-4 w-4 + animate-spin   | Loading states                   |
| Success        | CheckCircle2    | `CheckCircle2`    | h-4 w-4                  | Success indicators               |
| Warning        | AlertTriangle   | `AlertTriangle`   | h-5 w-5                  | Warning messages                 |
| Error          | AlertCircle     | `AlertCircle`     | h-5 w-5                  | Error states                     |
| Menu           | MoreHorizontal  | `MoreHorizontal`  | h-4 w-4                  | Dropdown menus, more actions     |
| Copy           | Copy            | `Copy`            | h-4 w-4                  | Copy to clipboard                |
| Save           | Save            | `Save`            | h-4 w-4                  | Save actions                     |
| Refresh        | RefreshCw       | `RefreshCw`       | h-4 w-4                  | Refresh/reload                   |

### Prohibited Icons

Do **NOT** use these icons (use the alternatives shown):

| Prohibited   | Use Instead | Reason                              |
| ------------ | ----------- | ----------------------------------- |
| `Edit`       | `Pencil`    | Pencil is more universally recognized |
| `Edit2`      | `Pencil`    | Pencil is more universally recognized |
| `Edit3`      | `Pencil`    | Pencil is more universally recognized |
| `Trash`      | `Trash2`    | Trash2 has better visual weight     |
| `TrashIcon`  | `Trash2`    | Trash2 is the standard              |

---

## Icon Sizing Guidelines

### Standard Sizes

| Context              | Size Class      | Pixels | Usage                           |
| -------------------- | --------------- | ------ | ------------------------------- |
| Inline with text     | `h-4 w-4`       | 16px   | Icons within paragraphs         |
| Button icons         | `h-4 w-4`       | 16px   | Inside Button components        |
| Card header icons    | `h-5 w-5`       | 20px   | Section headers, card titles    |
| Alert/Status icons   | `h-5 w-5`       | 20px   | Warning, error, info alerts     |
| Empty state icons    | `h-8 w-8`       | 32px   | Empty state illustrations       |
| Hero icons           | `h-12 w-12`     | 48px   | Large feature callouts          |

### Sizing Examples

```tsx
// Inline with text
<p>
  <Info className="inline h-4 w-4 mr-1" />
  This is a helpful tip.
</p>

// Button with icon
<Button>
  <Plus className="h-4 w-4" />
  Add Item
</Button>

// Card header
<CardHeader>
  <Settings className="h-5 w-5 text-muted-foreground" />
  <CardTitle>Settings</CardTitle>
</CardHeader>

// Empty state
<div className="text-center py-12">
  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
  <p className="mt-4">No documents yet</p>
</div>
```

---

## Icon Button Patterns

### Icon-Only Buttons

Icon-only buttons **MUST** include a screen reader label for accessibility:

```tsx
// Correct: Icon button with sr-only label
<Button variant="ghost" size="icon" title="Edit">
  <Pencil className="h-4 w-4" />
  <span className="sr-only">Edit</span>
</Button>

// Correct: Icon button with aria-label
<Button variant="ghost" size="icon" aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>
```

### Icon with Text

Icons should appear before the text with consistent spacing:

```tsx
// Standard button with icon
<Button>
  <Plus className="h-4 w-4" />
  Add Item
</Button>

// Button variant with icon (spacing handled by Button component)
<Button variant="outline">
  <Download className="h-4 w-4" />
  Download PDF
</Button>
```

### Dropdown Menu Actions

Use icons consistently in dropdown menus:

```tsx
<DropdownMenuContent>
  <DropdownMenuItem>
    <Eye className="h-4 w-4" />
    View Details
  </DropdownMenuItem>
  <DropdownMenuItem>
    <Pencil className="h-4 w-4" />
    Edit
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem className="text-destructive">
    <Trash2 className="h-4 w-4" />
    Delete
  </DropdownMenuItem>
</DropdownMenuContent>
```

---

## Loading States

### Spinner Pattern

Always use `Loader2` with `animate-spin` for loading states:

```tsx
// Button loading state
<Button disabled>
  <Loader2 className="h-4 w-4 animate-spin" />
  Saving...
</Button>

// Inline loading
{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}

// Full-page loading
<div className="flex items-center justify-center py-12">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
</div>
```

---

## Color Token Usage

### Design System Colors Only

Never use hardcoded colors. Always use design tokens:

```tsx
// Correct: Using design tokens
<div className="text-muted-foreground">Secondary text</div>
<div className="bg-primary text-primary-foreground">Primary button</div>
<div className="border-destructive">Error border</div>

// Incorrect: Hardcoded colors
<div className="text-gray-500">Secondary text</div>
<div className="bg-rose-500">Error background</div>
<div className="text-[#4B7F52]">Custom color</div>
```

### Exception: Relationship Colors

Family member relationship colors are allowed as inline Tailwind classes for visual distinction:

```tsx
// Allowed: Relationship color coding
const relationshipColors = {
  spouse: "bg-rose-100 text-rose-700",
  child: "bg-sky-100 text-sky-700",
  parent: "bg-amber-100 text-amber-700",
  sibling: "bg-emerald-100 text-emerald-700",
};
```

---

## Action Visibility Guidelines

### Making Actions Obvious

Users should immediately understand what actions are available:

1. **Edit actions**: Show `Pencil` icon with "Edit" label or tooltip
2. **Delete actions**: Show `Trash2` icon, use destructive variant
3. **Primary actions**: Use filled buttons with clear labels
4. **Secondary actions**: Use outline or ghost buttons

### Action Placement

```tsx
// Card with actions in header
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Document Name</CardTitle>
    <div className="flex gap-2">
      <Button variant="ghost" size="icon" title="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" title="Delete" className="text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>
</Card>

// List item with actions on hover (desktop) or always visible (mobile)
<div className="group flex items-center justify-between p-4 hover:bg-muted/50">
  <span>Item name</span>
  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <Button variant="ghost" size="icon">
      <Pencil className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

## Accessibility Checklist

- [ ] All icon-only buttons have `sr-only` labels or `aria-label`
- [ ] Icons have sufficient color contrast
- [ ] Interactive icons have visible focus states
- [ ] Loading states are announced to screen readers
- [ ] Decorative icons have `aria-hidden="true"`

---

## ESLint Enforcement

The following ESLint rule enforces icon standards:

```javascript
// .eslintrc.cjs
"no-restricted-imports": [
  "error",
  {
    paths: [{
      name: "lucide-react",
      importNames: ["Edit", "Edit2", "Edit3", "Trash", "TrashIcon"],
      message: "Use Pencil for edit, Trash2 for delete per docs/UI_STANDARDS.md"
    }]
  }
]
```

---

## Quick Reference

### Most Common Patterns

```tsx
// Edit button
<Button variant="ghost" size="icon" title="Edit">
  <Pencil className="h-4 w-4" />
</Button>

// Delete button
<Button variant="ghost" size="icon" title="Delete" className="text-destructive">
  <Trash2 className="h-4 w-4" />
</Button>

// Add button
<Button>
  <Plus className="h-4 w-4" />
  Add New
</Button>

// Loading button
<Button disabled>
  <Loader2 className="h-4 w-4 animate-spin" />
  Loading...
</Button>

// View/Preview button
<Button variant="outline">
  <Eye className="h-4 w-4" />
  Preview
</Button>

// Menu trigger
<Button variant="ghost" size="icon">
  <MoreHorizontal className="h-4 w-4" />
  <span className="sr-only">Open menu</span>
</Button>
```
