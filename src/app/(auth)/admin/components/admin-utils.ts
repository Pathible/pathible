// Shared utilities and constants for admin pages.
// Plain TypeScript - no React imports or JSX.

// ---------------------------------------------------------------------------
// Badge style constants
//
// All badges use variant="outline" with this pattern:
//   bg-{color}/{opacity} text-{color} border-{color}/{borderOpacity} font-semibold
// ---------------------------------------------------------------------------

/** Subscription tier badge styles */
export const TIER_STYLES: Record<string, string> = {
  foundations: "bg-pathible-sage/25 text-pathible-forest border-pathible-sage/50 font-semibold",
  heritage: "bg-primary/20 text-primary border-primary/40 font-semibold",
  legacy: "bg-pathible-forest/20 text-pathible-forest border-pathible-forest/40 font-semibold",
  founders: "bg-pathible-gold/25 text-pathible-deep-gold border-pathible-gold/50 font-semibold",
};

/** Subscription status badge styles */
export const SUBSCRIPTION_STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/20 text-primary border-primary/40 font-semibold",
  inactive: "bg-muted text-muted-foreground border-border font-semibold",
  cancelled: "bg-destructive/20 text-destructive border-destructive/40 font-semibold",
  past_due: "bg-accent/20 text-accent-foreground border-accent/40 font-semibold",
};

/** Member/user status badge styles */
export const MEMBER_STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/20 text-primary border-primary/40 font-semibold",
  pending: "bg-accent/20 text-accent-foreground border-accent/40 font-semibold",
  inactive: "bg-muted text-muted-foreground border-border font-semibold",
};

/** Content/tour status badge styles */
export const CONTENT_STATUS_STYLES: Record<string, string> = {
  published: "bg-primary/20 text-primary border-primary/40 font-semibold",
  draft: "bg-accent/20 text-accent-foreground border-accent/40 font-semibold",
  archived: "bg-muted text-muted-foreground border-border font-semibold",
};

/** Email send status badge styles */
export const EMAIL_STATUS_STYLES: Record<string, string> = {
  sent: "bg-primary/20 text-primary border-primary/40 font-semibold",
  partial: "bg-accent/20 text-accent-foreground border-accent/40 font-semibold",
  failed: "bg-destructive/20 text-destructive border-destructive/40 font-semibold",
};

/** Campaign status badge styles (campaigns-list) */
export const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border font-semibold",
  sending: "bg-primary/20 text-primary border-primary/40 font-semibold",
  completed: "bg-primary/20 text-primary border-primary/40 font-semibold",
  failed: "bg-destructive/20 text-destructive border-destructive/40 font-semibold",
};

/** Email queue status badge styles (queue-status) */
export const QUEUE_STATUS_STYLES: Record<string, string> = {
  queued: "bg-muted text-muted-foreground border-border font-semibold",
  processing: "bg-primary/20 text-primary border-primary/40 font-semibold",
  sent: "bg-primary/20 text-primary border-primary/40 font-semibold",
  failed: "bg-destructive/20 text-destructive border-destructive/40 font-semibold",
};

/** Enabled/disabled toggle badge styles */
export const ENABLED_STYLES: Record<string, string> = {
  enabled: "bg-primary/20 text-primary border-primary/40 font-semibold",
  disabled: "bg-muted text-muted-foreground border-border font-semibold",
};

/** Activity log action type category badge styles */
export const ACTIVITY_CATEGORY_STYLES: Record<string, string> = {
  document: "bg-primary/20 text-primary border-primary/40 font-semibold",
  wisdom: "bg-secondary/25 text-secondary-foreground border-secondary/40 font-semibold",
  letter: "bg-pathible-sage/25 text-pathible-forest border-pathible-sage/50 font-semibold",
  household: "bg-accent/20 text-accent-foreground border-accent/40 font-semibold",
  financial: "bg-pathible-gold/25 text-pathible-deep-gold border-pathible-gold/50 font-semibold",
  family: "bg-pathible-forest/15 text-pathible-forest border-pathible-forest/35 font-semibold",
  category: "bg-muted text-muted-foreground border-border font-semibold",
  other: "bg-muted text-muted-foreground border-border font-semibold",
};

/** Email template category badge styles */
export const EMAIL_CATEGORY_STYLES: Record<string, string> = {
  onboarding: "bg-primary/20 text-primary border-primary/40 font-semibold",
  retargeting: "bg-accent/20 text-accent-foreground border-accent/40 font-semibold",
  announcements:
    "bg-pathible-forest/20 text-pathible-forest border-pathible-forest/40 font-semibold",
  legacy: "bg-secondary/25 text-secondary-foreground border-secondary/40 font-semibold",
  invitations: "bg-pathible-sage/25 text-pathible-forest border-pathible-sage/50 font-semibold",
  digest: "bg-pathible-gold/25 text-pathible-deep-gold border-pathible-gold/50 font-semibold",
  system: "bg-muted text-muted-foreground border-border font-semibold",
  other: "bg-muted text-muted-foreground border-border font-semibold",
};

// ---------------------------------------------------------------------------
// Action type labels
// ---------------------------------------------------------------------------

export const ACTION_TYPE_LABELS: Record<string, string> = {
  document_uploaded: "Document uploaded",
  document_viewed: "Document viewed",
  document_updated: "Document updated",
  document_deleted: "Document deleted",
  wisdom_created: "Wisdom entry created",
  wisdom_updated: "Wisdom entry updated",
  wisdom_deleted: "Wisdom entry deleted",
  letter_created: "Letter created",
  household_created: "Household created",
  household_updated: "Household updated",
  member_invited: "Member invited",
  member_joined: "Member joined",
  member_removed: "Member removed",
  member_role_updated: "Member role updated",
  plan_updated: "Legacy plan updated",
  asset_created: "Financial asset added",
  asset_updated: "Financial asset updated",
  asset_deleted: "Financial asset deleted",
  policy_created: "Insurance policy added",
  policy_updated: "Insurance policy updated",
  policy_deleted: "Insurance policy deleted",
  category_created: "Category created",
  category_updated: "Category updated",
  category_deleted: "Category deleted",
  family_unit_created: "Family unit created",
  family_unit_updated: "Family unit updated",
  family_unit_deleted: "Family unit deleted",
  family_member_created: "Family member added",
  family_member_updated: "Family member updated",
  family_member_deleted: "Family member removed",
  suggestion_completed: "Suggestion completed",
  other: "Activity",
};

/** Returns a human-readable label for an action type, falling back to a formatted version of the raw string. */
export function formatActionType(actionType: string): string {
  return ACTION_TYPE_LABELS[actionType] || actionType.replace(/_/g, " ");
}
