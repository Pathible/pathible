# Settings, Billing & Account Page Patterns

## General Rule

Settings and billing pages are where AI-generated UIs fall apart the hardest because AI doesn't understand the relationship between settings. It dumps everything on one page with no hierarchy.

## Tabbed Organization

Always organize settings-type pages into tabs. Group related settings together:

### Common Tab Structure

- **General**: App-wide settings (name, timezone, defaults)
- **Billing**: Plan, payment method, invoices
- **Usage**: Current usage metrics, limits, quotas
- **Team**: Members, roles, invitations
- **Integrations**: Connected services, API keys
- **Security**: Password, 2FA, sessions

Some of these can be combined. Billing + Usage often work as a single page with sub-tabs. The point is that a flat list of 20 settings is never acceptable.

## Billing Page Design

### Plan Display

Use a two-column layout for current plan info:

```
┌────────────────────────────┬─────────────────────────┐
│ Current Plan: Pro          │    Usage This Period     │
│ $29/month                  │                          │
│ Renews March 16, 2026      │  Links    ████░░  847/1k │
│                            │  Clicks   ██░░░░  2.1k/5k│
│ [Change Plan] [Cancel]     │  Storage  █░░░░░  120MB/1G│
└────────────────────────────┴─────────────────────────┘
```

### Usage Display

- Small donut charts or progress bars for quota items
- Show current / limit with clear visual indicator
- Color shifts as usage approaches limit (green to yellow to red)
- Include a "Last updated" timestamp

### Payment Method Section

Keep it simple:

```
Billing Email: jim@example.com  [Edit]
Payment Method: •••• 4242  Exp 12/27  [Update]
```

### Invoice History

Simple table: Date, Amount, Status (Paid/Pending), Download link. Nothing more.

## Account Card Pattern

Replace the AI-generated gradient circle avatar with a proper account card:

```
┌──────────────────────┐
│ JD  Jim Davis        │
│     jim@example.com  │
│     Pro Plan         │
└──────────────────────┘
```

On click, show a popover with:

- Settings link
- Billing link
- Theme toggle
- Sign out

This eliminates 3-4 sidebar links and consolidates account actions into one place.

## Form Patterns

### When to Use Modals vs Full Pages

- **Modal**: Focused single-purpose tasks (create link, add team member, change password)
- **Full page**: Multi-section configuration (profile settings, notification preferences)
- **Inline editing**: Simple value changes (display name, email)

### Modal Design

- Width: 480-560px for simple forms, up to 720px for complex ones
- Collapse advanced/optional fields by default
- Clear primary action button (not two equal-weight buttons)
- Close button in top-right corner
- Subtle backdrop overlay

### AI Form Anti-Patterns

- Sparse forms using full-page width (wasteful)
- All fields visible even when most are optional
- Equal visual weight for required and optional fields
- No grouping of related fields

## Pages That "Don't Do Anything"

AI loves generating decorative info cards that display static information with no actions. If a card or section has no interactivity and no actionable information, remove it. Every element should either inform a decision or enable an action.

## Progressive Disclosure in Settings

Not all settings are equal. Apply hierarchy:

1. **Always visible**: Settings users change frequently
2. **Expandable section**: Settings changed occasionally (labeled "Advanced" or similar)
3. **Separate page/tab**: Settings changed rarely (security, data export, account deletion)
