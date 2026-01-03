"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  RELATIONSHIP_BORDER_COLORS,
  RELATIONSHIP_COLORS,
} from "@/lib/family-tree/constants";
import type { PersonNode as PersonNodeType } from "@/lib/family-tree/types";
import { cn } from "@/lib/utils";

/**
 * PersonNode - Custom React Flow node for displaying a family member
 *
 * Features:
 * - Avatar with relationship-based color
 * - Name and birth year display
 * - Connection handles for creating relationships
 */

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeType>) {
  const { firstName, lastName, avatarUrl, relationshipType, birthYear, age } = data;

  const bgColor = RELATIONSHIP_COLORS[relationshipType] || "bg-gray-500";
  const borderColor = RELATIONSHIP_BORDER_COLORS[relationshipType] || "border-gray-500";

  return (
    <>
      {/* Top handle for parent connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !border-slate-500 !w-3 !h-3"
      />

      <div
        className={cn(
          "bg-card rounded-lg shadow-md border-2 p-3 transition-all",
          "hover:shadow-lg hover:scale-[1.02]",
          selected ? `${borderColor} ring-2 ring-primary/20` : "border-border",
        )}
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      >
        <div className="flex items-center gap-3 h-full">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
            <AvatarFallback className={cn(bgColor, "text-white text-sm")}>
              {getInitials(firstName, lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="font-medium text-sm truncate text-foreground">
              {firstName} {lastName}
            </p>
            {birthYear && (
              <p className="text-xs text-muted-foreground">
                b. {birthYear}
                {age !== undefined && age >= 0 && <span className="ml-1">({age})</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom handle for child connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !border-slate-500 !w-3 !h-3"
      />

      {/* Left handle for spouse/partner connections */}
      <Handle
        type="source"
        position={Position.Left}
        id="spouse-left"
        className="!bg-pink-400 !border-pink-500 !w-2 !h-2"
      />

      {/* Right handle for spouse/partner connections */}
      <Handle
        type="target"
        position={Position.Right}
        id="spouse-right"
        className="!bg-pink-400 !border-pink-500 !w-2 !h-2"
      />
    </>
  );
}

export const PersonNode = memo(PersonNodeComponent);
