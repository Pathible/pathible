import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Demo Account Seed Script
 *
 * Creates a pre-populated household for demo purposes (e.g., CFR partnership pitch).
 * Includes family members, wisdom entries, core beliefs, and financial data.
 *
 * Usage:
 *   npx convex run seeds/seedDemoAccount:seed \
 *     --args '{"clerkUserId": "user_xxx"}'
 *
 * The seed defaults to "David Harrison" to match the Harrison family narrative.
 * Override with firstName/lastName/email args if needed.
 *
 * To clean up:
 *   npx convex run seeds/seedDemoAccount:cleanup --args '{"confirmDelete": true}'
 *
 * See docs/DEMO_ACCOUNT_SETUP.md for the full walkthrough.
 */

// ============================================================================
// DEMO CONTENT
// ============================================================================

const DEMO_WISDOM_ENTRIES = [
  {
    title: "Generosity as a Way of Life",
    category: "values" as const,
    content: `*"One person gives freely, yet gains even more; another withholds unduly, but comes to poverty."* — Proverbs 11:25

When Sarah and I were first married, we had almost nothing. We were living in a one-bedroom apartment, driving a car that broke down every other month, and eating rice and beans more nights than I care to admit.

But we tithed. Every single paycheck. It didn't make sense on paper, but it made sense in our hearts.

What I didn't expect was how that small act of faithfulness would shape our entire family's relationship with money. Our kids grew up watching us give — not because we had plenty, but because we believed it was the right thing to do.

Now our daughter volunteers at the food bank every Saturday. Our son set up a giving fund in college. They didn't learn generosity from a sermon — they learned it from watching us write checks we weren't sure we could cover.

**What I want my grandchildren to know:** Generosity isn't about the amount. It's about the posture of your heart. Give first, trust God with the rest. It's worked for us for 35 years, and I believe it will work for you too.

*"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."* — 2 Corinthians 9:7`,
    tags: ["faith", "money", "generosity", "family-values"],
    isPublished: true,
    sharedWith: "household" as const,
  },
  {
    title: "Our Family Sabbath Practice",
    category: "traditions" as const,
    content: `Every Sunday afternoon, after church, we unplug. No phones at the table. No screens until evening. Just us.

It started when the kids were small — honestly, out of desperation more than theology. Sarah and I were both working full-time, and Sundays were the only day we could all breathe together.

Here's what our Sabbath looks like:

**After church:** We come home and make a big lunch together. Nothing fancy — sometimes it's just sandwiches and soup. The point is we make it together.

**After lunch:** We go outside. Walk the neighborhood, ride bikes, sit on the porch. In winter, we play board games or read together.

**Late afternoon:** Sarah and I take a nap (the real reason we started this tradition, if I'm honest). The kids read or play quietly.

**Evening:** We share one thing we're grateful for from the week. One thing we're worried about. One thing we're praying for. Then we eat leftovers and watch something together.

**Why this matters:** In a world that never stops moving, our family has a rhythm. The kids know that no matter how crazy the week gets, Sunday afternoon is sacred. Not in a legalistic way — in a "this is when we remember who we are" way.

Now that our oldest is in college, she calls home every Sunday afternoon. She didn't have to be told. The rhythm is in her bones.

**My advice to young families:** You don't need a perfect Sabbath formula. You just need one day where you say "this time belongs to us and to God." Start small. Stay consistent. Watch what happens over 10, 20, 30 years.`,
    tags: ["sabbath", "family-time", "traditions", "rest"],
    isPublished: true,
    sharedWith: "household" as const,
  },
  {
    title: "What Losing Everything Taught Me About Trust",
    category: "lessons" as const,
    content: `In 2008, I lost my job, a significant portion of our retirement savings, and — for a few terrifying months — almost lost our home.

I'm not sharing this for sympathy. I'm sharing it because it was the most important spiritual education of my life, and I don't want my children or grandchildren to have to learn it the hard way.

**Lesson 1: Your identity is not your income.**

When I lost my job, I didn't just lose a paycheck. I lost my sense of self. I had been "the provider" for 20 years. Suddenly I was the guy sending out resumes and getting rejected. It took me months to realize that my worth wasn't tied to my W-2.

*"Are not five sparrows sold for two pennies? Yet not one of them is forgotten by God. Indeed, the very hairs of your head are all numbered. Don't be afraid; you are worth more than many sparrows."* — Luke 12:6-7

**Lesson 2: Community carries you when you can't carry yourself.**

Our church small group brought us meals for three months. Our neighbor, who I'd only waved to in passing, helped me fix our furnace for free. People showed up in ways I never expected — and never would have allowed if I hadn't been forced to accept help.

**Lesson 3: God's provision doesn't always look like what you expected.**

I prayed for my old job back. God gave me a completely different career that I love more. I prayed for our retirement account to recover. Instead, God taught me that security comes from Him, not from a number on a screen.

**Lesson 4: Hard seasons are temporary. The faith forged in them is permanent.**

We came out of 2008 with less money and more faith. Less pride and more gratitude. Less self-reliance and more God-reliance.

**To my grandchildren:** You will face hard seasons. The economy will stumble. Plans will fall apart. People will let you down. When that happens, remember: your grandfather went through it too. And God was faithful. Every single time.

*"Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance."* — James 1:2-3`,
    tags: ["faith", "adversity", "trust", "provision"],
    isPublished: true,
    sharedWith: "household" as const,
  },
];

const DEMO_CORE_BELIEFS = [
  {
    statement: "Faith Guides Our Finances",
    reflection:
      "We believe that everything we have belongs to God. We are stewards, not owners. This means we give generously, save wisely, spend carefully, and plan intentionally — because how we handle money reflects what we believe about God.",
    category: "faith" as const,
    orderIndex: 0,
  },
  {
    statement: "Family Is Our Greatest Investment",
    reflection:
      "No career achievement, financial milestone, or personal accomplishment matters more than the health and strength of our family. We invest time, energy, and intentionality into our relationships above everything else.",
    category: "family" as const,
    orderIndex: 1,
  },
];

const DEMO_FAMILY_MEMBERS = [
  {
    firstName: "Sarah",
    lastName: "Harrison",
    relationshipType: "spouse" as const,
    roles: ["Family Admin"],
    status: "active" as const,
    orderIndex: 1,
  },
  {
    firstName: "Michael",
    lastName: "Harrison",
    relationshipType: "child" as const,
    roles: ["Family Member"],
    status: "active" as const,
    orderIndex: 2,
  },
  {
    firstName: "Rebecca",
    lastName: "Harrison",
    relationshipType: "child" as const,
    roles: ["Family Member"],
    status: "active" as const,
    orderIndex: 3,
  },
];

const DEMO_FINANCIAL_ACCOUNTS = [
  {
    name: "Family Savings",
    type: "savings" as const,
    institution: "First National Bank",
    balance: 45000,
    currency: "USD",
  },
  {
    name: "Retirement Fund (401k)",
    type: "retirement" as const,
    institution: "Fidelity Investments",
    balance: 285000,
    currency: "USD",
  },
];

// ============================================================================
// SEED MUTATION
// ============================================================================

export const seed = internalMutation({
  args: {
    // Clerk user ID — copy from Clerk Dashboard → Users → click user → "User ID"
    // This is the only thing you need. The seed creates everything else.
    clerkUserId: v.string(),
    // Optional: customize the demo user's name (defaults to "David Harrison")
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.object({
    profileId: v.id("profiles"),
    householdId: v.id("households"),
    familyUnitId: v.id("familyUnits"),
    created: v.object({
      profile: v.boolean(),
      household: v.number(),
      familyMembers: v.number(),
      wisdomEntries: v.number(),
      coreBeliefs: v.number(),
      financialAccounts: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    let createdProfile = false;

    // 0. Find or create the profile for this Clerk user
    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.clerkUserId))
      .unique();

    if (!profile) {
      // Create the profile — this is what onboarding step 1 normally does
      const profileId = await ctx.db.insert("profiles", {
        userId: args.clerkUserId,
        email: args.email,
        firstName: args.firstName ?? "David",
        lastName: args.lastName ?? "Harrison",
        onboardingStatus: "complete",
        onboardingStep: 3,
        onboardingCompletedAt: now,
        updatedAt: now,
      });
      profile = await ctx.db.get(profileId);
      if (!profile) throw new Error("Failed to create profile");
      createdProfile = true;
    } else {
      // Profile exists — just mark it as fully onboarded
      await ctx.db.patch(profile._id, {
        onboardingStatus: "complete" as const,
        onboardingStep: 3,
        onboardingCompletedAt: now,
        updatedAt: now,
      });
    }

    // Check for existing household (don't create duplicates)
    const existingMembership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    if (existingMembership) {
      throw new Error(
        "This user already has a household. Run cleanup first, or use a different Clerk user.",
      );
    }

    // 1. Create demo household
    const householdId = await ctx.db.insert("households", {
      name: "The Harrison Family",
      description: "A faithful family building a legacy that matters",
      primaryContactId: profile._id,
      subscriptionTier: "heritage",
      subscriptionStatus: "active",
      storageUsedBytes: 0,
      memberCount: 0,
      familyUnitCount: 0,
      referralSource: "cfr-demo",
      tierOverride: "legacy",
      tierOverrideReason: "Demo account for CFR partnership",
      updatedAt: now,
    });

    // 2. Create membership
    await ctx.db.insert("householdMemberships", {
      householdId,
      userId: profile._id,
      role: "owner",
      status: "active",
      joinedAt: now,
    });

    // 3. Create primary family unit
    const familyUnitId = await ctx.db.insert("familyUnits", {
      householdId,
      name: "The Harrisons",
      description: "Our immediate family",
      relationshipToHousehold: "Primary",
      isPrimary: true,
      orderIndex: 0,
      createdBy: profile._id,
      updatedAt: now,
    });

    // 4. Add the demo user as primary member
    await ctx.db.insert("familyMembers", {
      familyUnitId,
      householdId,
      profileId: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      relationshipType: "parent",
      roles: ["Family Admin"],
      status: "active",
      orderIndex: 0,
      createdBy: profile._id,
      updatedAt: now,
    });

    // 5. Add family members
    let familyMembersCreated = 0;
    for (const member of DEMO_FAMILY_MEMBERS) {
      await ctx.db.insert("familyMembers", {
        familyUnitId,
        householdId,
        firstName: member.firstName,
        lastName: member.lastName,
        relationshipType: member.relationshipType,
        roles: member.roles,
        status: member.status,
        orderIndex: member.orderIndex,
        createdBy: profile._id,
        updatedAt: now,
      });
      familyMembersCreated++;
    }

    // 6. Create wisdom entries
    let wisdomCreated = 0;
    for (const entry of DEMO_WISDOM_ENTRIES) {
      await ctx.db.insert("wisdomEntries", {
        householdId,
        authorId: profile._id,
        title: entry.title,
        content: entry.content,
        category: entry.category,
        tags: entry.tags,
        isPublished: entry.isPublished,
        sharedWith: entry.sharedWith,
        mediaStorageIds: [],
        updatedAt: now,
      });
      wisdomCreated++;
    }

    // 7. Create core beliefs
    let beliefsCreated = 0;
    for (const belief of DEMO_CORE_BELIEFS) {
      await ctx.db.insert("coreBeliefs", {
        householdId,
        statement: belief.statement,
        reflection: belief.reflection,
        category: belief.category,
        orderIndex: belief.orderIndex,
        createdBy: profile._id,
        updatedAt: now,
      });
      beliefsCreated++;
    }

    // 8. Create financial accounts
    let accountsCreated = 0;
    for (const account of DEMO_FINANCIAL_ACCOUNTS) {
      await ctx.db.insert("financialAccounts", {
        householdId,
        name: account.name,
        type: account.type,
        institution: account.institution,
        balance: account.balance,
        currency: account.currency,
        lastUpdated: now,
        updatedAt: now,
      });
      accountsCreated++;
    }

    // Update household counters
    await ctx.db.patch(householdId, {
      memberCount: familyMembersCreated,
      familyUnitCount: 1,
      updatedAt: now,
    });

    // Create user preferences (normally created during onboarding step 3)
    await ctx.db.insert("userPreferences", {
      profileId: profile._id,
      goals: ["legacy_planning", "family_heritage", "financial_clarity"],
      emailNotifications: true,
      interestedFeatures: [],
      shareDataWithHousehold: true,
      updatedAt: now,
    });

    return {
      profileId: profile._id,
      householdId,
      familyUnitId,
      created: {
        profile: createdProfile,
        household: 1,
        familyMembers: familyMembersCreated,
        wisdomEntries: wisdomCreated,
        coreBeliefs: beliefsCreated,
        financialAccounts: accountsCreated,
      },
    };
  },
});

// ============================================================================
// CLEANUP MUTATION
// ============================================================================

export const cleanup = internalMutation({
  args: {
    confirmDelete: v.boolean(),
  },
  returns: v.object({
    deleted: v.object({
      households: v.number(),
      memberships: v.number(),
      familyUnits: v.number(),
      familyMembers: v.number(),
      wisdomEntries: v.number(),
      coreBeliefs: v.number(),
      financialAccounts: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmDelete) {
      throw new Error("Must set confirmDelete: true to proceed");
    }

    const deleted = {
      households: 0,
      memberships: 0,
      familyUnits: 0,
      familyMembers: 0,
      wisdomEntries: 0,
      coreBeliefs: 0,
      financialAccounts: 0,
    };

    // Find demo households by referral source
    const demoHouseholds = await ctx.db
      .query("households")
      .withIndex("by_referralSource", (q) => q.eq("referralSource", "cfr-demo"))
      .collect();

    for (const household of demoHouseholds) {
      // Delete wisdom entries
      const wisdom = await ctx.db
        .query("wisdomEntries")
        .withIndex("by_household_and_category", (q) => q.eq("householdId", household._id))
        .collect();
      for (const entry of wisdom) {
        await ctx.db.delete(entry._id);
        deleted.wisdomEntries++;
      }

      // Delete core beliefs
      const beliefs = await ctx.db
        .query("coreBeliefs")
        .withIndex("by_household_and_orderIndex", (q) => q.eq("householdId", household._id))
        .collect();
      for (const belief of beliefs) {
        await ctx.db.delete(belief._id);
        deleted.coreBeliefs++;
      }

      // Delete financial accounts
      const accounts = await ctx.db
        .query("financialAccounts")
        .withIndex("by_household", (q) => q.eq("householdId", household._id))
        .collect();
      for (const account of accounts) {
        await ctx.db.delete(account._id);
        deleted.financialAccounts++;
      }

      // Delete family members
      const members = await ctx.db
        .query("familyMembers")
        .withIndex("by_household_and_status", (q) => q.eq("householdId", household._id))
        .collect();
      for (const member of members) {
        await ctx.db.delete(member._id);
        deleted.familyMembers++;
      }

      // Delete family units
      const units = await ctx.db
        .query("familyUnits")
        .withIndex("by_household_and_orderIndex", (q) => q.eq("householdId", household._id))
        .collect();
      for (const unit of units) {
        await ctx.db.delete(unit._id);
        deleted.familyUnits++;
      }

      // Delete memberships and reset associated profiles
      const memberships = await ctx.db
        .query("householdMemberships")
        .withIndex("by_household_and_status", (q) => q.eq("householdId", household._id))
        .collect();
      for (const membership of memberships) {
        // Reset the profile's onboarding status
        const profile = await ctx.db.get(membership.userId);
        if (profile?.onboardingCompletedAt) {
          await ctx.db.patch(membership.userId, {
            onboardingStatus: "not_started" as const,
            onboardingStep: undefined,
            onboardingCompletedAt: undefined,
            updatedAt: Date.now(),
          });
        }

        // Delete user preferences created by the seed
        const prefs = await ctx.db
          .query("userPreferences")
          .withIndex("by_profile", (q) => q.eq("profileId", membership.userId))
          .first();
        if (prefs) {
          await ctx.db.delete(prefs._id);
        }

        await ctx.db.delete(membership._id);
        deleted.memberships++;
      }

      // Delete household
      await ctx.db.delete(household._id);
      deleted.households++;
    }

    return { deleted };
  },
});
