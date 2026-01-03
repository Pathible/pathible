import type { Doc } from "@/convex/_generated/dataModel";

/**
 * Family Tree Constants
 *
 * Node dimensions, colors, and layout settings
 */

// ============================================================================
// NODE DIMENSIONS
// ============================================================================

export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 80;

// ============================================================================
// LAYOUT SETTINGS
// ============================================================================

export const LAYOUT_SETTINGS = {
  /** Horizontal gap between nodes */
  horizontalGap: 40,
  /** Vertical gap between generations */
  verticalGap: 120,
  /** Gap between spouses */
  spouseGap: 20,
  /** Starting X position for layout */
  startX: 0,
  /** Starting Y position for layout */
  startY: 0,
};

// ============================================================================
// RELATIONSHIP COLORS (matches member-card.tsx)
// ============================================================================

export const RELATIONSHIP_COLORS: Record<Doc<"familyMembers">["relationshipType"], string> = {
  parent: "bg-rose-500",
  child: "bg-sky-500",
  spouse: "bg-pink-500",
  partner: "bg-purple-500",
  sibling: "bg-blue-500",
  grandparent: "bg-amber-500",
  grandchild: "bg-teal-500",
  aunt_uncle: "bg-orange-500",
  niece_nephew: "bg-cyan-500",
  cousin: "bg-indigo-500",
  in_law: "bg-lime-500",
  other: "bg-gray-500",
};

export const RELATIONSHIP_BORDER_COLORS: Record<Doc<"familyMembers">["relationshipType"], string> =
  {
    parent: "border-rose-500",
    child: "border-sky-500",
    spouse: "border-pink-500",
    partner: "border-purple-500",
    sibling: "border-blue-500",
    grandparent: "border-amber-500",
    grandchild: "border-teal-500",
    aunt_uncle: "border-orange-500",
    niece_nephew: "border-cyan-500",
    cousin: "border-indigo-500",
    in_law: "border-lime-500",
    other: "border-gray-500",
  };

// ============================================================================
// EDGE STYLES
// ============================================================================

export const EDGE_STYLES = {
  parent_of: {
    stroke: "#64748b", // slate-500
    strokeWidth: 2,
    strokeDasharray: undefined,
  },
  spouse_of: {
    stroke: "#ec4899", // pink-500
    strokeWidth: 3,
    strokeDasharray: undefined,
  },
  partner_of: {
    stroke: "#a855f7", // purple-500
    strokeWidth: 2,
    strokeDasharray: "5,5",
  },
};

export const DIVORCED_EDGE_STYLE = {
  stroke: "#94a3b8", // slate-400
  strokeWidth: 2,
  strokeDasharray: "5,5",
};

// ============================================================================
// RELATIONSHIP LABELS
// ============================================================================

export const RELATIONSHIP_TYPE_LABELS: Record<"parent_of" | "spouse_of" | "partner_of", string> = {
  parent_of: "Parent of",
  spouse_of: "Spouse",
  partner_of: "Partner",
};

export const MEMBER_RELATIONSHIP_LABELS: Record<Doc<"familyMembers">["relationshipType"], string> =
  {
    parent: "Parent",
    child: "Child",
    spouse: "Spouse",
    partner: "Partner",
    sibling: "Sibling",
    grandparent: "Grandparent",
    grandchild: "Grandchild",
    aunt_uncle: "Aunt/Uncle",
    niece_nephew: "Niece/Nephew",
    cousin: "Cousin",
    in_law: "In-Law",
    other: "Other",
  };

// ============================================================================
// ZOOM SETTINGS
// ============================================================================

export const ZOOM_SETTINGS = {
  minZoom: 0.25,
  maxZoom: 2,
  defaultZoom: 1,
  zoomStep: 0.1,
};
