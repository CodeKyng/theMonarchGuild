import { ArrowUpRight, BriefcaseBusiness, MapPin, UserRound } from "lucide-react";
import type { PublicMemberProfile } from "@/components/member/explore-members/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicMemberCard({
  member,
  onView,
}: {
  member: PublicMemberProfile;
  onView: (member: PublicMemberProfile) => void;
}) {
  const initials =
    member.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "M";

  return (
    <Card className="flex min-w-0 flex-col overflow-hidden border-border/70 shadow-sm transition-colors hover:border-primary/30">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-11 shrink-0 sm:size-12">
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold leading-tight">{member.displayName}</h3>
            <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {member.professionalTitle || "Web3 community member"}
            </p>
          </div>
          <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>

        <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {member.workType && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <BriefcaseBusiness className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{member.workType}</span>
            </span>
          )}
          {member.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{member.location}</span>
            </span>
          )}
        </div>

        {member.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {member.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="max-w-full break-words rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                {skill}
              </span>
            ))}
            {member.skills.length > 4 && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                +{member.skills.length - 4}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No skills listed</p>
        )}

        <div className="mt-auto pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-full min-w-0 justify-between gap-2 px-3"
            onClick={() => onView(member)}
          >
            <span className="truncate">View profile</span>
            <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
