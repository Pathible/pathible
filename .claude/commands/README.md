# Claude Code Commands

Custom slash commands for code review, remediation, and PR workflows in Pathible.

## Quick Start

```bash
# Create a pull request
/create-pr

# Run a code review
/code-review

# Create a fix plan from review findings
/fix-plan

# Fix issues from the plan
/fix-issues
```

## What Are Slash Commands?

Slash commands are custom prompts that expand into detailed instructions for Claude. They're defined as markdown files in this folder and invoked by typing `/command-name` in Claude Code.

## Available Commands

### `/create-pr`

Creates a pull request with auto-generated description.

**Usage:**

```bash
/create-pr                # Create PR with auto-generated title
/create-pr --draft        # Create as draft PR
/create-pr --base=develop # Target different branch
```

**What it does:**

1. Runs pre-commit checks (`pnpm lint`, `pnpm build`)
2. Analyzes commits to determine PR description
3. Creates descriptive PR with summary and test plan
4. Pushes branch and creates PR via GitHub CLI

**Requirements:**

- GitHub CLI installed and authenticated (`gh auth login`)

---

### `/code-review`

Performs comprehensive code review using specialist agents in parallel.

**Usage:**

```bash
/code-review              # Review all changes
/code-review --no-tests   # Skip test file review
```

**What it does:**

1. Gets the diff between your branch and `main`
2. Selects relevant agents based on file types changed
3. Launches agents in parallel (security, convex, frontend, performance, code quality, types, tests)
4. Synthesizes findings into a single report with scores and action items

**Agents used:**

| Agent                  | Reviews                                              |
| ---------------------- | ---------------------------------------------------- |
| security-reviewer      | Better Auth patterns, data exposure, Convex security |
| convex-architect       | Schema design, query/mutation patterns, validators   |
| frontend-architect     | Next.js App Router, Server/Client Components         |
| performance-reviewer   | Convex queries, React rendering, optimization        |
| refactoring-specialist | Code smells, SOLID/DRY/KISS violations               |
| typescript-pro         | Type safety, `any` usage, null handling              |
| test-writer-fixer      | Cypress E2E test coverage and patterns               |

---

### `/fix-plan`

Creates a prioritized remediation plan from code review findings.

**Usage:**

```bash
/fix-plan                 # Create plan locally
/fix-plan --post-to-pr    # Create plan and post checklist to PR
```

**What it does:**

1. Gathers findings from the most recent code review
2. Creates a detailed plan file at `.claude/plans/fix-plan-[branch]-[date].md`
3. Orders issues by priority (critical → major) and dependencies
4. Optionally posts a summary checklist to the GitHub PR

**Output includes:**

- Issue details with file:line references
- Code snippets showing problem and fix
- Dependency graph between issues
- Progress tracking table

---

### `/fix-issues`

Executes fixes from the current fix plan.

**Usage:**

```bash
/fix-issues              # Fix all issues in priority order
/fix-issues #1           # Fix only issue #1
/fix-issues #1 #3        # Fix specific issues
/fix-issues --critical   # Fix only critical issues
/fix-issues --major      # Fix critical and major issues
```

**What it does:**

1. Reads the most recent fix plan
2. Respects dependencies between issues
3. Applies fixes using Edit tool
4. Runs typecheck to verify
5. Updates plan file with completion status
6. Provides summary report

---

## Recommended Workflow

```
┌─────────────────┐
│  Make changes   │
└────────┬────────┘
         ▼
┌─────────────────┐
│  /code-review   │  ← Review your changes
└────────┬────────┘
         ▼
┌─────────────────┐
│   /fix-plan     │  ← Create remediation plan
└────────┬────────┘
         ▼
┌─────────────────┐
│  /fix-issues    │  ← Auto-fix issues
└────────┬────────┘
         ▼
┌─────────────────┐
│  /code-review   │  ← Verify fixes
└────────┬────────┘
         ▼
┌─────────────────┐
│   /create-pr    │  ← Create PR with auto-filled template
└─────────────────┘
```

## Prerequisites

**Required:** GitHub CLI (`gh`) for PR operations.

```bash
# Install on macOS
brew install gh

# Authenticate
gh auth login
```

## Creating New Commands

To create a new command, add a markdown file to this folder:

```markdown
# Command Name

Description of what this command does.

## Arguments

$ARGUMENTS

## Instructions

### Step 1: ...
```

The filename becomes the command name: `my-command.md` → `/my-command`

---

### `/debug-auth`

Diagnose authentication issues by checking user state, sessions, and profiles.

**Usage:**

```bash
/debug-auth                   # Show database overview
/debug-auth user@example.com  # Look up specific user
/debug-auth --sessions        # List active sessions
/debug-auth --profiles        # Find orphaned profiles
```

**What it does:**

1. Checks Clerk user existence
2. Verifies Convex profile exists
3. Validates household membership
4. Reports subscription status
5. Provides fix recommendations

---

### `/test-setup`

Verify and configure the Cypress E2E test environment.

**Usage:**

```bash
/test-setup           # Check prerequisites
/test-setup --fix     # Auto-fix missing dependencies
/test-setup --ci      # Generate CI/CD configuration
```

**What it does:**

1. Checks Node.js, pnpm, Cypress versions
2. Verifies environment variables
3. Tests server accessibility
4. Optionally fixes issues automatically
5. Generates GitHub Actions config

---

### `/schema-check`

Validate schema entities against implementation and roadmap.

**Usage:**

```bash
/schema-check              # Quick health summary
/schema-check profiles     # Check specific table
/schema-check --unused     # Find tables without implementation
/schema-check --roadmap    # Compare against SCHEMA_ROADMAP.md
/schema-check --full       # Complete audit
```

**What it does:**

1. Parses schema.ts for all table definitions
2. Searches for usage across Convex modules
3. Cross-references with SCHEMA_ROADMAP.md
4. Reports coverage and discrepancies

---

### `/security-audit`

Run security checks against current branch before merge.

**Usage:**

```bash
/security-audit              # Audit changed files
/security-audit vault        # Audit specific module
/security-audit --full       # Complete security audit
/security-audit --quick      # Fast common vulnerability check
/security-audit --log        # Append to SECURITY_AUDIT_LOG.md
```

**What it does:**

1. Verifies authentication checks on mutations
2. Validates authorization (household access, roles)
3. Checks subscription enforcement
4. Reviews input validation
5. Identifies data exposure risks
6. Generates remediation report

---

## All Commands at a Glance

| Command | Purpose |
|---------|---------|
| `/create-pr` | Create pull request with auto-description |
| `/code-review` | Comprehensive code review with agents |
| `/fix-plan` | Create remediation plan from review |
| `/fix-issues` | Auto-fix issues from plan |
| `/review` | Quick PR review |
| `/commit` | Create commit with conventional message |
| `/debug-auth` | Diagnose authentication issues |
| `/test-setup` | Verify test environment |
| `/schema-check` | Validate schema implementation |
| `/security-audit` | Security vulnerability check |
| `/soundbites` | Generate PEACE framework marketing soundbites |

---

### `/soundbites`

Generate zero-cognitive-load marketing soundbites using the StoryBrand PEACE framework.

**Usage:**

```bash
/soundbites              # Interactive soundbite generation
/soundbites --refine     # Refine existing soundbites
/soundbites --derivative # Generate derivative content
```

**What it does:**

1. Reviews codebase to understand product/service
2. Asks interactive questions about target audience and core problem
3. Generates 5 PEACE soundbites (Problem, Empathy, Answer, Change, End Result)
4. Evaluates cognitive load (target: 0)
5. Saves to `marketing/PEACE-soundbites.md`
6. Offers refinement and derivative content generation

**PEACE Framework:**

| Element    | Purpose                             |
| ---------- | ----------------------------------- |
| Problem    | Attract attention                   |
| Empathy    | Create empathetic bond              |
| Answer     | Elevate product value               |
| Change     | Add personal value                  |
| End Result | Cast vision that motivates action   |

**Cognitive Load Rules:**
- Zero cognitive load = immediately understood, no interpretation needed
- No clever language, jargon, or vague messaging
- Plain, simple words a child could understand

**Reference:** See `.claude/skills/soundbites/SKILL.md` for full framework documentation.

---

## Tips

- **Chain commands**: Run `/code-review`, then `/fix-plan --post-to-pr` for full workflow
- **Iterate**: Use `/fix-issues #1` to fix one issue at a time
- **Skip tests**: Use `--no-tests` when reviewing non-test changes only
- **Team visibility**: Use `--post-to-pr` to share fix plans on PRs
- **Before merge**: Run `/security-audit` to catch vulnerabilities
- **Schema changes**: Run `/schema-check --roadmap` to keep docs in sync
