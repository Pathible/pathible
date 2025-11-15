# Sidebar Integration Guide

## Overview
The sidebar has been fixed and is now following ShadCN best practices. Here's how to integrate it into your Next.js app.

## What's Been Fixed

### 1. Updated `/src/components/app-sidebar.tsx`
- Added explicit icon size class (`h-4 w-4`) for consistency
- Extracted Icon component for cleaner rendering
- Added `border-r` class to the Sidebar for proper visual separation
- Follows ShadCN patterns exactly

### 2. Created `/src/components/app-layout.tsx`
- New wrapper component that provides the required `SidebarProvider`
- Uses `SidebarInset` for the main content area
- Ready to use in your pages/layouts

## How to Use the Sidebar

### Option 1: Use in a Route Group Layout (Recommended)

Create a layout for your app routes:

```tsx
// src/app/(app)/layout.tsx
import { AppLayout } from "@/components/app-layout";

export default function AppLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
```

Then your pages will automatically have the sidebar:

```tsx
// src/app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {/* Your dashboard content */}
    </div>
  );
}
```

### Option 2: Use Directly in a Page

```tsx
// src/app/dashboard/page.tsx
import { AppLayout } from "@/components/app-layout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* Your dashboard content */}
      </div>
    </AppLayout>
  );
}
```

## Key Features

### 1. Always Visible on Desktop
The sidebar uses `collapsible="none"` so it's always visible on desktop screens.

### 2. Active State Highlighting
The current page is automatically highlighted based on the URL pathname.

### 3. Mobile Support
On mobile devices, the ShadCN sidebar automatically converts to a Sheet (drawer) that can be toggled.

### 4. Clean Design
- Simple "Navigation" label
- Six navigation items in order:
  - Dashboard (LayoutDashboard icon)
  - Heritage Vault (Shield icon)
  - Financial Intelligence (TrendingUp icon)
  - Family Ecosystem (Users icon)
  - Wisdom & Education (BookOpen icon)
  - Legacy Planning (FileText icon)

## CSS Variables

All sidebar colors are already configured in `/src/app/globals.css`:

- `--sidebar-background`: Sidebar background color
- `--sidebar-foreground`: Default text color
- `--sidebar-accent`: Active item background
- `--sidebar-accent-foreground`: Active item text
- `--sidebar-border`: Border color
- `--sidebar-ring`: Focus ring color

These are defined for both light and dark modes.

## Customization

### Change Navigation Items

Edit the `navItems` array in `/src/components/app-sidebar.tsx`:

```tsx
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // Add or modify items here
];
```

### Add a Header or Footer

Uncomment and add to `/src/components/app-sidebar.tsx`:

```tsx
import { SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar collapsible="none" className="border-r">
      <SidebarHeader>
        {/* Add logo or title here */}
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation items */}
      </SidebarContent>

      <SidebarFooter>
        {/* Add version info or user menu here */}
      </SidebarFooter>
    </Sidebar>
  );
}
```

### Add a Sidebar Toggle Button

In your header component:

```tsx
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header className="flex items-center gap-2 p-4">
      <SidebarTrigger />
      {/* Rest of header */}
    </header>
  );
}
```

## Troubleshooting

### Sidebar Not Showing
- Make sure you're wrapping your content with `SidebarProvider`
- Check that the page is using the `AppLayout` component
- Verify that CSS variables are loaded (check globals.css)

### Active State Not Working
- Ensure the `href` in `navItems` matches your route exactly
- The active state uses `pathname === item.href` for exact matching

### Styling Issues
- The sidebar uses the `border-r` class for the right border
- Check that your Tailwind build includes the sidebar color utilities
- Verify CSS custom properties are properly defined in globals.css

## Next Steps

1. Create your app route group: `src/app/(app)/layout.tsx`
2. Add the AppLayout wrapper in the layout
3. Create your page routes under `(app)/*`
4. Customize the navigation items as needed

The sidebar is now production-ready and follows all ShadCN best practices!
