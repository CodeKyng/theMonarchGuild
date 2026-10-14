import { BriefcaseBusiness, Crown, UsersRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const roles = [
  { id: "member", label: "Member", icon: UsersRound, description: "Participates in the guild and manages their own profile.", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { id: "staff", label: "Staff", icon: BriefcaseBusiness, description: "Supports guild operations in the staff workspace.", tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { id: "admin", label: "Admin", icon: Crown, description: "Manages guild administration, access, events, and analytics.", tone: "bg-amber-400/15 text-amber-800 dark:text-amber-200" },
] as const;

export default function RoleSummaryGrid({ counts, loading }: { counts: Record<string, number>; loading: boolean }) {
  return (
    <section aria-label="Workspace role totals" className="grid gap-4 md:grid-cols-3">
      {roles.map(({ id, label, icon: Icon, description, tone }) => (
        <Card key={id} className="border-border/70 shadow-sm">
          <CardContent className="flex items-start gap-4 p-5">
            <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{label}</h2><p className="text-2xl font-semibold tabular-nums">{loading ? <span className="inline-block h-7 w-8 animate-pulse rounded-md bg-muted" aria-label={`Loading ${label} count`} /> : counts[id] ?? 0}</p></div>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
