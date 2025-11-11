# Pathible

**A peaceful home for everything your family will need and remember.**

Pathible is a family legacy and document management platform that brings your most important documents, stories, and wishes together in one secure place. Built for families who want to ensure their loved ones have clarity, not confusion.

## What is Pathible?

Pathible helps families preserve their legacy through four core modules:

- **Heritage Vault** - Keep legal, financial, and personal files safe and organized
- **Wisdom & Education** - Share your stories, beliefs, and letters with loved ones
- **Legacy Planning** - Document your final wishes and create legal-ready drafts
- **Financial Intelligence** - View all accounts in one place and access stewardship resources

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (package manager)
- A Convex account (free tier available at [convex.dev](https://convex.dev))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pathible
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Convex Backend
   CONVEX_DEPLOYMENT=your-deployment-name
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   NEXT_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site

   # Application
   SITE_URL=http://localhost:3000

   # Email (Optional in development)
   RESEND_API_KEY=re_your_api_key
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   EMAIL_FROM_NAME=Pathible
   ```

4. **Generate Convex types** (first time only)
   ```bash
   pnpm generate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   This starts both:
   - Next.js at [http://localhost:3000](http://localhost:3000)
   - Convex backend with live type checking and reloading

## Available Scripts

- `pnpm dev` - Run both frontend and backend in parallel (recommended)
- `pnpm dev:frontend` - Run only Next.js development server
- `pnpm dev:backend` - Run only Convex backend with type checking
- `pnpm generate` - Generate Convex types (one-time setup)
- `pnpm build` - Build the Next.js application for production
- `pnpm start` - Start the Next.js production server
- `pnpm lint` - Lint Next.js, TypeScript, and Convex code
- `pnpm test:e2e` - Run end-to-end tests with Cypress
- `pnpm test:e2e:open` - Open Cypress test runner

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling framework with custom Pathible design tokens
- **shadcn/ui** - Component library (New York style)
- **Lucide React** - Icon library

### Backend & Authentication
- **Convex** - Real-time serverless backend
- **Better Auth** - Authentication with Convex integration
- **Email OTP** - Passwordless authentication via email
- **Resend** - Email delivery service (production)

### Developer Tools
- **pnpm** - Fast, efficient package manager
- **ESLint** - Code linting
- **Cypress** - End-to-end testing

## Project Structure

```
pathible/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Protected routes (requires authentication)
│   │   │   └── dashboard/     # Main dashboard and authenticated features
│   │   ├── (unauth)/          # Public auth routes
│   │   │   ├── login/         # Email OTP login
│   │   │   ├── signup/        # User registration
│   │   │   ├── onboarding/    # Profile creation
│   │   │   └── sign-out/      # Logout
│   │   ├── api/               # Next.js API routes
│   │   ├── globals.css        # Global styles and Pathible design tokens
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── app-sidebar.tsx    # Application sidebar navigation
│   │   └── PublicPageLayout.tsx
│   │
│   ├── convex/                # Convex backend functions
│   │   ├── auth.ts            # Better Auth configuration
│   │   ├── profiles.ts        # User profile management
│   │   ├── users.ts           # User operations
│   │   ├── households.ts      # Family/household management
│   │   ├── roles.ts           # Role-based access control
│   │   ├── debug.ts           # Debug utilities
│   │   ├── schema.ts          # Database schema
│   │   └── http.ts            # HTTP routes
│   │
│   ├── lib/                   # Shared utilities
│   │   ├── auth-client.ts     # Client-side auth utilities
│   │   ├── auth-server.ts     # Server-side auth utilities
│   │   ├── auth-session.ts    # Session management helpers
│   │   └── utils.ts           # Common utilities
│   │
│   └── hooks/                 # Custom React hooks
│       └── use-mobile.ts      # Mobile detection hook
│
├── docs/                      # Documentation
│   ├── AUTH_TESTING_GUIDE.md  # Complete auth testing guide
│   └── SIDEBAR_INTEGRATION.md # Sidebar setup guide
│
├── public/                    # Static assets
│   └── pathible-logo.svg
│
├── cypress/                   # E2E tests
│
├── components.json            # shadcn/ui configuration
├── convex.json               # Convex configuration
├── tsconfig.json             # TypeScript configuration
└── CLAUDE.md                 # Project instructions for Claude Code

```

## Key Features Implemented

### ✅ Authentication System
- Email OTP (One-Time Password) authentication
- Passwordless login/signup flow
- Session management with Better Auth
- Protected routes with server-side validation
- Email templates for sign-in, verification, and password reset

### ✅ User Management
- User profiles with first/last name
- Onboarding flow for new users
- Server-side session helpers (`requireServerAuth`, `getServerSession`)
- Debug utilities for troubleshooting auth issues

### ✅ Dashboard
- Authenticated dashboard with sidebar navigation
- Real-time stats (Heritage Vault items, Wisdom entries, Legacy Plan completion)
- Next step recommendations based on user progress
- Daily wisdom/devotional section
- Fully responsive layout

### ✅ UI Components
- Complete shadcn/ui component library
- Custom Pathible design system with:
  - Warm sand background (#F6F4F1)
  - Forest green primary (#4B7F52)
  - Rich gold accent (#D4AF37)
  - Sage green secondary (#7BA083)
- Collapsible sidebar with icon mode
- Mobile-responsive navigation
- Professional landing page with value propositions

### ✅ Backend Infrastructure
- Convex real-time database
- Type-safe queries and mutations
- Household/family management system
- Role-based access control
- Database schema for profiles, users, households

## Authentication Flow

Pathible uses **email OTP (One-Time Password)** authentication for a passwordless, secure experience:

1. **User enters email** → System sends 6-digit OTP code
2. **User enters OTP** → System verifies and creates session
3. **New users** → Redirect to onboarding to create profile
4. **Existing users** → Redirect to dashboard

### Testing Authentication

For detailed testing instructions, see [docs/AUTH_TESTING_GUIDE.md](/docs/AUTH_TESTING_GUIDE.md).

**Quick test:**
```bash
# 1. Start dev server
pnpm dev

# 2. Visit http://localhost:3000/login
# 3. Enter: test@example.com
# 4. Check Convex terminal for OTP code (e.g., "123456")
# 5. Enter OTP and verify you can access the dashboard
```

### Debug Commands

In the Convex Dashboard Functions tab, you can run these debug queries:

```javascript
// Check if user is authenticated
debug.amIAuthenticated()

// Get current user details
debug.getCurrentAuthUser()

// Get complete user info with profile
debug.getMyCompleteInfo()

// Check Better Auth status
debug.checkBetterAuthStatus()

// List all profiles
debug.listAllProfiles()
```

## Development Guidelines

### Server Components First
Pathible uses Next.js Server Components by default for better performance and SEO. Only use `"use client"` when you need:
- Event handlers (onClick, onChange, etc.)
- Browser APIs (window, document, localStorage)
- React hooks (useState, useEffect, useContext)

### Convex Best Practices
All Convex functions are located in `src/convex/`. Key patterns:

- **Use explicit validators**: All functions MUST include `args` and `returns` validators
- **Query optimization**: Use `withIndex` instead of `filter` for better performance
- **Authentication**: Use `getCurrentUser` query or `requireAuth` helper for protected functions
- See `.cursor/rules/convex_rules.mdc` for comprehensive guidelines

### Styling
Pathible uses custom Tailwind CSS v4 with:
- CSS variables for theme colors (defined in `globals.css`)
- Custom utility classes for buttons, cards, inputs
- Responsive design patterns
- Dark mode support (not currently enabled)

## Environment Configuration

### Required Variables
```env
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site
SITE_URL=http://localhost:3000
```

### Optional (Production)
```env
# Email sending via Resend
RESEND_API_KEY=re_your_api_key
EMAIL_FROM_ADDRESS=noreply@pathible.com
EMAIL_FROM_NAME=Pathible
```

**Note:** In development without `RESEND_API_KEY`, OTP codes are logged to the Convex terminal instead of being emailed.

## Roadmap

### Coming Soon
- Heritage Vault file upload and management
- Wisdom & Education content creation
- Legacy Planning questionnaire
- Financial account linking
- Family member invitations
- Document sharing and permissions

### Future Enhancements
- Charitable giving planning
- Mobile apps (iOS/Android)
- Advanced search and tagging
- AI-powered legacy summaries
- Multi-language support

## Support & Documentation

- **Authentication Guide**: [docs/AUTH_TESTING_GUIDE.md](/docs/AUTH_TESTING_GUIDE.md)
- **Sidebar Integration**: [docs/SIDEBAR_INTEGRATION.md](/docs/SIDEBAR_INTEGRATION.md)
- **Convex Guidelines**: [.cursor/rules/convex_rules.mdc](/.cursor/rules/convex_rules.mdc)
- **Project Instructions**: [CLAUDE.md](/CLAUDE.md)

## Contributing

This is a private family project. For questions or issues, please contact the project maintainer.

## License

Private and proprietary. All rights reserved.

---

**Built with ❤️ for families who want to preserve what matters most.**
