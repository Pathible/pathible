# Pathible Tech Stack & Dependencies

---
**Version:** 0.1.0
**Node.js Requirement:** >=22.0.0
**Package Manager:** pnpm
**Last Updated:** January 2026

## Core Framework Stack

### Next.js & React (Latest Generation)
- **Next.js**: `16.0.10` - App Router, Latest features
- **React**: `19.2.3` - Latest React 19 with Concurrent Features
- **React DOM**: `19.2.3` - Matching React version
- **TypeScript**: `^5.9.3` - Latest stable TypeScript

**Version Notes:**
- React 19 includes built-in optimizations and new concurrent features
- Next.js 16.x brings improved App Router and performance
- Requires Node.js 22+ for optimal compatibility

## Backend & Authentication

### Convex Backend
- **Convex**: `^1.31.0` - Real-time backend as a service

### Authentication (Clerk)
- **@clerk/nextjs**: `^6.36.2` - Clerk authentication for Next.js
- **@clerk/types**: `^4.101.6` - Clerk type definitions
- **@clerk/testing**: `^1.13.26` - Clerk testing utilities

**Authentication Flow:**
1. User signs in via Clerk (email, OAuth, etc.)
2. Clerk issues JWT tokens
3. Convex validates JWT via `ctx.auth.getUserIdentity()`
4. User profile looked up in Convex database

### Email Services
- **Resend**: `^6.6.0` - Transactional email delivery

## UI Component Foundation

### Radix UI Ecosystem
Primary unstyled component primitives:
- `@radix-ui/react-accordion` `^1.2.12`
- `@radix-ui/react-alert-dialog` `^1.1.15`
- `@radix-ui/react-avatar` `^1.1.11`
- `@radix-ui/react-checkbox` `^1.3.3`
- `@radix-ui/react-dialog` `^1.1.15`
- `@radix-ui/react-dropdown-menu` `^2.1.16`
- `@radix-ui/react-label` `^2.1.8`
- `@radix-ui/react-popover` `^1.1.15`
- `@radix-ui/react-progress` `^1.1.8`
- `@radix-ui/react-radio-group` `^1.3.8`
- `@radix-ui/react-select` `^2.2.6`
- `@radix-ui/react-separator` `^1.1.8`
- `@radix-ui/react-slot` `^1.2.4`
- `@radix-ui/react-switch` `^1.2.6`
- `@radix-ui/react-tabs` `^1.1.13`
- `@radix-ui/react-tooltip` `^1.2.8`

### Styling & Design System
- **TailwindCSS**: `^4.1.18` - Core utility framework (v4!)
- **@tailwindcss/postcss**: `^4.1.18` - PostCSS integration
- **@tailwindcss/typography**: `^0.5.19` - Typography plugin
- **tw-animate-css**: `^1.4.0` - Animation utilities
- **Class Variance Authority**: `^0.7.1` - Component variants
- **Tailwind Merge**: `^3.4.0` - Dynamic class merging
- **CLSX**: `^2.1.1` - Conditional classes

**Styling Notes:**
- TailwindCSS v4 with CSS-first configuration
- Global styles in `src/app/globals.css`
- CSS variables enabled for theming

## Form Management & Validation

### React Hook Form Stack
- **React Hook Form**: `^7.68.0` - Primary form library
- **@hookform/resolvers**: `^5.2.2` - Schema resolvers
- **Zod**: `^4.1.13` - Runtime validation & type safety

**Best Practices:**
- Use React Hook Form for all forms (performance optimized)
- Zod schemas for both client/server validation
- Leverage `@hookform/resolvers/zod` for integration

```typescript
// Standard form setup
const form = useForm<FormSchema>({
  resolver: zodResolver(schema),
  defaultValues: {...}
})
```

## UI Enhancement Libraries

### Icons
- **Lucide React**: `^0.561.0` - Primary icon system

### Notifications & UX
- **Sonner**: `^2.0.7` - Toast notifications
- **Next Themes**: `^0.4.6` - Dark/light mode support
- **Input OTP**: `^1.4.2` - OTP input component
- **Framer Motion**: `^12.23.26` - Animation library

### Data Display
- **@tanstack/react-table**: `^8.21.3` - Table components
- **@react-pdf/renderer**: `^4.3.2` - PDF generation
- **react-markdown**: `^10.1.0` - Markdown rendering

## Cloud Services
- **@aws-sdk/client-s3**: `^3.948.0` - S3 client for file storage
- **@aws-sdk/s3-request-presigner**: `^3.948.0` - Presigned URLs
- **@vercel/analytics**: `^1.6.1` - Analytics integration
- **svix**: `^1.82.0` - Webhook handling

## Testing

### Unit Testing
- **Vitest**: `^4.0.16` - Unit test framework
- **@vitest/coverage-v8**: `^4.0.16` - Coverage reporting
- **@testing-library/react**: `^16.3.1` - React testing utilities
- **@testing-library/dom**: `^10.4.1` - DOM testing utilities
- **jsdom**: `^27.4.0` - DOM environment for tests

### End-to-End Testing
- **Cypress**: `^15.7.1` - E2E testing framework

**Test Commands:**
```bash
pnpm test             # Unit tests (Vitest)
pnpm test:run         # Unit tests (single run)
pnpm test:coverage    # Unit tests with coverage
pnpm test:e2e         # E2E tests (headless)
pnpm test:e2e:open    # E2E tests (interactive)
```

## Development & Build Tools

### Linting & Formatting
- **Biome**: `2.3.8` - Fast linter and formatter
- **ESLint**: `^9.39.2` - JavaScript/TypeScript linting
- **eslint-config-next**: `16.0.10` - Next.js ESLint rules

**Lint Command:**
```bash
pnpm lint  # Runs Biome check + TypeScript type check
```

### Git Hooks
- **Husky**: `^9.1.7` - Git hooks management
- **lint-staged**: `^16.2.7` - Run linters on staged files

---

## Development Commands

```bash
# Start both Next.js and Convex in parallel (recommended)
pnpm dev

# Or run separately in different terminals:
pnpm dev:frontend  # Next.js only
pnpm dev:backend   # Convex only

# Generate Convex types
pnpm generate

# Build for production
pnpm build

# Lint and type check
pnpm lint

# Kill dev processes
pnpm kill
```

---

## Architectural Best Practices

### Component Architecture
```typescript
// Server Components by default
// Only use "use client" when necessary for:
// - Event handlers (onClick, onChange, etc.)
// - Browser APIs (window, document, localStorage)
// - React hooks (useState, useEffect, useContext)

export const ComponentName = ({ ...props }) => {
  return <div>...</div>
}
```

### Styling Approach
- Radix UI for behavior + TailwindCSS for styling
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Leverage CVA for component variants

```typescript
import { cn } from "@/lib/utils"

cn("base-class", condition && "conditional-class")
```

### File Organization
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Protected routes (require auth)
│   ├── (unauth)/          # Public routes
│   └── api/               # API routes
├── components/
│   └── ui/                # shadcn/ui components
├── convex/                # Convex backend functions
├── lib/                   # Utilities and helpers
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

### Authentication Patterns

**Server Components:**
```typescript
import { requireServerAuth, getServerSession } from "@/lib/auth-session"

// Requires authentication
const { user, profile } = await requireServerAuth()

// Optional authentication
const session = await getServerSession()
```

**Client Components:**
```typescript
import { useUser, useAuth } from "@clerk/nextjs"

const { user, isLoaded } = useUser()
const { isSignedIn } = useAuth()
```

### Convex Function Pattern
```typescript
// All functions MUST include explicit args and returns validators
export const myQuery = query({
  args: { id: v.id("users") },
  returns: v.object({ name: v.string() }),
  handler: async (ctx, args) => {
    // Implementation
  },
})
```

---

## Version Compatibility Notes

- **React 19.2** - Latest stable with automatic optimizations
- **Next.js 16** - Cutting-edge App Router features
- **TailwindCSS 4** - CSS-first configuration (no tailwind.config.js)
- **TypeScript 5.9** - Latest type system features
- **Zod 4** - Breaking changes from v3, new API
- **Node.js 22+** - Required for optimal performance

## Critical Dependencies to Monitor

1. **React 19** - Monitor for patches and updates
2. **Next.js 16** - Watch for App Router improvements
3. **TailwindCSS 4** - New CSS-first approach
4. **Zod 4** - New major version with API changes
5. **Convex** - Core backend, track releases
6. **Clerk** - Authentication system updates
