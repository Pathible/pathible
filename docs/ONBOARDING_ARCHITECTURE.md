# Onboarding Architecture Design

## Overview

This document outlines the backend architecture for the 4-step onboarding wizard using Convex and Better Auth. The onboarding flow collects essential user and household information immediately after authentication.

## Onboarding Flow Steps

1. **User Profile** - Complete personal information (firstName, lastName, dateOfBirth, phone, avatarUrl)
2. **First Household** - Create initial household (name, role, description)
3. **Goals & Preferences** - Set user goals and preferences
4. **Family Invitations** - Send invitations to family members

## Architecture Decisions

### 1. Data Persistence Strategy

**Decision: Step-by-Step Persistence with State Tracking**

Each step saves data immediately upon completion rather than collecting all data and saving at the end.

**Rationale:**
- **Resilience**: Users can leave and return without losing progress
- **Data Integrity**: Each step's data is validated and persisted atomically
- **User Experience**: Users see immediate confirmation of saved data
- **Error Recovery**: Easier to handle errors per-step vs. one massive transaction

**Trade-offs:**
- Slightly more database writes
- Need to handle partial completion states
- Potential for orphaned data if user abandons mid-flow

### 2. Completion Tracking

**Implementation: Add `onboardingStatus` field to profiles table**

```typescript
// Schema addition to profiles table
onboardingStatus: v.union(
  v.literal("not_started"),
  v.literal("profile_complete"),
  v.literal("household_complete"),
  v.literal("preferences_complete"),
  v.literal("complete")
),
onboardingStep: v.optional(v.number()), // 1-4, current step
```

**Rationale:**
- Single source of truth for onboarding state
- Easy to query and display progress
- Can redirect users to correct step on return
- Simple state machine with clear transitions

### 3. Household Creation Flow

**Decision: Auto-create membership record with "owner" role**

When a user creates their first household during onboarding:
1. Create household with user as primaryContactId
2. Automatically create householdMembership with role="owner", status="active"
3. Set relationship to "self" or null (optional)

**Rationale:**
- Ensures data consistency (household creator is always a member)
- No additional client-side calls needed
- Follows principle of least surprise
- Matches real-world expectation (creator owns household)

### 4. Invitation Strategy

**Decision: Queue invitations, send asynchronously**

Invitations are:
1. Created in database with status="pending"
2. Sent via background action (Convex scheduled function)
3. Include expiration time (default: 7 days)

**Rationale:**
- **Non-blocking**: Onboarding completes immediately, email failures don't block
- **Retryable**: Failed sends can be retried via scheduled jobs
- **Testable**: Easy to test invitation logic without sending emails
- **Scalable**: Can batch email sends for large invite lists

**Trade-offs:**
- Slight delay before email arrives (acceptable for async nature)
- Need to handle email failures gracefully
- Requires background job infrastructure

### 5. Error Handling Strategy

**Decision: Transaction-per-step with rollback capabilities**

Each step is a separate mutation with:
- Input validation at mutation boundary
- Atomic database operations within step
- Descriptive error messages returned to client
- No cascade failures between steps

**Rollback Strategy:**
- Step 1 (Profile): Already has existing `profiles.create` mutation
- Step 2 (Household): If household creation fails, no cleanup needed (profile exists)
- Step 3 (Preferences): Stored in separate table, no cleanup needed
- Step 4 (Invitations): Failed invitations remain in DB with status="failed" for retry

**Rationale:**
- Each step is independent and recoverable
- Clear error boundaries for debugging
- Users can retry failed steps without re-entering data
- Audit trail of all attempts via status fields

## Data Flow Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ Step 1: Update Profile
       ├──────────────────────┐
       │                      ▼
       │              ┌───────────────┐
       │              │ profiles.     │
       │              │ updateProfile │
       │              └───────┬───────┘
       │                      │
       │                      ▼
       │              Update profiles table
       │              Set onboardingStep = 1
       │
       │ Step 2: Create Household
       ├──────────────────────┐
       │                      ▼
       │              ┌───────────────┐
       │              │ onboarding.   │
       │              │ createFirst   │
       │              │ Household     │
       │              └───────┬───────┘
       │                      │
       │                      ▼
       │              1. Create household
       │              2. Create membership (owner)
       │              3. Update profile:
       │                 onboardingStep = 2
       │
       │ Step 3: Set Preferences
       ├──────────────────────┐
       │                      ▼
       │              ┌───────────────┐
       │              │ onboarding.   │
       │              │ setPreferences│
       │              └───────┬───────┘
       │                      │
       │                      ▼
       │              Create userPreferences
       │              Update profile:
       │              onboardingStep = 3
       │
       │ Step 4: Send Invitations
       ├──────────────────────┐
       │                      ▼
       │              ┌───────────────┐
       │              │ onboarding.   │
       │              │ sendInvitations│
       │              └───────┬───────┘
       │                      │
       │                      ▼
       │              1. Create invitations
       │              2. Schedule sendEmail actions
       │              3. Update profile:
       │                 onboardingStatus = "complete"
       │
       │ Complete Onboarding
       ├──────────────────────┐
       │                      ▼
       │              ┌───────────────┐
       │              │ onboarding.   │
       │              │ complete      │
       │              └───────┬───────┘
       │                      │
       │                      ▼
       │              Mark onboarding complete
       │              Return success
       │
       ▼
┌──────────────┐
│  Dashboard   │
└──────────────┘
```

## Schema Updates

### 1. Profiles Table

Add onboarding tracking fields:

```typescript
profiles: defineTable({
  // ... existing fields ...
  onboardingStatus: v.optional(
    v.union(
      v.literal("not_started"),
      v.literal("profile_complete"),
      v.literal("household_complete"),
      v.literal("preferences_complete"),
      v.literal("complete")
    )
  ),
  onboardingStep: v.optional(v.number()), // 1-4
  onboardingCompletedAt: v.optional(v.number()), // Unix timestamp
})
```

**Migration Notes:**
- Existing profiles without these fields will default to `undefined`
- Can backfill with "complete" for existing users
- New users will have "not_started" set on profile creation

### 2. User Preferences Table (New)

Create new table for user goals and preferences:

```typescript
userPreferences: defineTable({
  profileId: v.id("profiles"),

  // Primary goals (multi-select)
  goals: v.array(
    v.union(
      v.literal("document_organization"),
      v.literal("legacy_planning"),
      v.literal("family_heritage"),
      v.literal("financial_clarity"),
      v.literal("estate_planning"),
      v.literal("end_of_life_planning")
    )
  ),

  // Communication preferences
  emailNotifications: v.boolean(),
  smsNotifications: v.optional(v.boolean()),

  // Feature interests
  interestedFeatures: v.array(v.string()), // e.g., ["vault", "wisdom", "letters"]

  // Privacy settings
  shareDataWithHousehold: v.boolean(), // Default true

  updatedAt: v.number(),
})
  .index("by_profile", ["profileId"])
```

**Rationale:**
- Separate table for preferences allows flexible schema evolution
- Goals inform which features to highlight in onboarding
- Communication preferences control notification delivery
- Privacy settings enable granular control

### 3. Household Invitations

No schema changes needed - existing table supports the flow:

```typescript
householdInvitations: defineTable({
  householdId: v.id("households"),
  email: v.string(),
  invitedBy: v.id("profiles"),
  relationship: v.optional(v.string()),
  role: v.union(
    v.literal("steward"),
    v.literal("viewer"),
    v.literal("executor")
  ),
  token: v.string(), // Unique invitation token
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("expired")
  ),
  expiresAt: v.number(), // Unix timestamp
})
```

**Additional Status:**
Consider adding `v.literal("failed")` for email send failures.

## API Design

### Queries

#### `onboarding/getStatus.ts`
```typescript
export const getStatus = query({
  args: {},
  returns: v.object({
    status: v.union(
      v.literal("not_started"),
      v.literal("profile_complete"),
      v.literal("household_complete"),
      v.literal("preferences_complete"),
      v.literal("complete")
    ),
    currentStep: v.number(),
    profile: v.object({
      firstName: v.string(),
      lastName: v.string(),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.number()),
      avatarUrl: v.optional(v.string()),
    }),
    household: v.optional(v.object({
      id: v.id("households"),
      name: v.string(),
    })),
  }),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    // Get household if exists
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    let household = null;
    if (membership) {
      const h = await ctx.db.get(membership.householdId);
      if (h) {
        household = { id: h._id, name: h.name };
      }
    }

    return {
      status: profile.onboardingStatus || "not_started",
      currentStep: profile.onboardingStep || 1,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        avatarUrl: profile.avatarUrl,
      },
      household,
    };
  },
});
```

**Purpose:** Get current onboarding state and pre-fill form data if user returns.

### Mutations

#### `onboarding/updateProfile.ts`
```typescript
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Validate inputs
    if (args.firstName !== undefined && !args.firstName.trim()) {
      throw new Error("First name cannot be empty");
    }
    if (args.lastName !== undefined && !args.lastName.trim()) {
      throw new Error("Last name cannot be empty");
    }
    if (args.dateOfBirth && args.dateOfBirth > Date.now()) {
      throw new Error("Date of birth cannot be in the future");
    }
    if (args.phone && !/^\+?[\d\s\-()]+$/.test(args.phone)) {
      throw new Error("Invalid phone number format");
    }

    // Build update object
    const updates: any = {
      updatedAt: Date.now(),
      onboardingStatus: "profile_complete",
      onboardingStep: 2,
    };

    if (args.firstName !== undefined) updates.firstName = args.firstName.trim();
    if (args.lastName !== undefined) updates.lastName = args.lastName.trim();
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(profile._id, updates);

    return null;
  },
});
```

#### `onboarding/createFirstHousehold.ts`
```typescript
export const createFirstHousehold = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("households"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Validate
    if (!args.name.trim()) {
      throw new Error("Household name is required");
    }
    if (args.name.length > 100) {
      throw new Error("Household name is too long (max 100 characters)");
    }

    // Check if user already has a household (prevent duplicates during onboarding)
    const existingMembership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    if (existingMembership) {
      throw new Error("You already belong to a household");
    }

    // Create household
    const householdId = await ctx.db.insert("households", {
      name: args.name.trim(),
      description: args.description?.trim(),
      primaryContactId: profile._id,
      subscriptionTier: "foundations", // Default tier
      subscriptionStatus: "active", // Start with free tier active
      updatedAt: Date.now(),
    });

    // Create membership (owner role)
    await ctx.db.insert("householdMemberships", {
      householdId,
      userId: profile._id,
      role: "owner",
      status: "active",
      joinedAt: Date.now(),
    });

    // Update profile onboarding status
    await ctx.db.patch(profile._id, {
      onboardingStatus: "household_complete",
      onboardingStep: 3,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId,
      userId: profile._id,
      actionType: "other",
      description: `Created household "${args.name.trim()}"`,
    });

    return householdId;
  },
});
```

#### `onboarding/setPreferences.ts`
```typescript
export const setPreferences = mutation({
  args: {
    goals: v.array(
      v.union(
        v.literal("document_organization"),
        v.literal("legacy_planning"),
        v.literal("family_heritage"),
        v.literal("financial_clarity"),
        v.literal("estate_planning"),
        v.literal("end_of_life_planning")
      )
    ),
    emailNotifications: v.boolean(),
    interestedFeatures: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Validate
    if (args.goals.length === 0) {
      throw new Error("Please select at least one goal");
    }
    if (args.goals.length > 6) {
      throw new Error("Please select no more than 6 goals");
    }

    // Check if preferences already exist (in case of retry)
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        goals: args.goals,
        emailNotifications: args.emailNotifications,
        interestedFeatures: args.interestedFeatures,
        updatedAt: Date.now(),
      });
    } else {
      // Create new
      await ctx.db.insert("userPreferences", {
        profileId: profile._id,
        goals: args.goals,
        emailNotifications: args.emailNotifications,
        interestedFeatures: args.interestedFeatures,
        shareDataWithHousehold: true, // Default
        updatedAt: Date.now(),
      });
    }

    // Update profile onboarding status
    await ctx.db.patch(profile._id, {
      onboardingStatus: "preferences_complete",
      onboardingStep: 4,
      updatedAt: Date.now(),
    });

    return null;
  },
});
```

#### `onboarding/sendInvitations.ts`
```typescript
export const sendInvitations = mutation({
  args: {
    invitations: v.array(
      v.object({
        email: v.string(),
        relationship: v.optional(v.string()),
        role: v.union(
          v.literal("steward"),
          v.literal("viewer"),
          v.literal("executor")
        ),
      })
    ),
  },
  returns: v.object({
    sent: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Get user's household (must have one from step 2)
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    if (!membership) {
      throw new Error("No household found. Please complete household setup first.");
    }

    const household = await ctx.db.get(membership.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Validate invitations
    if (args.invitations.length === 0) {
      // Allow skipping invitations
      await ctx.db.patch(profile._id, {
        onboardingStatus: "complete",
        onboardingCompletedAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { sent: 0, failed: 0 };
    }

    if (args.invitations.length > 10) {
      throw new Error("Cannot send more than 10 invitations at once");
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const inv of args.invitations) {
      if (!emailRegex.test(inv.email)) {
        throw new Error(`Invalid email address: ${inv.email}`);
      }
    }

    let sent = 0;
    let failed = 0;

    // Create invitations
    for (const inv of args.invitations) {
      try {
        // Check if invitation already exists
        const existingInvite = await ctx.db
          .query("householdInvitations")
          .withIndex("by_household", (q) => q.eq("householdId", household._id))
          .filter((q) => q.eq(q.field("email"), inv.email))
          .filter((q) => q.eq(q.field("status"), "pending"))
          .first();

        if (existingInvite) {
          // Skip duplicate
          continue;
        }

        // Generate unique token
        const token = crypto.randomUUID();

        // Create invitation
        const invitationId = await ctx.db.insert("householdInvitations", {
          householdId: household._id,
          email: inv.email.toLowerCase(),
          invitedBy: profile._id,
          relationship: inv.relationship,
          role: inv.role,
          token,
          status: "pending",
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        });

        // Schedule email sending (non-blocking)
        await ctx.scheduler.runAfter(0, internal.onboarding.sendInvitationEmail, {
          invitationId,
        });

        sent++;

      } catch (error) {
        console.error(`Failed to send invitation to ${inv.email}:`, error);
        failed++;
      }
    }

    // Mark onboarding complete
    await ctx.db.patch(profile._id, {
      onboardingStatus: "complete",
      onboardingCompletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      householdId: household._id,
      userId: profile._id,
      actionType: "member_invited",
      description: `Invited ${sent} family member(s) to household`,
    });

    return { sent, failed };
  },
});
```

#### `onboarding/skipInvitations.ts`
```typescript
export const skipInvitations = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    // Mark onboarding complete without sending invitations
    await ctx.db.patch(profile._id, {
      onboardingStatus: "complete",
      onboardingCompletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return null;
  },
});
```

### Internal Actions

#### `onboarding/sendInvitationEmail.ts`
```typescript
"use node";

export const sendInvitationEmail = internalAction({
  args: {
    invitationId: v.id("householdInvitations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get invitation details
    const invitation = await ctx.runQuery(internal.onboarding.getInvitationDetails, {
      invitationId: args.invitationId,
    });

    if (!invitation) {
      console.error(`Invitation ${args.invitationId} not found`);
      return null;
    }

    // Send email via Resend (or log in dev mode)
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const inviteUrl = `${process.env.SITE_URL}/invite/${invitation.token}`;

        await resend.emails.send({
          from: `${process.env.EMAIL_FROM_NAME || "Pathible"} <${process.env.EMAIL_FROM_ADDRESS}>`,
          to: invitation.email,
          subject: `You've been invited to join ${invitation.householdName} on Pathible`,
          html: `
            <h1>You've been invited!</h1>
            <p>${invitation.inviterName} has invited you to join their household "${invitation.householdName}" on Pathible.</p>
            <p><a href="${inviteUrl}">Click here to accept the invitation</a></p>
            <p>This invitation expires on ${new Date(invitation.expiresAt).toLocaleDateString()}.</p>
          `,
        });

        console.log(`Invitation email sent to ${invitation.email}`);
      } else {
        console.log(`[DEV MODE] Invitation email for ${invitation.email}:`);
        console.log(`  Household: ${invitation.householdName}`);
        console.log(`  Inviter: ${invitation.inviterName}`);
        console.log(`  Token: ${invitation.token}`);
        console.log(`  URL: ${process.env.SITE_URL}/invite/${invitation.token}`);
      }

    } catch (error) {
      console.error(`Failed to send invitation email:`, error);

      // Update invitation status to failed
      await ctx.runMutation(internal.onboarding.markInvitationFailed, {
        invitationId: args.invitationId,
      });
    }

    return null;
  },
});
```

#### Helper Queries/Mutations

```typescript
// Get invitation details for email
export const getInvitationDetails = internalQuery({
  args: { invitationId: v.id("householdInvitations") },
  returns: v.union(
    v.object({
      email: v.string(),
      token: v.string(),
      householdName: v.string(),
      inviterName: v.string(),
      expiresAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) return null;

    const household = await ctx.db.get(invitation.householdId);
    const inviter = await ctx.db.get(invitation.invitedBy);

    if (!household || !inviter) return null;

    return {
      email: invitation.email,
      token: invitation.token,
      householdName: household.name,
      inviterName: `${inviter.firstName} ${inviter.lastName}`,
      expiresAt: invitation.expiresAt,
    };
  },
});

// Mark invitation as failed
export const markInvitationFailed = internalMutation({
  args: { invitationId: v.id("householdInvitations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, {
      status: "failed" as any, // Add to schema first
    });
    return null;
  },
});
```

## Security Considerations

### 1. Authentication & Authorization

**Profile Updates:**
- User can only update their own profile
- `requireAuth()` ensures user is authenticated
- Profile ID comes from auth context, not client input

**Household Creation:**
- One household per user during onboarding (prevent abuse)
- Creator automatically becomes owner
- Household name length validation (prevent DOS)

**Invitations:**
- Max 10 invitations per request (prevent spam)
- Email validation (prevent invalid/malicious emails)
- Duplicate invitation check (prevent spam)
- Token is cryptographically random UUID

### 2. Input Validation

**All mutations validate:**
- Required fields are present and non-empty
- String lengths are reasonable (DOS prevention)
- Email format is valid
- Dates are in valid ranges
- Enums match allowed values

**Example validations:**
```typescript
// Name validation
if (!name.trim()) throw new Error("Name is required");
if (name.length > 100) throw new Error("Name too long");

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) throw new Error("Invalid email");

// Date validation
if (dateOfBirth > Date.now()) throw new Error("Date cannot be in future");
```

### 3. Rate Limiting

**Recommendations:**
- Limit profile updates to 10/minute per user
- Limit household creation to 1 per user (enforced in mutation)
- Limit invitations to 10 per request, 50/day per user
- Use Convex rate limiting or implement custom throttling

**Implementation (future):**
```typescript
// Track rate limits in separate table
rateLimits: defineTable({
  userId: v.id("profiles"),
  action: v.string(), // "send_invitations", etc.
  count: v.number(),
  windowStart: v.number(), // Unix timestamp
}).index("by_user_and_action", ["userId", "action"])
```

### 4. Data Privacy

**Profile Data:**
- User controls their own profile data
- Other users only see public fields (via `profiles.getById`)
- Sensitive fields (phone, dateOfBirth) are optional and private

**Household Data:**
- Only household members can see household details
- Invitations don't expose household data to non-members
- Invitation tokens are single-use and expire

**Email Handling:**
- Emails are stored lowercase for consistency
- No email validation beyond format (avoid enumeration attacks)
- Failed sends don't expose whether email exists

### 5. Error Messages

**Security-conscious error handling:**

**Good (safe):**
```typescript
throw new Error("Invalid credentials");
throw new Error("Household not found");
throw new Error("You don't have permission to perform this action");
```

**Bad (leaks info):**
```typescript
throw new Error("Email already registered"); // Email enumeration
throw new Error("User 'john@example.com' not found"); // Leaks data
```

## Error Handling

### Client-Side Handling

**Pattern:**
```typescript
try {
  await updateProfileMutation({ ... });
  toast.success("Profile updated!");
  router.push("/onboarding/household");
} catch (error) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("Something went wrong. Please try again.");
  }
  // Don't block - let user retry
}
```

**Key Principles:**
- Display user-friendly error messages
- Allow retry without page reload
- Log errors for debugging
- Don't expose sensitive details

### Server-Side Handling

**Pattern:**
```typescript
export const someMutation = mutation({
  args: { ... },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 1. Authentication check
    const { profile } = await requireAuth(ctx);
    // Throws if not authenticated

    // 2. Input validation
    if (!args.name.trim()) {
      throw new Error("Name is required");
    }

    // 3. Business logic validation
    const existing = await ctx.db.query(...).first();
    if (existing) {
      throw new Error("Already exists");
    }

    // 4. Database operations (atomic)
    try {
      await ctx.db.insert(...);
      await ctx.db.patch(...);
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save. Please try again.");
    }

    return null;
  },
});
```

**Error Categories:**

1. **Validation Errors** (400-level)
   - User input is invalid
   - Return descriptive message
   - User can fix and retry

2. **Authorization Errors** (403-level)
   - User not authenticated or lacks permission
   - Return generic message
   - Log for security monitoring

3. **Not Found Errors** (404-level)
   - Resource doesn't exist
   - Could be legitimate (deleted) or malicious (guessing IDs)
   - Return generic message

4. **Server Errors** (500-level)
   - Database failures, network issues
   - Log full error details
   - Return generic message to user
   - Alert dev team

### Rollback Strategy

**Convex Mutations are Transactional:**
- All operations in a mutation are atomic
- If any operation fails, entire mutation rolls back
- No manual cleanup needed

**Multi-Step Operations:**
```typescript
// This is safe - if any step fails, all rollback
await ctx.db.insert("households", { ... });
await ctx.db.insert("householdMemberships", { ... });
await ctx.db.patch(profile._id, { ... });
// Either all succeed or all fail
```

**Cross-Mutation Cleanup:**
```typescript
// If invitation email fails, invitation remains in DB with status
// Background job can retry failed invitations
// Or admin can manually resend

// Query failed invitations:
export const getFailedInvitations = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("householdInvitations")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();
  },
});
```

## Testing Strategy

### Unit Tests (Convex Functions)

**Test each mutation independently:**

```typescript
// Test profile update
it("should update profile with valid data", async () => {
  const result = await updateProfile({ firstName: "Jane" });
  expect(result).toBeNull();

  const profile = await getProfile();
  expect(profile.firstName).toBe("Jane");
});

it("should reject empty first name", async () => {
  await expect(
    updateProfile({ firstName: "" })
  ).rejects.toThrow("First name cannot be empty");
});
```

**Test household creation:**
```typescript
it("should create household and membership", async () => {
  const householdId = await createFirstHousehold({
    name: "Test Family",
  });

  const household = await getHousehold(householdId);
  expect(household.name).toBe("Test Family");

  const memberships = await getMyMemberships();
  expect(memberships).toHaveLength(1);
  expect(memberships[0].role).toBe("owner");
});

it("should prevent creating second household", async () => {
  await createFirstHousehold({ name: "First" });

  await expect(
    createFirstHousehold({ name: "Second" })
  ).rejects.toThrow("You already belong to a household");
});
```

### Integration Tests (E2E)

**Full onboarding flow:**

```typescript
describe("Onboarding Flow", () => {
  it("should complete full onboarding", async () => {
    // 1. Authenticate
    await login("test@example.com");

    // 2. Complete profile
    await fillProfile({
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
    });
    await clickNext();

    // 3. Create household
    await fillHousehold({
      name: "Doe Family",
      description: "Our family",
    });
    await clickNext();

    // 4. Set preferences
    await selectGoals(["legacy_planning", "family_heritage"]);
    await toggleEmailNotifications(true);
    await clickNext();

    // 5. Send invitations
    await addInvitation({
      email: "jane@example.com",
      role: "steward",
    });
    await clickComplete();

    // 6. Verify redirect to dashboard
    expect(page.url()).toBe("/dashboard");

    // 7. Verify onboarding is marked complete
    const status = await getOnboardingStatus();
    expect(status).toBe("complete");
  });

  it("should allow skipping invitations", async () => {
    // ... steps 1-4 ...

    // 5. Skip invitations
    await clickSkip();

    // Should still complete onboarding
    expect(page.url()).toBe("/dashboard");
  });

  it("should resume incomplete onboarding", async () => {
    // Start onboarding
    await login("test@example.com");
    await fillProfile({ ... });
    await clickNext();

    // Leave mid-flow
    await logout();

    // Return later
    await login("test@example.com");

    // Should resume at household step
    expect(page.url()).toBe("/onboarding/household");

    // Profile data should be preserved
    const status = await getOnboardingStatus();
    expect(status.currentStep).toBe(2);
  });
});
```

### Manual Testing Checklist

**Happy Path:**
- [ ] Complete all 4 steps in order
- [ ] Verify data persists between steps
- [ ] Verify redirect to dashboard on completion
- [ ] Verify invitation emails are sent
- [ ] Verify household membership is created

**Edge Cases:**
- [ ] Skip optional fields (phone, dateOfBirth)
- [ ] Skip invitations step
- [ ] Enter very long household name (should truncate/error)
- [ ] Enter invalid email format
- [ ] Enter date of birth in future (should error)
- [ ] Leave mid-flow and return (should resume)

**Error Handling:**
- [ ] Network error during submission (should show error, allow retry)
- [ ] Submit empty required fields (should validate)
- [ ] Submit invalid data (should show specific error)
- [ ] Email send failure (should complete onboarding, log failure)

**Security:**
- [ ] Cannot access onboarding if already completed
- [ ] Cannot create multiple households during onboarding
- [ ] Cannot send more than 10 invitations
- [ ] Invitation tokens are unique and random
- [ ] Profile updates only affect own profile

## Migration Plan

### Phase 1: Schema Updates

1. Add new fields to `profiles` table
2. Create `userPreferences` table
3. Update `householdInvitations` status enum (add "failed")
4. Deploy schema changes

**Migration Script:**
```typescript
// Backfill existing profiles
export const backfillOnboardingStatus = internalMutation({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();

    for (const profile of profiles) {
      if (!profile.onboardingStatus) {
        await ctx.db.patch(profile._id, {
          onboardingStatus: "complete",
          onboardingCompletedAt: profile._creationTime,
        });
      }
    }
  },
});
```

### Phase 2: Implement Mutations

1. Create `src/convex/onboarding.ts` with all mutations
2. Update `profiles.update` to support onboarding fields
3. Test each mutation independently
4. Deploy mutations

### Phase 3: Frontend Implementation

1. Create onboarding wizard UI components
2. Create `/onboarding` pages for each step
3. Add routing logic (redirect based on onboarding status)
4. Add progress indicator
5. Test full flow

### Phase 4: Email Integration

1. Implement invitation email templates
2. Set up Resend API integration
3. Add email sending action
4. Add retry logic for failed sends
5. Test in development mode (console logs)
6. Test in production (real emails)

### Phase 5: Monitoring & Refinement

1. Add analytics tracking for each step
2. Monitor completion rates per step
3. Monitor error rates
4. Add user feedback mechanism
5. Iterate based on data

## Performance Considerations

### Database Queries

**Optimized Patterns:**

```typescript
// Good: Use index for fast lookup
const membership = await ctx.db
  .query("householdMemberships")
  .withIndex("by_user", (q) => q.eq("userId", profile._id))
  .first(); // Stop after first match

// Bad: Full table scan
const membership = await ctx.db
  .query("householdMemberships")
  .filter((q) => q.eq(q.field("userId"), profile._id))
  .first();
```

**Required Indexes:**
- `profiles.by_userId` (already exists)
- `householdMemberships.by_user` (already exists)
- `householdMemberships.by_household` (already exists)
- `userPreferences.by_profile` (new)
- `householdInvitations.by_household` (already exists)
- `householdInvitations.by_token` (already exists)

### Mutation Performance

**Each mutation should complete in < 500ms:**
- Profile update: ~50ms (1 patch operation)
- Household creation: ~100ms (2 inserts + 1 patch + 1 activity log)
- Preferences: ~50ms (1 insert or patch)
- Invitations: ~100-500ms depending on count (N inserts + N scheduled actions)

**Optimization:**
- Use `first()` instead of `collect()` when possible
- Minimize database reads within mutations
- Use scheduled actions for email sending (non-blocking)
- Batch invitation creation if > 10 emails (future optimization)

### Caching Strategy

**Onboarding Status Query:**
- Frequently called to check if user should see onboarding
- Consider caching in React Query on client side
- TTL: 1 minute (onboarding changes infrequently)

```typescript
// Client-side caching
const { data: onboardingStatus } = useQuery(
  api.onboarding.getStatus,
  {},
  {
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  }
);
```

## Future Enhancements

### 1. Progress Indicators

Add visual progress bar showing completion percentage per step.

### 2. Save & Resume

Allow users to save progress at any point and resume later (already supported by architecture).

### 3. Gamification

Add achievements or badges for completing onboarding sections.

### 4. Personalized Recommendations

Based on goals selected in step 3, show personalized feature recommendations in dashboard.

### 5. Bulk Invitations

Support CSV upload for inviting large families (> 10 members).

### 6. Invitation Templates

Allow users to customize invitation email templates.

### 7. Retry Failed Invitations

Admin UI to view and retry failed invitation sends.

### 8. Onboarding Analytics

Track:
- Completion rate per step
- Average time per step
- Drop-off points
- Error rates

### 9. A/B Testing

Test different onboarding flows to optimize conversion.

### 10. Progressive Profile Completion

Instead of blocking on required fields, allow skipping and prompt later with contextual nudges.

## Conclusion

This architecture provides a robust, scalable, and user-friendly onboarding experience with:

- **Step-by-step persistence** for resilience
- **Clear state tracking** for easy resume
- **Atomic operations** for data consistency
- **Async email sending** for performance
- **Comprehensive validation** for security
- **Detailed error handling** for reliability

The design follows Convex best practices, uses existing schema where possible, and provides clear extension points for future enhancements.

## File Organization

```
src/convex/
├── onboarding.ts          # Main onboarding mutations and queries
├── onboarding/
│   ├── email.ts          # Email sending actions (internal)
│   └── validation.ts     # Shared validation logic
├── profiles.ts           # Updated with onboarding fields
├── households.ts         # New file for household mutations
└── schema.ts             # Updated with new tables and fields
```

**Recommended Implementation Order:**
1. Update `schema.ts` (add fields and tables)
2. Update `profiles.ts` (add onboarding status fields)
3. Create `households.ts` (household creation logic)
4. Create `onboarding.ts` (main onboarding mutations)
5. Create `onboarding/email.ts` (email sending actions)
6. Test each file independently
7. Build frontend wizard
8. End-to-end testing

## Next Steps

1. Review and approve this architecture document
2. Update database schema in `src/convex/schema.ts`
3. Create missing `src/convex/auth.ts` file (for requireAuth helper)
4. Implement mutations in `src/convex/onboarding.ts`
5. Create frontend wizard components
6. Test complete flow
7. Deploy to production

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Author:** Backend Architecture Team
