import { ArrowRight, CalendarClock } from "lucide-react";
import type { AdminOpportunity } from "@/components/admin/opportunities/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffOpportunityDeadlinePanel({
  opportunities,
  onView,
}: {
  opportunities: AdminOpportunity[];
  onView: (opportunity: AdminOpportunity) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closingSoon = opportunities
    .filter(
      (opportunity) =>
        opportunity.status === "Open" &&
        opportunity.deadline &&
        opportunity.deadline >= today,
    )
    .sort((a, b) => (a.deadline?.getTime() ?? 0) - (b.deadline?.getTime() ?? 0))
    .slice(0, 4);

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <CalendarClock className="size-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle className="text-base">Deadline watch</CardTitle>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Open listings with the nearest application dates.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {closingSoon.length ? (
          <ul className="divide-y divide-border">
            {closingSoon.map((opportunity) => (
              <li key={opportunity.id} className="py-2.5 first:pt-1 last:pb-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onView(opportunity)}
                  className="h-auto w-full justify-between gap-3 whitespace-normal px-2 py-2 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{opportunity.title}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {opportunity.organization || opportunity.type || "Guild opportunity"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-xs font-semibold text-foreground">
                      {new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        day: "numeric",
                      }).format(opportunity.deadline!)}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary">
                      Details <ArrowRight className="size-3" aria-hidden="true" />
                    </span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center">
            <p className="text-sm font-medium">No upcoming deadlines</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Open opportunities with a future due date will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
