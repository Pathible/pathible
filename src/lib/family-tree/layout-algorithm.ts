import type { Id } from "@/convex/_generated/dataModel";
import { LAYOUT_SETTINGS, NODE_HEIGHT, NODE_WIDTH } from "./constants";
import type { LayoutPosition, TreeMember, TreeRelationship } from "./types";

/**
 * Family Tree Layout Algorithm
 *
 * Implements a hierarchical layout for family trees:
 * - Parents at top, children below
 * - Spouses side-by-side
 * - Centered children below parents
 */

type GraphNode = {
  id: Id<"familyMembers">;
  member: TreeMember;
  generation: number;
  spouseIds: Id<"familyMembers">[];
  parentIds: Id<"familyMembers">[];
  childIds: Id<"familyMembers">[];
};

type FamilyGraph = {
  nodes: Map<Id<"familyMembers">, GraphNode>;
};

/**
 * Build a graph structure from members and relationships
 */
function buildGraph(members: TreeMember[], relationships: TreeRelationship[]): FamilyGraph {
  const nodes = new Map<Id<"familyMembers">, GraphNode>();

  // Initialize nodes
  for (const member of members) {
    nodes.set(member._id, {
      id: member._id,
      member,
      generation: -1, // Will be computed later
      spouseIds: [],
      parentIds: [],
      childIds: [],
    });
  }

  // Process relationships
  for (const rel of relationships) {
    const node1 = nodes.get(rel.person1Id);
    const node2 = nodes.get(rel.person2Id);

    if (!node1 || !node2) continue;

    switch (rel.relationshipType) {
      case "parent_of":
        // person1 is parent of person2
        node1.childIds.push(rel.person2Id);
        node2.parentIds.push(rel.person1Id);
        break;
      case "spouse_of":
      case "partner_of":
        // Symmetric relationship
        if (!node1.spouseIds.includes(rel.person2Id)) {
          node1.spouseIds.push(rel.person2Id);
        }
        if (!node2.spouseIds.includes(rel.person1Id)) {
          node2.spouseIds.push(rel.person1Id);
        }
        break;
    }
  }

  return { nodes };
}

/**
 * Find root ancestors (members with no parents in the tree)
 */
function findRoots(graph: FamilyGraph): Id<"familyMembers">[] {
  const roots: Id<"familyMembers">[] = [];

  for (const [id, node] of graph.nodes) {
    if (node.parentIds.length === 0) {
      roots.push(id);
    }
  }

  // If no roots found (circular or all have parents), pick the oldest members
  if (roots.length === 0 && graph.nodes.size > 0) {
    // Just use all nodes as potential roots and let generation assignment handle it
    return Array.from(graph.nodes.keys());
  }

  return roots;
}

/**
 * Assign generation levels using BFS from roots
 */
function assignGenerations(graph: FamilyGraph): void {
  const roots = findRoots(graph);
  const visited = new Set<Id<"familyMembers">>();
  const queue: { id: Id<"familyMembers">; gen: number }[] = [];

  // Start with roots at generation 0
  for (const rootId of roots) {
    queue.push({ id: rootId, gen: 0 });
  }

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    const { id, gen } = item;

    if (visited.has(id)) continue;
    visited.add(id);

    const node = graph.nodes.get(id);
    if (!node) continue;

    node.generation = gen;

    // Spouses should be on the same generation
    for (const spouseId of node.spouseIds) {
      const spouse = graph.nodes.get(spouseId);
      if (spouse && !visited.has(spouseId)) {
        queue.push({ id: spouseId, gen });
      }
    }

    // Children are one generation below
    for (const childId of node.childIds) {
      if (!visited.has(childId)) {
        queue.push({ id: childId, gen: gen + 1 });
      }
    }
  }

  // Handle any unvisited nodes (disconnected)
  for (const [_id, node] of graph.nodes) {
    if (node.generation === -1) {
      node.generation = 0;
    }
  }
}

/**
 * Group nodes by generation
 */
function groupByGeneration(graph: FamilyGraph): Map<number, Id<"familyMembers">[]> {
  const generations = new Map<number, Id<"familyMembers">[]>();

  for (const [id, node] of graph.nodes) {
    const gen = node.generation;
    if (!generations.has(gen)) {
      generations.set(gen, []);
    }
    const genMembers = generations.get(gen);
    if (genMembers) {
      genMembers.push(id);
    }
  }

  return generations;
}

/**
 * Order members within a generation to minimize edge crossings
 * and keep spouses together
 */
function orderGeneration(
  memberIds: Id<"familyMembers">[],
  graph: FamilyGraph,
): Id<"familyMembers">[] {
  const processed = new Set<Id<"familyMembers">>();
  const ordered: Id<"familyMembers">[] = [];

  for (const id of memberIds) {
    if (processed.has(id)) continue;

    const node = graph.nodes.get(id);
    if (!node) continue;

    // Add this member
    ordered.push(id);
    processed.add(id);

    // Add spouses right next to them
    for (const spouseId of node.spouseIds) {
      if (!processed.has(spouseId) && memberIds.includes(spouseId)) {
        ordered.push(spouseId);
        processed.add(spouseId);
      }
    }
  }

  return ordered;
}

/**
 * Calculate positions for a hierarchical family tree layout
 */
export function calculateHierarchicalLayout(
  members: TreeMember[],
  relationships: TreeRelationship[],
  options: Partial<typeof LAYOUT_SETTINGS> = {},
): LayoutPosition[] {
  if (members.length === 0) {
    return [];
  }

  const settings = { ...LAYOUT_SETTINGS, ...options };
  const { horizontalGap, verticalGap, spouseGap, startX, startY } = settings;

  // Build graph and assign generations
  const graph = buildGraph(members, relationships);
  assignGenerations(graph);

  // Group by generation
  const generations = groupByGeneration(graph);

  // Sort generation keys
  const sortedGens = Array.from(generations.keys()).sort((a, b) => a - b);

  const positions: LayoutPosition[] = [];

  // Calculate positions for each generation
  for (const gen of sortedGens) {
    const genMemberIds = generations.get(gen);
    if (!genMemberIds) continue;
    const orderedIds = orderGeneration(genMemberIds, graph);

    // Calculate total width of this generation
    let totalWidth = 0;
    const memberWidths: number[] = [];

    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      const node = graph.nodes.get(id);
      if (!node) continue;

      // Check if this member has a spouse that's next in the list
      const nextId = orderedIds[i + 1];
      const isWithSpouse = nextId && node.spouseIds.includes(nextId);

      if (isWithSpouse) {
        // Spouse pair - use spouse gap
        memberWidths.push(NODE_WIDTH);
        memberWidths.push(NODE_WIDTH);
        totalWidth += NODE_WIDTH * 2 + spouseGap;
        i++; // Skip the spouse in the next iteration
      } else {
        memberWidths.push(NODE_WIDTH);
        totalWidth += NODE_WIDTH;
      }

      // Add horizontal gap (except after last)
      if (i < orderedIds.length - 1) {
        totalWidth += horizontalGap;
      }
    }

    // Center the generation
    let currentX = startX - totalWidth / 2;
    const y = startY + gen * (NODE_HEIGHT + verticalGap);

    // Assign positions
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      const node = graph.nodes.get(id);
      if (!node) continue;

      // Check if this member has a spouse that's next in the list
      const nextId = orderedIds[i + 1];
      const isWithSpouse = nextId && node.spouseIds.includes(nextId);

      positions.push({
        memberId: id,
        x: currentX + NODE_WIDTH / 2,
        y,
      });

      if (isWithSpouse) {
        currentX += NODE_WIDTH + spouseGap;
        // Position spouse
        positions.push({
          memberId: nextId,
          x: currentX + NODE_WIDTH / 2,
          y,
        });
        currentX += NODE_WIDTH + horizontalGap;
        i++; // Skip the spouse
      } else {
        currentX += NODE_WIDTH + horizontalGap;
      }
    }
  }

  return positions;
}

/**
 * Calculate a simple grid layout (fallback when no relationships exist)
 */
export function calculateGridLayout(
  members: TreeMember[],
  options: Partial<typeof LAYOUT_SETTINGS> = {},
): LayoutPosition[] {
  const settings = { ...LAYOUT_SETTINGS, ...options };
  const { horizontalGap, verticalGap, startX, startY } = settings;

  const columns = Math.ceil(Math.sqrt(members.length));
  const positions: LayoutPosition[] = [];

  for (let i = 0; i < members.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);

    positions.push({
      memberId: members[i]._id,
      x: startX + col * (NODE_WIDTH + horizontalGap),
      y: startY + row * (NODE_HEIGHT + verticalGap),
    });
  }

  return positions;
}

/**
 * Main layout function - chooses appropriate algorithm
 */
export function calculateLayout(
  members: TreeMember[],
  relationships: TreeRelationship[],
  options: Partial<typeof LAYOUT_SETTINGS> = {},
): LayoutPosition[] {
  if (members.length === 0) {
    return [];
  }

  // If there are relationships, use hierarchical layout
  if (relationships.length > 0) {
    return calculateHierarchicalLayout(members, relationships, options);
  }

  // Otherwise, use simple grid layout
  return calculateGridLayout(members, options);
}
