"use client";

import {
  Cake,
  Calendar,
  Heart,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  StickyNote,
  Trash2,
  UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Id } from "@/convex/_generated/dataModel";

interface FamilyMember {
  _id: Id<"familyMembers">;
  _creationTime?: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: number;
  address?: string;
  city?: string;
  county?: string;
  state?: string;
  zipCode?: string;
  gender?: "male" | "female" | "prefer_not_to_say" | undefined;
  maritalStatus?:
    | "single"
    | "married"
    | "divorced"
    | "widowed"
    | "domestic_partnership"
    | "separated";
  relationshipType:
    | "parent"
    | "child"
    | "spouse"
    | "partner"
    | "sibling"
    | "grandparent"
    | "grandchild"
    | "aunt_uncle"
    | "niece_nephew"
    | "cousin"
    | "in_law"
    | "other";
  roles: string[];
  avatarUrl?: string;
  status?: "active" | "pending_invite" | "inactive";
  notes?: string;
  updatedAt?: number;
}

interface MemberCardProps {
  member: FamilyMember;
  onEdit: () => void;
  onRemove: () => void;
}

// Warm color palette for avatar backgrounds based on relationship
const relationshipColors: Record<string, string> = {
  parent: "bg-rose-500",
  child: "bg-sky-500",
  spouse: "bg-pink-500",
  partner: "bg-pink-400",
  sibling: "bg-violet-500",
  grandparent: "bg-amber-500",
  grandchild: "bg-teal-500",
  aunt_uncle: "bg-orange-500",
  niece_nephew: "bg-cyan-500",
  cousin: "bg-indigo-500",
  in_law: "bg-emerald-500",
  other: "bg-slate-500",
};

// Human-friendly relationship labels
const relationshipLabels: Record<string, string> = {
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
  other: "Family Member",
};

export function MemberCard({ member, onEdit, onRemove }: MemberCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const getAvatarColor = (relationshipType: string) => {
    return relationshipColors[relationshipType] || "bg-slate-500";
  };

  const formatRelationship = (relationship: string) => {
    return relationshipLabels[relationship] || "Family Member";
  };

  const formatBirthDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (birthTimestamp?: number) => {
    if (!birthTimestamp) return null;
    const birthDate = new Date(birthTimestamp);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatLocation = (city?: string, state?: string) => {
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return null;
  };

  const formatMemberSince = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const isPending = member.status === "pending_invite";
  const isInactive = member.status === "inactive";
  const age = calculateAge(member.dateOfBirth);
  const location = formatLocation(member.city, member.state);
  const memberSince = formatMemberSince(member._creationTime);
  const hasContactInfo = member.email || member.phone;
  const hasAdditionalInfo = member.dateOfBirth || location || member.notes;

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${isPending ? "opacity-75 border-dashed" : ""} ${isInactive ? "opacity-50" : ""}`}
    >
      <CardContent className="p-0">
        {/* Header Section with Avatar and Primary Info */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Large Avatar */}
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-background shadow-sm">
                {member.avatarUrl ? (
                  <AvatarImage
                    src={member.avatarUrl}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback
                  className={`${getAvatarColor(member.relationshipType)} text-white text-lg font-semibold`}
                >
                  {getInitials(member.firstName, member.lastName)}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              {!isPending && !isInactive && (
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
              )}
            </div>

            {/* Name and Relationship */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold tracking-tight truncate">
                    {member.firstName} {member.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs font-medium">
                      <Heart className="h-3 w-3 mr-1" />
                      {formatRelationship(member.relationshipType)}
                    </Badge>
                    {isPending && (
                      <Badge
                        variant="outline"
                        className="text-xs text-amber-600 border-amber-300 bg-amber-50"
                      >
                        Awaiting Response
                      </Badge>
                    )}
                    {isInactive && (
                      <Badge variant="outline" className="text-xs text-slate-500 border-slate-300">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onRemove}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Age Display (if available) */}
              {age !== null && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Cake className="h-3.5 w-3.5" />
                  <span>{age} years old</span>
                  {member.dateOfBirth && (
                    <span className="text-xs">(Born {formatBirthDate(member.dateOfBirth)})</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Roles Section */}
        {member.roles.length > 0 && (
          <>
            <Separator />
            <div className="px-5 py-3 bg-muted/30">
              <div className="flex items-center gap-2 flex-wrap">
                <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-1">
                  Roles:
                </span>
                {member.roles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs capitalize">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Contact & Details Section */}
        {(hasContactInfo || hasAdditionalInfo) && (
          <>
            <Separator />
            <div className="px-5 py-4 space-y-3">
              {/* Contact Information */}
              {hasContactInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {member.email && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Mail className="h-4 w-4" />
                          </div>
                          <span className="truncate">{member.email}</span>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Send email</TooltipContent>
                    </Tooltip>
                  )}
                  {member.phone && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Phone className="h-4 w-4" />
                          </div>
                          <span className="truncate">{member.phone}</span>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Call</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}

              {/* Location */}
              {location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>{location}</span>
                </div>
              )}

              {/* Birth Date (when age not shown above) */}
              {member.dateOfBirth && age === null && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span>Born {formatBirthDate(member.dateOfBirth)}</span>
                </div>
              )}

              {/* Notes */}
              {member.notes && (
                <div className="flex items-start gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{member.notes}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer - Member Since */}
        {memberSince && (
          <>
            <Separator />
            <div className="px-5 py-2.5 bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Part of the family since {memberSince}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
