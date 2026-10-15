import { BriefcaseBusiness } from "lucide-react";
import type { AdminOpportunity } from "@/components/admin/opportunities/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colors = [
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
];

export default function StaffOpportunityTypeBreakdown({
  opportunities,
}: {
  opportunities: AdminOpportunity[];
}) {
  const open = opportunities.filter((opportunity) => opportunity.status === "Open");
  const typeCounts = open.reduce<Record<string, number>>((counts, opportunity) => {
    const type = opportunity.type.trim() || "Unspecified";
    counts[type] = (counts[type] ?? 0) + 1;
    return counts;
  }, {});
  const types = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5);
  const maxCount = types[0]?.[1] ?? 1;

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
          <BriefcaseBusiness className="size-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle className="text-base">Opportunity mix</CardTitle>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Types represented in open listings.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {types.length ? (
          <ul className="space-y-4">
            {types.map(([type, count], index) => (
              <li key={type}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-medium">{type}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {count} {count === 1 ? "listing" : "listings"}
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={`${type} share of open opportunities`}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-valuenow={count}
                >
                  <div
                    className={`h-full rounded-full ${colors[index % colors.length]}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center">
            <p className="text-sm font-medium">No open listings yet</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              The mix of available roles will show here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
