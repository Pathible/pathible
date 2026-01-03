"use client";

import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import "@xyflow/react/dist/style.css";
import { useMutation, useQuery } from "convex/react";
import { LayoutGrid, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  memberToNode,
  needsAutoLayout,
  type PersonNode as PersonNodeType,
  type RelationshipEdge as RelationshipEdgeType,
  relationshipToEdge,
} from "@/lib/family-tree";
import { ZOOM_SETTINGS } from "@/lib/family-tree/constants";
import { calculateLayout } from "@/lib/family-tree/layout-algorithm";
import { ConnectionTypeDialog } from "./connection-type-dialog";
import { PersonNode } from "./person-node";
import { RelationshipEdge } from "./relationship-edge";

/**
 * FamilyTreeView - Main family tree visualization component
 *
 * Features:
 * - Interactive canvas with pan/zoom
 * - Drag-to-reposition nodes
 * - Position persistence
 * - Auto-layout for initial view
 * - Drag-to-connect for creating relationships
 */

// Node and edge type registrations
const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

interface FamilyTreeViewProps {
  familyUnitId: Id<"familyUnits">;
}

export function FamilyTreeView({ familyUnitId }: FamilyTreeViewProps) {
  // Convex queries and mutations
  const treeData = useQuery(api.familyTree.getTreeData, { familyUnitId });
  const updatePosition = useMutation(api.familyTree.updateMemberPosition);
  const batchUpdatePositions = useMutation(api.familyTree.batchUpdatePositions);
  const createRelationship = useMutation(api.familyTree.createRelationship);
  const deleteRelationship = useMutation(api.familyTree.deleteRelationship);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<PersonNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationshipEdgeType>([]);

  // UI state
  const [showMinimap, setShowMinimap] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [isLayoutApplied, setIsLayoutApplied] = useState(false);

  // Transform Convex data to React Flow format
  useEffect(() => {
    if (!treeData) return;

    const { members, relationships } = treeData;

    // Check if we need auto-layout
    const needsLayout = needsAutoLayout(members) && !isLayoutApplied;

    if (needsLayout && members.length > 0) {
      // Calculate layout positions
      const positions = calculateLayout(members, relationships);

      // Apply positions to members for node creation
      const membersWithPositions = members.map((member) => {
        const pos = positions.find((p) => p.memberId === member._id);
        return {
          ...member,
          treePositionX: pos?.x ?? member.treePositionX ?? 0,
          treePositionY: pos?.y ?? member.treePositionY ?? 0,
        };
      });

      // Create nodes with calculated positions
      const newNodes = membersWithPositions.map((member) => memberToNode(member));

      setNodes(newNodes);
      setIsLayoutApplied(true);

      // Save positions to database
      if (positions.length > 0) {
        batchUpdatePositions({
          familyUnitId,
          positions: positions.map((p) => ({
            memberId: p.memberId,
            x: p.x,
            y: p.y,
          })),
        }).catch((error) => {
          console.error("Failed to save positions:", error);
        });
      }
    } else {
      // Use existing positions
      const newNodes = members.map((member) => memberToNode(member));
      setNodes(newNodes);
    }

    // Create edges from relationships
    const newEdges = relationships.map((rel) => relationshipToEdge(rel));
    setEdges(newEdges);
  }, [treeData, setNodes, setEdges, isLayoutApplied, batchUpdatePositions, familyUnitId]);

  // Handle node position changes (drag end)
  const handleNodesChange = useCallback(
    (changes: NodeChange<PersonNodeType>[]) => {
      onNodesChange(changes);

      // Save position on drag end
      for (const change of changes) {
        if (change.type === "position" && change.dragging === false && change.position) {
          updatePosition({
            memberId: change.id as Id<"familyMembers">,
            positionX: change.position.x,
            positionY: change.position.y,
          }).catch((error) => {
            console.error("Failed to save position:", error);
            toast.error("Failed to save position");
          });
        }
      }
    },
    [onNodesChange, updatePosition],
  );

  // Handle edge changes (including deletion)
  const handleEdgesChange = useCallback(
    (changes: EdgeChange<RelationshipEdgeType>[]) => {
      for (const change of changes) {
        if (change.type === "remove") {
          // Delete relationship from database
          deleteRelationship({
            relationshipId: change.id as Id<"familyRelationships">,
          })
            .then(() => {
              toast.success("Relationship removed");
            })
            .catch((error) => {
              console.error("Failed to delete relationship:", error);
              toast.error("Failed to delete relationship");
            });
        }
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, deleteRelationship],
  );

  // Handle new connection (drag-to-connect)
  const handleConnect = useCallback((connection: Connection) => {
    // Open dialog to select relationship type
    setPendingConnection(connection);
  }, []);

  // Handle relationship type selection
  const handleRelationshipTypeSelect = useCallback(
    async (relationshipType: "parent_of" | "spouse_of" | "partner_of") => {
      if (!pendingConnection?.source || !pendingConnection?.target) return;

      try {
        await createRelationship({
          familyUnitId,
          person1Id: pendingConnection.source as Id<"familyMembers">,
          person2Id: pendingConnection.target as Id<"familyMembers">,
          relationshipType,
        });

        toast.success("Relationship created");
      } catch (error) {
        console.error("Failed to create relationship:", error);
        toast.error(error instanceof Error ? error.message : "Failed to create relationship");
      } finally {
        setPendingConnection(null);
      }
    },
    [pendingConnection, createRelationship, familyUnitId],
  );

  // Apply auto-layout manually
  const handleAutoLayout = useCallback(async () => {
    if (!treeData) return;

    const { members, relationships } = treeData;
    const positions = calculateLayout(members, relationships);

    // Update local state immediately
    setNodes((nds) =>
      nds.map((node) => {
        const pos = positions.find((p) => p.memberId === node.id);
        if (pos) {
          return {
            ...node,
            position: { x: pos.x, y: pos.y },
          };
        }
        return node;
      }),
    );

    // Save to database
    try {
      await batchUpdatePositions({
        familyUnitId,
        positions: positions.map((p) => ({
          memberId: p.memberId,
          x: p.x,
          y: p.y,
        })),
      });

      toast.success("Layout applied");
    } catch (error) {
      console.error("Failed to apply layout:", error);
      toast.error("Failed to save layout");
    }
  }, [treeData, setNodes, batchUpdatePositions, familyUnitId]);

  // Listen for delete edge events from RelationshipEdge component
  useEffect(() => {
    const handleDeleteEdge = (event: CustomEvent<{ id: string }>) => {
      handleEdgesChange([{ type: "remove", id: event.detail.id }]);
    };

    window.addEventListener("deleteEdge", handleDeleteEdge as EventListener);
    return () => {
      window.removeEventListener("deleteEdge", handleDeleteEdge as EventListener);
    };
  }, [handleEdgesChange]);

  // Loading state
  if (treeData === undefined) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (treeData === null || treeData.members.length === 0) {
    return (
      <Card className="h-[600px] flex items-center justify-center border-dashed">
        <CardContent className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Family Members</h3>
          <p className="text-muted-foreground mb-4">
            Add family members to see them in the tree view
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoLayout}
          className="bg-background/80 backdrop-blur-sm"
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Auto Layout
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMinimap(!showMinimap)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {showMinimap ? "Hide Minimap" : "Show Minimap"}
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={ZOOM_SETTINGS.minZoom}
        maxZoom={ZOOM_SETTINGS.maxZoom}
        defaultEdgeOptions={{
          type: "relationship",
        }}
        connectionLineStyle={{ stroke: "#64748b", strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          position="bottom-right"
        />
        {showMinimap && (
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as { relationshipType?: string };
              switch (data?.relationshipType) {
                case "parent":
                  return "#f43f5e";
                case "child":
                  return "#0ea5e9";
                case "spouse":
                  return "#ec4899";
                default:
                  return "#64748b";
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            position="bottom-left"
          />
        )}
      </ReactFlow>

      {/* Connection Type Dialog */}
      <ConnectionTypeDialog
        open={pendingConnection !== null}
        onOpenChange={(open) => {
          if (!open) setPendingConnection(null);
        }}
        onSelect={handleRelationshipTypeSelect}
      />
    </div>
  );
}
