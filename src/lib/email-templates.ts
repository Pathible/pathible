/**
 * Email Template Content Library
 *
 * Pre-written email templates for common use cases.
 * These can be used as starting points when creating templates in the admin panel.
 */

export interface EmailTemplateContent {
  name: string;
  subject: string;
  description: string;
  category:
    | "onboarding"
    | "retargeting"
    | "announcements"
    | "legacy"
    | "invitations"
    | "digest"
    | "system"
    | "other";
  content: string;
  variables: string[];
}

// ============================================================================
// RETARGETING TEMPLATES
// ============================================================================

export const RETARGETING_TEMPLATES: EmailTemplateContent[] = [
  {
    name: "Abandoned Signup - Day 1",
    subject: "You're so close, {{firstName}}",
    description: "Sent 24 hours after user starts signup but doesn't complete",
    category: "retargeting",
    variables: ["firstName"],
    content: `Hi {{firstName}},

I noticed you started setting up your Pathible account but didn't finish.

No pressure — life gets busy. But I wanted to reach out because I know how easy it is to put off the things that matter most.

**Here's the thing:** The families who benefit most from Pathible aren't the ones who "have it all together." They're the ones who take that first small step.

Your legacy doesn't have to be perfect. It just has to exist.

If you have 5 minutes, you can:
- Upload your first important document
- Write a quick note to someone you love
- Just look around and see what's possible

[button: Continue where you left off]({{dashboardUrl}})

And if you have questions or hit a snag, just reply to this email. I read every one.

Cheering you on,

**Jim Gibbs**
Founder`,
  },
  {
    name: "Abandoned Signup - Day 3",
    subject: "What's holding you back?",
    description: "Sent 3 days after user starts signup but doesn't complete",
    category: "retargeting",
    variables: ["firstName"],
    content: `{{firstName}},

A few days ago, you took the first step toward preserving your legacy with Pathible.

But you haven't come back yet.

I'm curious — what's holding you back?

- **Not sure where to start?** That's normal. Most people feel overwhelmed at first. Start with just one document or one short note.
- **Worried it's too complicated?** It's not. If you can write an email, you can use Pathible.
- **Thinking "I'll do it later"?** I get it. But later has a way of becoming never.

Here's what I've learned: The hardest part isn't organizing your legacy. It's deciding to begin.

You've already made that decision once. Let's finish what you started.

[button: Pick up where you left off]({{dashboardUrl}})

If something specific is in your way, hit reply and tell me. I want to help.

**Jim Gibbs**
Founder`,
  },
  {
    name: "Abandoned Signup - Day 7",
    subject: "One week later...",
    description: "Sent 7 days after user starts signup but doesn't complete",
    category: "retargeting",
    variables: ["firstName"],
    content: `{{firstName}},

It's been a week since you signed up for Pathible.

I'm not going to pretend I know what's going on in your life. Maybe things got crazy. Maybe you're still thinking about it. Maybe you forgot.

Whatever the reason, I just want you to know: **your spot is still here.**

Your family's story matters. Your wisdom matters. The documents and memories and values you want to pass down — they matter.

And Pathible is ready whenever you are.

No guilt. No pressure. Just an open door.

[button: Come back when you're ready]({{dashboardUrl}})

Wishing you well,

**Jim Gibbs**
Founder`,
  },
  {
    name: "Inactive User - 14 Days",
    subject: "We miss you, {{firstName}}",
    description: "Sent to users who haven't logged in for 14 days",
    category: "retargeting",
    variables: ["firstName", "householdName"],
    content: `Hi {{firstName}},

It's been a couple weeks since you've visited {{householdName}} on Pathible.

I wanted to check in and see how things are going.

Building a legacy isn't a sprint — it's a marathon. And sometimes we need a little nudge to keep going.

**Here are a few quick wins you could tackle today:**

1. **Upload one document** — a will, insurance policy, or deed
2. **Write a 2-minute note** to someone you love
3. **Add one key contact** your family should know about

Small steps add up. And every piece you add makes your family's future a little clearer.

[button: Jump back in]({{dashboardUrl}})

If you're stuck or have questions, just reply. I'm here to help.

**Jim Gibbs**
Founder`,
  },
  {
    name: "Inactive User - 30 Days",
    subject: "Is everything okay, {{firstName}}?",
    description: "Sent to users who haven't logged in for 30 days",
    category: "retargeting",
    variables: ["firstName"],
    content: `{{firstName}},

It's been about a month since you logged into Pathible.

I wanted to reach out personally because I know life can get in the way of even our best intentions.

**Is there something I can help with?**

- Having trouble getting started?
- Not sure what to focus on first?
- Running into technical issues?
- Just need some encouragement?

Whatever it is, I'd love to hear from you. Just hit reply.

Your legacy matters. And I don't want you to miss the chance to preserve it.

[button: Return to Pathible]({{dashboardUrl}})

Here for you,

**Jim Gibbs**
Founder`,
  },
];

// ============================================================================
// ANNOUNCEMENT TEMPLATES
// ============================================================================

export const ANNOUNCEMENT_TEMPLATES: EmailTemplateContent[] = [
  {
    name: "New Feature Announcement",
    subject: "New in Pathible: [Feature Name]",
    description: "Template for announcing new features",
    category: "announcements",
    variables: ["firstName"],
    content: `Hi {{firstName}},

I'm excited to share something new with you.

**Introducing: [Feature Name]**

[Brief description of what the feature does and why it matters]

**Here's what you can do with it:**

- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

**How to try it:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

[button: Try it now]({{dashboardUrl}})

This feature came directly from feedback from families like yours. Thank you for being part of this journey.

As always, if you have questions or ideas, just reply to this email.

**Jim Gibbs**
Founder`,
  },
  {
    name: "Feature Update",
    subject: "We made [Feature] even better",
    description: "Template for announcing improvements to existing features",
    category: "announcements",
    variables: ["firstName"],
    content: `{{firstName}},

Quick update: We just made [Feature Name] better.

**What changed:**

- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

**Why it matters:**

[Brief explanation of how this helps users]

You don't need to do anything — the improvements are already live in your account.

[button: Check it out]({{dashboardUrl}})

Thanks for being part of the Pathible family.

**Jim Gibbs**
Founder`,
  },
  {
    name: "Monthly Update",
    subject: "What's new in Pathible ({{currentYear}})",
    description: "Monthly newsletter with updates and tips",
    category: "announcements",
    variables: ["firstName", "currentYear"],
    content: `Hi {{firstName}},

Here's what's been happening at Pathible this month.

---

**🚀 What's New**

[List new features or improvements]

---

**💡 Tip of the Month**

[Share a helpful tip for using Pathible more effectively]

---

**📖 From the Community**

[Share a story or testimonial from another user, with permission]

---

**🗓️ Coming Soon**

[Preview what's coming next]

---

Thank you for trusting Pathible with your family's legacy. We don't take that lightly.

Questions? Ideas? Just reply.

**Jim Gibbs**
Founder`,
  },
  {
    name: "Maintenance Notice",
    subject: "Scheduled maintenance on [Date]",
    description: "Template for notifying users about planned maintenance",
    category: "announcements",
    variables: ["firstName"],
    content: `Hi {{firstName}},

Quick heads up: We'll be doing some scheduled maintenance on **[Date] from [Start Time] to [End Time] ([Timezone])**.

**What to expect:**

- Pathible may be temporarily unavailable during this window
- Your data is safe — this is routine maintenance
- We'll be back online as quickly as possible

**Why we're doing this:**

[Brief explanation — e.g., "We're upgrading our servers to make Pathible faster and more reliable."]

We always try to schedule maintenance during low-traffic hours to minimize disruption.

If you have any questions, just reply to this email.

**Jim Gibbs**
Founder`,
  },
  {
    name: "Product Milestone",
    subject: "A milestone worth celebrating",
    description: "Template for sharing company/product milestones",
    category: "announcements",
    variables: ["firstName"],
    content: `{{firstName}},

I have some news to share.

**[Milestone announcement — e.g., "We just helped our 1,000th family preserve their legacy."]**

When I started Pathible, I had a simple belief: that every family's story deserves to be preserved. That the wisdom, values, and memories we carry shouldn't disappear when we're gone.

Today, I'm more convinced of that than ever.

**Thank you** for being part of this journey. Whether you joined us last week or have been here from the beginning, you're helping build something meaningful.

Here's to the next [milestone].

With gratitude,

**Jim Gibbs**
Founder`,
  },
];

// ============================================================================
// ONBOARDING TEMPLATES
// ============================================================================

export const ONBOARDING_TEMPLATES: EmailTemplateContent[] = [
  {
    name: "Welcome Email",
    subject: "Welcome to Pathible, {{firstName}}!",
    description: "Sent immediately after signup",
    category: "onboarding",
    variables: ["firstName"],
    content: `{{firstName}},

Welcome to Pathible! I'm so glad you're here.

You just took the first step toward something most people never do: **intentionally preserving your legacy for the people you love.**

That's a big deal.

**Here's what I recommend you do first:**

1. **Upload one important document** — Start with something simple, like your will or a key insurance policy.
2. **Write a short note** — Even just a few sentences to someone you care about.
3. **Add one key contact** — Someone your family should know how to reach.

You don't have to do everything today. Legacy is built one small step at a time.

[button: Get started now]({{dashboardUrl}})

If you have any questions along the way, just reply to this email. I read every one.

Welcome to the family,

**Jim Gibbs**
Founder`,
  },
  {
    name: "Getting Started Guide",
    subject: "Your first week with Pathible",
    description: "Sent 1 day after signup with getting started tips",
    category: "onboarding",
    variables: ["firstName"],
    content: `Hi {{firstName}},

Now that you've had a day to look around, I wanted to share a simple roadmap for your first week with Pathible.

**Day 1-2: The Essentials**
- Upload your most critical documents (will, power of attorney, insurance)
- Add emergency contacts your family should know

**Day 3-4: Add Context**
- Write notes explaining why each document matters
- Start a letter to someone you love

**Day 5-7: Build Momentum**
- Record a life story or memory
- Document one of your core beliefs

**Remember:** There's no "right" way to do this. Start wherever feels natural.

[button: Continue building your legacy]({{dashboardUrl}})

You've got this,

**Jim Gibbs**
Founder`,
  },
];

// ============================================================================
// ALL TEMPLATES
// ============================================================================

export const ALL_EMAIL_TEMPLATES: EmailTemplateContent[] = [
  ...ONBOARDING_TEMPLATES,
  ...RETARGETING_TEMPLATES,
  ...ANNOUNCEMENT_TEMPLATES,
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: EmailTemplateContent["category"],
): EmailTemplateContent[] {
  return ALL_EMAIL_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get a template by name
 */
export function getTemplateByName(name: string): EmailTemplateContent | undefined {
  return ALL_EMAIL_TEMPLATES.find((t) => t.name === name);
}
