import type { Edge, Node } from "@xyflow/react";
import type { Doc, Id } from "@/convex/_generated/dataModel";

/**
 * Family Tree Types
 *
 * TypeScript types for React Flow nodes and edges
 */

// ============================================================================
// MEMBER TYPES (from Convex)
// ============================================================================

export type TreeMember = {
  _id: Id<"familyMembers">;
  _creationTime: number;
  familyUnitId: Id<"familyUnits">;
  householdId: Id<"households">;
  profileId?: Id<"profiles">;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dateOfBirth?: number;
  gender?: "male" | "female" | "prefer_not_to_say";
  relationshipType: Doc<"familyMembers">["relationshipType"];
  status: "active" | "pending_invite" | "inactive";
  treePositionX?: number;
  treePositionY?: number;
};

export type TreeRelationship = {
  _id: Id<"familyRelationships">;
  _creationTime: number;
  householdId: Id<"households">;
  familyUnitId: Id<"familyUnits">;
  person1Id: Id<"familyMembers">;
  person2Id: Id<"familyMembers">;
  relationshipType: "parent_of" | "spouse_of" | "partner_of";
  marriageDate?: number;
  divorceDate?: number;
  createdBy: Id<"profiles">;
  createdAt: number;
  updatedAt: number;
};

// ============================================================================
// REACT FLOW NODE TYPES
// ============================================================================

export type PersonNodeData = {
  memberId: Id<"familyMembers">;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dateOfBirth?: number;
  gender?: "male" | "female" | "prefer_not_to_say";
  relationshipType: Doc<"familyMembers">["relationshipType"];
  // Computed fields
  birthYear?: number;
  deathYear?: number;
  age?: number;
};

export type PersonNode = Node<PersonNodeData, "person">;

// ============================================================================
// REACT FLOW EDGE TYPES
// ============================================================================

export type RelationshipEdgeData = {
  relationshipId: Id<"familyRelationships">;
  relationshipType: "parent_of" | "spouse_of" | "partner_of";
  marriageDate?: number;
  divorceDate?: number;
  isDivorced: boolean;
};

export type RelationshipEdge = Edge<RelationshipEdgeData>;

// ============================================================================
// TREE DATA TYPES
// ============================================================================

export type TreeData = {
  members: TreeMember[];
  relationships: TreeRelationship[];
};

export type LayoutPosition = {
  memberId: Id<"familyMembers">;
  x: number;
  y: number;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert a TreeMember to a React Flow PersonNode
 */
export function memberToNode(
  member: TreeMember,
  defaultPosition: { x: number; y: number } = { x: 0, y: 0 },
): PersonNode {
  const birthYear = member.dateOfBirth ? new Date(member.dateOfBirth).getFullYear() : undefined;

  const age = member.dateOfBirth
    ? Math.floor((Date.now() - member.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000))
    : undefined;

  return {
    id: member._id,
    type: "person",
    position: {
      x: member.treePositionX ?? defaultPosition.x,
      y: member.treePositionY ?? defaultPosition.y,
    },
    data: {
      memberId: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      avatarUrl: member.avatarUrl,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      relationshipType: member.relationshipType,
      birthYear,
      age,
    },
  };
}

/**
 * Convert a TreeRelationship to a React Flow RelationshipEdge
 */
export function relationshipToEdge(relationship: TreeRelationship): RelationshipEdge {
  return {
    id: relationship._id,
    source: relationship.person1Id,
    target: relationship.person2Id,
    type: "relationship",
    data: {
      relationshipId: relationship._id,
      relationshipType: relationship.relationshipType,
      marriageDate: relationship.marriageDate,
      divorceDate: relationship.divorceDate,
      isDivorced: !!relationship.divorceDate,
    },
  };
}

/**
 * Check if any members need auto-layout (have no positions)
 */
export function needsAutoLayout(members: TreeMember[]): boolean {
  return members.some((m) => m.treePositionX === undefined || m.treePositionY === undefined);
}
