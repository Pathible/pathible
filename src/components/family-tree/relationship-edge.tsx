"use client";

import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from "@xyflow/react";
import { X } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  DIVORCED_EDGE_STYLE,
  EDGE_STYLES,
  RELATIONSHIP_TYPE_LABELS,
} from "@/lib/family-tree/constants";
import type { RelationshipEdge as RelationshipEdgeType } from "@/lib/family-tree/types";

/**
 * RelationshipEdge - Custom React Flow edge for displaying relationships
 *
 * Features:
 * - Different styles for parent-child, spouse, partner
 * - Dashed line for divorced relationships
 * - Delete button on hover/selection
 */

type RelationshipEdgeProps = EdgeProps<RelationshipEdgeType>;

function RelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: RelationshipEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  if (!data) {
    return <BaseEdge id={id} path={edgePath} style={{ stroke: "#64748b", strokeWidth: 2 }} />;
  }

  const { relationshipType, isDivorced } = data;

  // Get style based on relationship type
  const baseStyle = EDGE_STYLES[relationshipType] || EDGE_STYLES.parent_of;
  const style = isDivorced ? DIVORCED_EDGE_STYLE : baseStyle;

  const label = RELATIONSHIP_TYPE_LABELS[relationshipType];

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          strokeDasharray: style.strokeDasharray,
        }}
      />

      {/* Show label and delete button when selected */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-auto nodrag nopan flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-md shadow-md border px-2 py-1"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {label}
              {isDivorced && " (Divorced)"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                // Delete will be handled by the parent component via onEdgesChange
                const event = new CustomEvent("deleteEdge", { detail: { id } });
                window.dispatchEvent(event);
              }}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Delete relationship</span>
            </Button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeComponent);
