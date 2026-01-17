# StoryBrand Soundbites Skill

> **Purpose**: Generate zero-cognitive-load marketing soundbites using the PEACE framework. Creates 5 foundational soundbites that form the basis of all marketing collateral.

---

## Quick Reference

### The PEACE Framework

| Letter | Element    | Purpose                                    |
| ------ | ---------- | ------------------------------------------ |
| P      | Problem    | Attract attention                          |
| E      | Empathy    | Create an empathetic bond                  |
| A      | Answer     | Elevate the value of the product           |
| C      | Change     | Add personal value to the offer            |
| E      | End Result | Cast a vision that motivates action        |

### Cognitive Load Rules

**Zero cognitive load means:**
- Plain, simple language a child could understand
- No clever or cute phrasing
- No industry jargon
- No vague messaging
- No interpretation required
- Immediately memorable
- **No em dashes or hyphens** (use periods or separate sentences instead)

**Examples:**

| Type | Example | Cognitive Load |
| ---- | ------- | -------------- |
| Poor | "Change Your Relationship With Money" | 20 (vague, requires interpretation) |
| Good | "Never worry about money again" | 0 (clear, concrete, memorable) |
| Poor | "Drowning in coffee shop chaos?" | High (metaphor requires processing) |
| Good | "Losing baristas faster than you can hire?" | 0 (specific, relatable problem) |

---

## How to Use This Skill

### Invoke with `/soundbites`

The skill will:

1. **Gather Context**
   - Review existing codebase/product documentation
   - Understand what the product/service does
   - Identify target audience
   - Determine the "hole" (problem) to own

2. **Interactive Discovery**
   - Ask clarifying questions if context is unclear
   - Help identify the core problem if user is unsure
   - Validate understanding before generating

3. **Generate PEACE Soundbites**
   - Create 5 soundbites with zero cognitive load
   - Evaluate each for cognitive load score
   - Provide before/after examples if helpful

4. **Output**
   - Save soundbites to `marketing/PEACE-soundbites.md`
   - Offer refinement of individual soundbites
   - Option to generate derivative content

---

## The StoryBrand Story Structure

The 5 soundbites invite customers into a story:

```
1. Hero is at PEACE
         ↓
2. Hero falls in a HOLE (Problem soundbite)
   "This is the problem we own"
         ↓
3. GUIDE shows up with empathy (Empathy soundbite)
   "We understand how you feel"
         ↓
4. Guide throws a ROPE (Answer soundbite)
   "Here's the path out"
         ↓
5. Hero CLIMBS out, changed (Change soundbite)
   "This is who you become"
         ↓
6. Hero lives HAPPILY EVER AFTER (End Result soundbite)
   "This is your new reality"
```

---

## Example: YNAB (Budgeting App)

| Element    | Soundbite                                           |
| ---------- | --------------------------------------------------- |
| Problem    | "Has there ever been a time when you worried about money?" |
| Empathy    | "We know how that feels."                           |
| Answer     | "Download the YNAB app."                            |
| Change     | "And get good with money."                          |
| End Result | "So you never worry about money again."             |

**Cognitive Load: 0** - Every soundbite is plain, simple, and immediately understood.

---

## Three-Part Messaging Campaign

Once soundbites are established, they fuel:

### 1. Curiosity (Front Steps)
The soundbites create curiosity assets:
1. BrandScript
2. PEACE Soundbites (this document)
3. Elevator Pitch
4. Landing Page(s)
5. Social Media Posts
6. Lead Generator(s)
7. Video Script(s)
8. Advertising Copy
9. Email and Text Campaigns
10. Sales Rep Talking Points

### 2. Enlightenment (Porch)
Expanded educational content:
11. Newsletters
12. Keynote Presentation(s)
13. Explanatory Video(s)

### 3. Commitment (Front Door)
Deep-dive conversion materials:
14. Pitch Deck(s)
15. Proposals
16. Surprise and Delight Collateral
17. Brand Evangelist Collateral
18. Mini Book(s)
19. Book(s)

*Note: The deeper in the funnel, the more words used.*

---

## Cognitive Load Evaluation Criteria

When evaluating soundbites, check for:

| Criterion | Pass | Fail |
| --------- | ---- | ---- |
| Concrete language | "dirty windows" | "relationship with cleanliness" |
| Specific problem | "losing baristas" | "operational challenges" |
| Plain words | "worry" | "anxiety-inducing circumstances" |
| Direct action | "Download the app" | "Consider exploring our solution" |
| Clear outcome | "never worry again" | "transformed perspective" |
| No jargon | "get good with money" | "optimize your financial wellness" |
| Immediate understanding | Reader gets it instantly | Reader pauses to interpret |
| No dashes | "All in one place." | "All in one place—secure and organized" |

### Scoring Guide

| Score | Meaning |
| ----- | ------- |
| 0 | Perfect - zero interpretation needed |
| 1-5 | Minor adjustment needed - slightly complex |
| 6-10 | Rewrite required - too much interpretation |
| 11-20 | Completely vague - start over |

**Target: 0 for all 5 soundbites**

---

## Questions to Uncover the "Hole"

If the user doesn't know their problem/hole, ask:

1. "What keeps your customers up at night?"
2. "What frustration do people have before they find you?"
3. "What problem would disappear if your product worked perfectly?"
4. "Complete this: 'I'm so tired of ______'"
5. "What do your customers complain about to their friends?"

**The hole must be:**
- Specific (not vague)
- Emotional (not just logical)
- Owned (no one else can claim it better)
- Relatable (most of target audience feels it)

---

## Output Template

When generating soundbites, save to `marketing/PEACE-soundbites.md`:

```markdown
# PEACE Soundbites

> Generated: [DATE]
> Product: [PRODUCT NAME]
> Target Audience: [AUDIENCE]
> The Hole We Own: [PROBLEM]

---

## The Five Soundbites

### P - Problem
**Purpose:** Attract attention

> "[SOUNDBITE]"

Cognitive Load: [SCORE]

---

### E - Empathy
**Purpose:** Create empathetic bond

> "[SOUNDBITE]"

Cognitive Load: [SCORE]

---

### A - Answer
**Purpose:** Elevate product value

> "[SOUNDBITE]"

Cognitive Load: [SCORE]

---

### C - Change
**Purpose:** Add personal value

> "[SOUNDBITE]"

Cognitive Load: [SCORE]

---

### E - End Result
**Purpose:** Cast vision that motivates action

> "[SOUNDBITE]"

Cognitive Load: [SCORE]

---

## Combined Narrative

[Problem] → [Empathy] → [Answer] → [Change] → [End Result]

---

## Next Steps

- [ ] Refine individual soundbites
- [ ] Test with target audience
- [ ] Create derivative content (landing page, social posts, etc.)
```

---

## Interaction Style

- Match user's energy
- Tendency toward direct and efficient
- Ask questions when context is unclear
- Don't generate until understanding is validated
- Offer refinement options after initial generation

---

## Agent Collaboration (Optional)

If available, these agents can assist:
- **content-marketer**: Validate messaging strategy
- **trend-researcher**: Identify relevant market language
- **tiktok-strategist**: Adapt soundbites for social formats

The skill works standalone but can leverage agents when present.
