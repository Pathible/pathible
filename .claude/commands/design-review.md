# Design Review Command

## ⚠️ IMPORTANT: Always Review First, Never Implement Directly

**Even if the user provides a mockup and says "Implement this" - DO NOT implement straight away.**

**ALWAYS follow this workflow:**

1. Generate the full design review report first
2. Show the report to the user
3. Wait for user to review and decide what to do
4. Only then ask if they want fixes/implementation

## Prerequisites

**🔴 REQUIRED: Chrome browser automation must be available**

This command requires BOTH:

1. **Visual inspection** - Screenshots of the actual rendered page via Chrome
2. **Code inspection** - Reading the source files

You cannot do a proper design review from code alone. You MUST see how the page actually renders.

**Before starting, verify Chrome is available:**

- Call `mcp__claude-in-chrome__tabs_context_mcp` to check connection
- If Chrome tools are unavailable, STOP and tell the user:

  ```
  I need the Claude for Chrome extension to perform a design review.

  To get started:
  1. Install the extension: https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn
  2. View the documentation: https://code.claude.com/docs/en/chrome

  Once installed, please ensure Chrome is open with the extension running.
  ```

**Dev server must be running:**

- Check if the dev server is running: `lsof -i :3000`
- If not running, start it automatically: `pnpm dev` (run in background)
- Wait for the server to be ready before proceeding
- Inform the user: "Starting dev server..." so they know what's happening

## Overview

This command performs a systematic UI standards compliance review by:

1. Loading design standards (UI_STANDARDS.md + PATHIBLE_DESIGN_SYSTEM.md)
2. Identifying changed UI files in the PR/branch
3. Capturing the implemented UI via Chrome (visual) AND reading source code
4. Reviewing against all standards: accessibility, design tokens, icons, responsive
5. Generating a detailed report for user review
6. Posting results to GitHub PR
7. **Only making changes after user approval**

## Design Standards Reference

The review checks compliance against TWO documents:

1. **UI_STANDARDS.md** - Component patterns, icons, accessibility, responsive design
2. **PATHIBLE_DESIGN_SYSTEM.md** - Colors, typography, Tailwind tokens, component classes

**Always read both files before starting a review:**

```bash
cat docs/UI_STANDARDS.md
cat docs/PATHIBLE_DESIGN_SYSTEM.md
```

## Instructions

### Phase 1: Identify Scope

1. **Determine what to review:**

   Option A: User provides specific file(s) or route

   ```
   "Review the login page at /auth/login"
   "Review src/components/Button.tsx"
   ```

   Option B: Review all UI changes in current branch

   ```bash
   # Get changed files compared to main
   git diff --name-only main...HEAD | grep -E '\.(tsx|jsx|css)$'
   ```

   Option C: User provides mockup/screenshot

   - Compare screenshot against rendered implementation
   - Note: Store mockup reference for comparison

2. **Catalog files to review:**
   ```
   Files identified for review:
   1. src/components/ui/Button.tsx
   2. src/app/dashboard/page.tsx
   3. src/components/forms/LoginForm.tsx
   ...
   ```

### Phase 2: Load Standards

1. **Read the design standards files:**

   ```bash
   cat docs/UI_STANDARDS.md
   cat docs/PATHIBLE_DESIGN_SYSTEM.md
   ```

2. **Extract key rules to check:**

   From UI_STANDARDS.md:

   - Icon imports (Pencil not Edit, Trash2 not Trash)
   - Button patterns and variants
   - Form field structure
   - Accessibility requirements
   - Touch target sizes (44×44px minimum)
   - Color token usage (semantic tokens only)

   From PATHIBLE_DESIGN_SYSTEM.md:

   - Pathible color tokens (`pathible-sand`, `pathible-forest`, etc.)
   - Typography classes (`text-h1`, `text-body`, etc.)
   - Component classes (`btn-primary`, `dashboard-card`, etc.)
   - Font families (`font-inter`, `font-crimson`)

### Phase 3: Code Inspection

For EACH file identified, perform static analysis:

#### 3.1 Icon Import Check

```bash
# Check for prohibited icon imports
grep -n "from ['\"]lucide-react['\"]" <file> | grep -E "(Edit|Edit2|Edit3|Trash|TrashIcon)[,\s\}]"
```

**Rules:**
| Prohibited | Required | Severity |
|------------|----------|----------|
| `Edit`, `Edit2`, `Edit3` | `Pencil` | 🔴 Critical |
| `Trash`, `TrashIcon` | `Trash2` | 🔴 Critical |

#### 3.2 Hardcoded Color Check

```bash
# Check for hardcoded hex colors
grep -rn "#[0-9a-fA-F]\{3,6\}" <file>

# Check for arbitrary Tailwind colors
grep -rn "text-\[#" <file>
grep -rn "bg-\[#" <file>
grep -rn "border-\[#" <file>

# Check for non-token gray usage
grep -rn "text-gray-" <file>
grep -rn "bg-gray-" <file>
```

**Rules:**

- ❌ Hardcoded hex: `#4B7F52` → ✅ Use `text-pathible-forest` or `text-primary`
- ❌ Arbitrary values: `text-[#2C2C2C]` → ✅ Use `text-foreground`
- ❌ Generic grays: `text-gray-500` → ✅ Use `text-muted-foreground`

#### 3.3 Accessibility Attributes Check

```bash
# Icon buttons without sr-only
grep -n "size=\"icon\"" <file>

# Inputs without labels
grep -n "<Input" <file>
grep -n "<input" <file>

# Images without alt
grep -n "<img" <file> | grep -v "alt="

# Buttons/links without accessible names
grep -n "<Button" <file>
```

**For each icon button found, verify:**

- Has `<span className="sr-only">` OR
- Has `aria-label` attribute

**For each input found, verify:**

- Has associated `<Label htmlFor="">` OR
- Has `aria-label` attribute
- Error states use `aria-invalid` and `aria-describedby`

#### 3.4 Component Library Check

```bash
# Check for non-shadcn imports (should not exist in new code)
grep -n "@mui" <file>
grep -n "@chakra" <file>
grep -n "@radix-ui" <file>  # Direct radix imports - should use shadcn wrappers
```

**Rules:**

- shadcn/ui components should be imported from `@/components/ui/`
- No direct MUI, Chakra, or raw Radix imports in new code

#### 3.5 Button Pattern Check

Verify buttons follow standard patterns:

```bash
# Find all Button usages
grep -n "<Button" <file>
```

**Check each button for:**

- Icon + text: Icon should be before text with `h-4 w-4`
- Icon-only: Must have `sr-only` or `aria-label`
- Loading state: Uses `Loader2` with `animate-spin`
- Destructive actions: Uses `variant="destructive"` or `className="text-destructive"`

#### 3.6 Form Structure Check

For files containing forms:

```bash
grep -n "<form" <file>
grep -n "<Input" <file>
grep -n "<Label" <file>
```

**Verify:**

- Labels linked via `htmlFor` matching input `id`
- Required fields have indicator (not color-only)
- Error messages linked via `aria-describedby`
- Form spacing uses `space-y-6` for fields, `space-y-2` for label/input/help

#### 3.7 Responsive Check

```bash
# Check for responsive classes
grep -n "sm:" <file>
grep -n "md:" <file>
grep -n "lg:" <file>

# Check for mobile-unfriendly patterns
grep -n "hidden" <file> | grep -v "sm:\|md:\|lg:"
```

**Flag if:**

- No responsive breakpoints in layout components
- Elements hidden without mobile alternative
- Fixed widths without responsive variants

### Phase 4: Visual Inspection

1. **Set up Chrome browser:**

   - Get tab context
   - Create new tab
   - Navigate to implementation URL (e.g., `http://localhost:3000/[route]`)
   - Handle login if needed

2. **Capture implementation:**

   - Take screenshot
   - Read page structure with `mcp__claude-in-chrome__read_page`

3. **Visual checks:**
   - Touch targets appear adequate (44×44px)
   - Text is readable (contrast)
   - Layout responds to viewport (resize if possible)
   - Focus states visible (tab through interactive elements)
   - No visual regressions from mockup (if provided)

### Phase 5: Systematic Review

Compile findings into categories:

#### 5.1 Icon Standards Compliance

| File:Line    | Found    | Should Be | Status |
| ------------ | -------- | --------- | ------ |
| Button.tsx:5 | `Edit`   | `Pencil`  | ❌     |
| Menu.tsx:12  | `Trash2` | `Trash2`  | ✅     |

#### 5.2 Color Token Compliance

| File:Line   | Found              | Should Be              | Status |
| ----------- | ------------------ | ---------------------- | ------ |
| Card.tsx:15 | `#4B7F52`          | `text-pathible-forest` | ❌     |
| Alert.tsx:8 | `text-destructive` | `text-destructive`     | ✅     |

#### 5.3 Accessibility Compliance

| File:Line      | Issue                           | Required Fix                     | Severity    |
| -------------- | ------------------------------- | -------------------------------- | ----------- |
| IconBtn.tsx:20 | Icon button missing sr-only     | Add `<span className="sr-only">` | 🔴 Critical |
| Form.tsx:45    | Input missing label association | Add `htmlFor`/`id` pair          | 🔴 Critical |
| Card.tsx:30    | Heading skips h2 → h4           | Fix heading hierarchy            | 🟡 Major    |

#### 5.4 Design System Compliance

| File:Line   | Issue                | Should Use          | Severity |
| ----------- | -------------------- | ------------------- | -------- |
| Hero.tsx:10 | Custom button styles | `btn-primary` class | 🟡 Major |
| Card.tsx:5  | Missing card class   | `dashboard-card`    | 🟢 Minor |

#### 5.5 Responsive Design

| File:Line   | Issue                                        | Recommendation                      | Severity    |
| ----------- | -------------------------------------------- | ----------------------------------- | ----------- |
| Grid.tsx:15 | No responsive breakpoints                    | Add `sm:grid-cols-2 lg:grid-cols-3` | 🟡 Major    |
| Nav.tsx:8   | Desktop nav hidden on mobile, no alternative | Add mobile nav                      | 🔴 Critical |

### Phase 6: Generate Report

Output the FULL report to the terminal:

```markdown
═══════════════════════════════════════════════════════════════════
UI STANDARDS REVIEW REPORT
═══════════════════════════════════════════════════════════════════

📋 Review Details
─────────────────────────────────────────────────────────────────
Branch: [branch-name]
Files Reviewed: [count]
Date: [current-date]
Reviewer: Claude (Automated)
Standards: UI_STANDARDS.md, PATHIBLE_DESIGN_SYSTEM.md

═══════════════════════════════════════════════════════════════════
SUMMARY
═══════════════════════════════════════════════════════════════════

Total Checks Performed: X
────────────────────────────
✅ Passing: X
❌ Issues Found: X

Issues by Severity:
────────────────────────────
🔴 Critical: X (must fix before merge)
🟡 Major: X (should fix)
🟢 Minor: X (recommended)

Issues by Category:
────────────────────────────
🎨 Icon Standards: X issues
🎨 Color Tokens: X issues
♿ Accessibility: X issues
📐 Design System: X issues
📱 Responsive: X issues

═══════════════════════════════════════════════════════════════════
FILES REVIEWED
═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│ 1. src/components/ui/Button.tsx │
├─────────────────────────────────────────────────────────────────┤
│ Status: ✅ COMPLIANT / ❌ X ISSUES │
│ │
│ Issues: │
│ • Line 15: [Category] [Issue description] │
│ Fix: [How to fix] │
│ │
│ • Line 28: [Category] [Issue description] │
│ Fix: [How to fix] │
└─────────────────────────────────────────────────────────────────┘

[Repeat for each file...]

═══════════════════════════════════════════════════════════════════
ICON STANDARDS COMPLIANCE
═══════════════════════════════════════════════════════════════════

Prohibited Imports Found:
────────────────────────────
| File:Line | Found | Replace With | Severity |
|--------------------|------------|--------------|----------|
| Button.tsx:5 | Edit | Pencil | 🔴 Crit |
| Menu.tsx:12 | Trash | Trash2 | 🔴 Crit |

Icon Button Accessibility:
────────────────────────────
| File:Line | Has sr-only/aria-label | Status |
|--------------------|------------------------|--------|
| Header.tsx:45 | ❌ Missing | 🔴 Crit|
| Toolbar.tsx:20 | ✅ sr-only present | ✅ OK |

═══════════════════════════════════════════════════════════════════
COLOR TOKEN COMPLIANCE
═══════════════════════════════════════════════════════════════════

Hardcoded Colors Found:
────────────────────────────
| File:Line | Found | Should Be | Severity |
|------------------|--------------|------------------------|----------|
| Card.tsx:15 | #4B7F52 | text-pathible-forest | 🟡 Major |
| Alert.tsx:8 | #F6F4F1 | bg-pathible-sand | 🟡 Major |
| Button.tsx:22 | text-gray-500| text-muted-foreground | 🟢 Minor |

Pathible Token Reference:
────────────────────────────
| Hardcoded Value | Pathible Token | Semantic Token |
|-----------------|-------------------------|-------------------|
| #F6F4F1 | bg-pathible-sand | bg-background |
| #2C2C2C | text-pathible-charcoal | text-foreground |
| #4B7F52 | text-pathible-forest | text-primary |
| #D4AF37 | text-pathible-gold | text-accent |
| #7BA083 | text-pathible-sage | text-secondary |
| #8B8680 | text-pathible-warm-gray | text-muted |

═══════════════════════════════════════════════════════════════════
ACCESSIBILITY COMPLIANCE
═══════════════════════════════════════════════════════════════════

WCAG 2.1 AA Checklist:
────────────────────────────
| Requirement | Status | Issues |
|----------------------------------|--------|--------|
| Icon buttons have accessible names| ❌ | 2 |
| Form inputs have labels | ✅ | 0 |
| Error states use aria-invalid | ❌ | 1 |
| Heading hierarchy correct | ✅ | 0 |
| Focus indicators visible | ✅ | 0 |
| Touch targets ≥44px | ⚠️ | 1 |
| Color contrast adequate | ✅ | 0 |

Detailed Issues:
────────────────────────────
| File:Line | WCAG Criterion | Issue | Fix |
|----------------|----------------|--------------------------|-----|
| IconBtn.tsx:20 | 4.1.2 | No accessible name | Add sr-only or aria-label |
| Form.tsx:45 | 1.3.1 | Input not linked to label| Add htmlFor/id pair |

═══════════════════════════════════════════════════════════════════
RESPONSIVE DESIGN COMPLIANCE
═══════════════════════════════════════════════════════════════════

Breakpoint Usage:
────────────────────────────
| File | sm: | md: | lg: | xl: | Status |
|-----------------|-----|-----|-----|-----|--------|
| Grid.tsx | ❌ | ❌ | ❌ | ❌ | ⚠️ None|
| Layout.tsx | ✅ | ✅ | ✅ | ❌ | ✅ OK |
| Nav.tsx | ❌ | ✅ | ✅ | ❌ | ⚠️ No mobile |

Issues:
────────────────────────────
| File:Line | Issue | Recommendation |
|--------------|------------------------------------|----------------|
| Grid.tsx:15 | No responsive grid | Add sm:grid-cols-2 lg:grid-cols-3 |
| Nav.tsx:8 | Hidden on mobile, no alternative | Add Sheet/hamburger menu |

═══════════════════════════════════════════════════════════════════
ALL ISSUES SUMMARY
═══════════════════════════════════════════════════════════════════

🔴 CRITICAL ISSUES (must fix before merge)
─────────────────────────────────────────────────────────────────

1. [File:Line] [Category]: [Issue]
   Fix: [Code snippet or instruction]

2. [File:Line] [Category]: [Issue]
   Fix: [Code snippet or instruction]

🟡 MAJOR ISSUES (should fix)
─────────────────────────────────────────────────────────────────

1. [File:Line] [Category]: [Issue]
   Fix: [Code snippet or instruction]

🟢 MINOR ISSUES (recommended)
─────────────────────────────────────────────────────────────────

1. [File:Line] [Category]: [Issue]
   Fix: [Code snippet or instruction]

═══════════════════════════════════════════════════════════════════
END OF REPORT
═══════════════════════════════════════════════════════════════════
```

### Phase 7: Post to GitHub PR

**This step is MANDATORY for every review.**

1. **Get current branch and find PR:**

   ```bash
   BRANCH=$(git branch --show-current)
   gh pr list --head "$BRANCH" --json number,title,url
   ```

2. **If PR exists, add review comment:**

   ```bash
   gh pr comment [PR_NUMBER] --body "[formatted review]"
   ```

3. **Format the PR comment:**

   ```markdown
   ## 🎨 UI Standards Review

   **Branch:** `[branch-name]`
   **Files Reviewed:** [count]
   **Date:** [date]
   **Reviewer:** Claude (Automated)

   ### Summary

   | Category       | ✅ Pass | ❌ Issues |
   | -------------- | ------- | --------- |
   | Icon Standards | X       | X         |
   | Color Tokens   | X       | X         |
   | Accessibility  | X       | X         |
   | Design System  | X       | X         |
   | Responsive     | X       | X         |
   | **Total**      | **X**   | **X**     |

   ### 🔴 Critical Issues (X)

   <details>
   <summary>Must fix before merge</summary>

   | #   | File          | Line | Issue                               | Fix                              |
   | --- | ------------- | ---- | ----------------------------------- | -------------------------------- |
   | 1   | `Button.tsx`  | 15   | Prohibited icon import `Edit`       | Replace with `Pencil`            |
   | 2   | `IconBtn.tsx` | 20   | Icon button missing accessible name | Add `<span className="sr-only">` |

   </details>

   ### 🟡 Major Issues (X)

   <details>
   <summary>Should fix</summary>

   | #   | File       | Line | Issue                     | Fix                        |
   | --- | ---------- | ---- | ------------------------- | -------------------------- |
   | 1   | `Card.tsx` | 15   | Hardcoded color `#4B7F52` | Use `text-pathible-forest` |

   </details>

   ### 🟢 Minor Issues (X)

   <details>
   <summary>Recommended improvements</summary>

   | #   | File       | Line | Issue                 | Fix                         |
   | --- | ---------- | ---- | --------------------- | --------------------------- |
   | 1   | `Text.tsx` | 8    | Using `text-gray-500` | Use `text-muted-foreground` |

   </details>

   ---

   **Standards:** [UI_STANDARDS.md](./docs/UI_STANDARDS.md) | [PATHIBLE_DESIGN_SYSTEM.md](./docs/PATHIBLE_DESIGN_SYSTEM.md)

   _Automated review by Claude_
   ```

4. **If no PR exists:**

   - Inform the user: "No PR found for branch `[branch]`. Create a PR to receive the review comment."
   - Still output the full report to terminal

5. **Report posting status:**
   ```
   ✅ Review posted to PR #[number]: [PR URL]
   ```

### Phase 8: Wait for User Decision

**STOP HERE AND WAIT FOR USER INPUT.**

After displaying the report and posting to PR, present options:

**If there are 🔴 CRITICAL issues:**

```
───────────────────────────────────────────────────────────────────
                    READY FOR YOUR REVIEW
───────────────────────────────────────────────────────────────────

⛔ This PR has critical issues that must be fixed before merge.

Please review the report above. What would you like to do?

1. Fix all issues (Critical + Major + Minor)
2. Fix critical and major issues only
3. Fix critical issues only
4. Fix specific issues (tell me which ones)
5. Do nothing - I just needed the report

Enter your choice:
```

**If there are NO 🔴 CRITICAL issues:**

```
───────────────────────────────────────────────────────────────────
                    READY FOR YOUR REVIEW
───────────────────────────────────────────────────────────────────

✅ No critical issues! This PR can be merged.

Please review the report above. What would you like to do?

1. Fix all issues (Major + Minor)
2. Fix major issues only
3. Fix specific issues (tell me which ones)
4. Do nothing - looks good to merge

Enter your choice:
```

**DO NOT proceed with any fixes until the user responds.**

### Phase 9: Apply Fixes (Only After User Approval)

Only if the user chooses to fix issues:

1. **Confirm the scope:**
   "I will fix the following issues: [list]. Proceed? (yes/no)"

2. **For each approved fix:**

   - Read the current file
   - Make the specific change
   - Explain what was changed

3. **After all fixes:**
   - Summarize changes made
   - Run `pnpm lint` to verify no new issues
   - Offer to re-run the design review to verify fixes
   - Commit message suggestion: `fix: UI standards compliance - [summary]`

## Issue Severity Guidelines

### 🔴 Critical (Merge Blocker)

- Prohibited icon imports (`Edit`, `Trash` instead of `Pencil`, `Trash2`)
- Missing accessible names on interactive elements
- Form inputs without label association
- Navigation inaccessible on mobile (no alternative)
- New non-shadcn component library imports

### 🟡 Major (Should Fix)

- Hardcoded brand colors instead of tokens
- Missing responsive breakpoints on layout components
- Heading hierarchy violations (skipped levels)
- Touch targets below 44px
- Missing error state accessibility (`aria-invalid`, `aria-describedby`)

### 🟢 Minor (Recommended)

- Using `text-gray-*` instead of `text-muted-foreground`
- Missing Pathible component class (`dashboard-card`, `btn-primary`)
- Spacing inconsistencies
- Minor typography class mismatches

## Quick Reference: Pathible Design System

### Color Tokens

```
Semantic:                    Pathible Brand:
--background → #F6F4F1       pathible-sand
--foreground → #2C2C2C       pathible-charcoal
--primary → #4B7F52          pathible-forest
--secondary → #7BA083        pathible-sage
--accent → #D4AF37           pathible-gold
--muted → #8B8680            pathible-warm-gray
```

### Typography

```
text-h1      → 36px/48px headings
text-h2      → 24px/32px section titles
text-h3      → 20px subsections
text-body    → 18px body text
text-secondary → 16px secondary
text-small   → 14px small text
text-caption → 12px captions
```

### Component Classes

```
btn-primary    → Forest green button
btn-secondary  → Sage green with lift
btn-ghost      → Transparent with border
btn-accent     → Gold with lift
dashboard-card → Standard card with hover
input-field    → Styled input
```

### Icon Standards

```
✅ Use:          ❌ Never use:
Pencil           Edit, Edit2, Edit3
Trash2           Trash, TrashIcon
Loader2          (with animate-spin)
```

## Important Rules

1. **Chrome is REQUIRED** - Cannot do proper review without visual inspection
2. **ALWAYS post to PR** - Every review must be documented on the PR
3. **NEVER implement directly** - Review first, fix only after approval
4. **Read BOTH standards files** - UI_STANDARDS.md AND PATHIBLE_DESIGN_SYSTEM.md
5. **Check ALL categories** - Icons, colors, accessibility, responsive, design system
6. **Use pnpm** - Not npm
7. **Complete the FULL review** - Don't skip categories even if early issues found
8. **Show complete report** - Don't summarize, output everything
9. **Wait for user decision** - Never auto-fix without explicit approval
