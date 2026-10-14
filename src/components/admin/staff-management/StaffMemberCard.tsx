import { ArrowUpRight, BriefcaseBusiness, MapPin } from "lucide-react";

import type { AdminUser } from "@/components/admin/AdminUserDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function initials(person: AdminUser) {
  return (person.displayName || person.email || "?")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function StaffMemberCard({ person, onView }: { person: AdminUser; onView: (person: AdminUser) => void }) {
  const skills = person.skills.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean).slice(0, 4);

  return (
    <Card className="h-full border-border/70 shadow-sm transition-colors hover:border-primary/30">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-400/15 text-sm font-semibold text-amber-800 dark:text-amber-200" aria-hidden="true">{initials(person)}</span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{person.displayName || "Guild staff"}</h3>
            <p className="truncate text-sm text-muted-foreground">{person.email || "No email listed"}</p>
          </div>
          <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium capitalize text-sky-700 dark:text-sky-300">Staff</span>
        </div>

        <div className="mt-5 space-y-2.5 text-sm">
          <p className="flex min-w-0 items-center gap-2"><BriefcaseBusiness className="size-4 shrink-0 text-muted-foreground" /><span className="truncate">{person.professionalTitle || "Role not specified"}</span></p>
          <p className="flex min-w-0 items-center gap-2 text-muted-foreground"><MapPin className="size-4 shrink-0" /><span className="truncate">{person.location || "Location not provided"}</span></p>
        </div>

        <div className="mt-4 min-h-8 flex-1">
          {skills.length ? (
            <div className="flex flex-wrap gap-1.5">{skills.map((skill) => <span key={skill} className="max-w-full truncate rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{skill}</span>)}</div>
          ) : <p className="text-xs text-muted-foreground">No skills listed yet</p>}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs capitalize text-muted-foreground">{person.workType || "Work type not set"}</span>
          <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={() => onView(person)}>
            View profile<ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
