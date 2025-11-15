# Onboarding Implementation Plan

## Overview

This document provides a step-by-step implementation plan for the 4-step onboarding wizard backend, based on the architecture outlined in `ONBOARDING_ARCHITECTURE.md`.

## Prerequisites

- Review `/Users/jimgibbs/Code/pathible/docs/ONBOARDING_ARCHITECTURE.md`
- Ensure Convex dev server is running (`pnpm dev:backend`)
- Create missing `src/convex/auth.ts` file (see below)

## Implementation Steps

### Step 1: Create Missing Auth Helper File

**File:** `/Users/jimgibbs/Code/pathible/src/convex/auth.ts`

This file is referenced by `profiles.ts`, `roles.ts`, and other files but doesn't exist yet.

**Status:** MISSING - Must be created first

**Dependencies:**
- `@convex-dev/better-auth` package (already installed)
- `better-auth` package (already installed)

### Step 2: Update Schema

**File:** `/Users/jimgibbs/Code/pathible/src/convex/schema.ts`

**Changes:**
1. Add onboarding fields to `profiles` table:
   - `onboardingStatus` (optional)
   - `onboardingStep` (optional)
   - `onboardingCompletedAt` (optional)

2. Create new `userPreferences` table

**Status:** NOT STARTED

**Estimated Time:** 15 minutes

### Step 3: Create Households Module

**File:** `/Users/jimgibbs/Code/pathible/src/convex/households.ts`

**Contains:**
- `create` mutation - Create household with automatic membership
- `get` query - Get household by ID
- `listMyHouseholds` query - List households user belongs to

**Status:** NOT STARTED

**Estimated Time:** 30 minutes

### Step 4: Create Onboarding Module

**File:** `/Users/jimgibbs/Code/pathible/src/convex/onboarding.ts`

**Contains:**
- `getStatus` query - Get onboarding state
- `updateProfile` mutation - Step 1
- `createFirstHousehold` mutation - Step 2
- `setPreferences` mutation - Step 3
- `sendInvitations` mutation - Step 4
- `skipInvitations` mutation - Optional skip

**Status:** NOT STARTED

**Estimated Time:** 2 hours

### Step 5: Create Email Sending Actions

**File:** `/Users/jimgibbs/Code/pathible/src/convex/onboarding/email.ts`

**Contains:**
- `sendInvitationEmail` internal action
- `getInvitationDetails` internal query
- `markInvitationFailed` internal mutation

**Status:** NOT STARTED

**Estimated Time:** 45 minutes

### Step 6: Update Profiles Module

**File:** `/Users/jimgibbs/Code/pathible/src/convex/profiles.ts`

**Changes:**
- Add onboarding status fields to return types
- Update `create` mutation to set initial onboarding status

**Status:** NOT STARTED

**Estimated Time:** 15 minutes

### Step 7: Testing

**Actions:**
1. Test each mutation independently via Convex dashboard
2. Test complete flow via API calls
3. Test error cases
4. Test partial completion and resume

**Status:** NOT STARTED

**Estimated Time:** 1 hour

### Step 8: Frontend Integration

**Files to Create/Update:**
- `/src/app/(unauth)/onboarding/profile/page.tsx`
- `/src/app/(unauth)/onboarding/household/page.tsx`
- `/src/app/(unauth)/onboarding/preferences/page.tsx`
- `/src/app/(unauth)/onboarding/invitations/page.tsx`

**Status:** NOT STARTED (Out of scope for backend architecture)

**Estimated Time:** 4-6 hours (separate task)

## File Creation Order

To ensure dependencies are satisfied, create files in this order:

1. `/src/convex/auth.ts` - **CRITICAL** - Required by all other files
2. `/src/convex/schema.ts` - Update schema before creating functions
3. `/src/convex/households.ts` - Required by onboarding module
4. `/src/convex/onboarding.ts` - Main onboarding logic
5. `/src/convex/onboarding/email.ts` - Email sending (optional, can be deferred)
6. `/src/convex/profiles.ts` - Update existing file

## Key Decision Points

### 1. Should we create auth.ts from scratch or use package helpers?

**Decision:** Create auth.ts with wrappers around @convex-dev/better-auth

**Rationale:**
- Provides centralized auth logic
- Allows custom error messages
- Enables adding logging/monitoring
- Follows existing pattern in codebase

### 2. Should userPreferences be a separate table or part of profiles?

**Decision:** Separate table (as designed in architecture doc)

**Rationale:**
- Allows flexible schema evolution
- Preferences can be nullable/optional without cluttering profiles
- Can add multiple preference sets per user in future
- Clear separation of concerns

### 3. Should invitation sending be synchronous or async?

**Decision:** Async with scheduled actions (as designed)

**Rationale:**
- Non-blocking onboarding completion
- Retryable on failure
- Better error handling
- Scales better for bulk invites

### 4. Should we add rate limiting now or later?

**Decision:** Basic validation now, rate limiting later

**Rationale:**
- Max 10 invitations per request (simple validation)
- Rate limiting table/logic can be added post-MVP
- Focus on core functionality first
- Easy to add later without breaking changes

## Testing Strategy

### Unit Tests (Per Function)

Each mutation should be tested independently:

```typescript
// Test in Convex dashboard or via API
await onboarding.updateProfile({
  firstName: "Test",
  lastName: "User",
  phone: "+1234567890",
  dateOfBirth: 946684800000, // Jan 1, 2000
});

// Verify
await onboarding.getStatus();
// Should return: { status: "profile_complete", currentStep: 2, ... }
```

### Integration Tests (Full Flow)

Test complete onboarding sequence:

1. Create profile
2. Create household
3. Set preferences
4. Send invitations
5. Verify all data created correctly

### Error Cases

Test validation and error handling:

1. Empty required fields
2. Invalid email formats
3. Duplicate household creation
4. Incomplete previous steps
5. Too many invitations

## Migration Strategy

### For Existing Users

If deploying to production with existing users:

```typescript
// Run this migration once
export const backfillOnboardingStatus = internalMutation({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();

    for (const profile of profiles) {
      if (!profile.onboardingStatus) {
        await ctx.db.patch(profile._id, {
          onboardingStatus: "complete",
          onboardingCompletedAt: profile._creationTime,
          onboardingStep: undefined, // Not applicable for existing users
        });
      }
    }

    console.log(`Backfilled ${profiles.length} profiles`);
  },
});
```

### Schema Migration

Convex handles schema changes automatically:
- New optional fields return `undefined` for existing documents
- New tables are created on first write
- No downtime required

## Rollback Plan

If issues arise in production:

1. **Schema Rollback:**
   - Remove new fields from schema
   - Old code will continue to work (fields were optional)

2. **Code Rollback:**
   - Revert commits
   - Redeploy previous version
   - Existing data remains intact (no destructive operations)

3. **Data Cleanup:**
   - If needed, delete test data from userPreferences table
   - No impact on existing profiles or households

## Success Criteria

Onboarding implementation is complete when:

- [ ] All 4 steps can be completed successfully
- [ ] Users can resume incomplete onboarding
- [ ] Data persists correctly at each step
- [ ] Validation works for all inputs
- [ ] Error messages are clear and actionable
- [ ] Invitation emails are sent (or logged in dev mode)
- [ ] No console errors during flow
- [ ] Dashboard shows complete onboarding status
- [ ] All TypeScript types are correct
- [ ] Documentation is updated

## Timeline Estimate

**Backend Implementation:**
- Schema updates: 30 minutes
- Households module: 30 minutes
- Onboarding module: 2 hours
- Email integration: 45 minutes
- Testing: 1 hour
- **Total: 4.5-5 hours**

**Frontend Implementation:** (Separate task)
- UI components: 2 hours
- Page routing: 1 hour
- Form validation: 1 hour
- Integration testing: 1 hour
- **Total: 5-6 hours**

**Overall Project: 9-11 hours**

## Dependencies

### External Services
- Resend (for email sending in production)
  - Already configured in existing auth flow
  - Same configuration will be used for invitations

### Internal Dependencies
- Better Auth component (already configured)
- Convex file storage (for avatar uploads - future enhancement)

## Risks & Mitigations

### Risk 1: Auth.ts File Missing

**Impact:** High - Nothing will work without it

**Mitigation:** Create immediately as first task

**Status:** Identified in this document

### Risk 2: Schema Changes Break Existing Code

**Impact:** Medium - Could affect existing features

**Mitigation:**
- All new fields are optional
- Test existing features after schema update
- Deploy to staging first

### Risk 3: Email Sending Failures

**Impact:** Low - Onboarding still completes

**Mitigation:**
- Non-blocking async design
- Failed invitations stay in DB for retry
- Clear error logging

### Risk 4: Performance Issues with Multiple DB Writes

**Impact:** Low - 4 writes per user is minimal

**Mitigation:**
- Convex handles transactions efficiently
- Each step is < 100ms
- No performance concerns at MVP scale

## Next Actions

**Immediate (Today):**
1. Create `/src/convex/auth.ts` (see implementation below)
2. Update schema with new fields
3. Create households module

**Short-term (This Week):**
1. Implement onboarding mutations
2. Add email sending actions
3. Test complete backend flow

**Medium-term (Next Week):**
1. Build frontend wizard UI
2. Integrate with backend
3. End-to-end testing
4. Deploy to staging

## Notes

- This plan assumes single-developer implementation
- Times are estimates for experienced Convex developer
- Frontend work can start in parallel once backend API is defined
- Email templates already exist from auth flow implementation

## References

- Architecture Design: `/docs/ONBOARDING_ARCHITECTURE.md`
- Database Schema: `/src/convex/schema.ts`
- Convex Guidelines: `/.cursor/rules/convex_rules.mdc`
- Project Guidelines: `/CLAUDE.md`

---

**Document Version:** 1.0
**Created:** 2025-11-11
**Status:** Ready for Implementation
