import {
  Activity,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { StaffAnalyticsData } from "@/components/staff/analytics/types";

export default function StaffAnalyticsSummary({
  data,
  loading,
}: {
  data: StaffAnalyticsData;
  loading: boolean;
}) {
  const metrics: { label: string; value: number | null; detail: string; icon: LucideIcon; tone: string }[] = [
    {
      label: "Community posts",
      value: data.posts,
      detail: "Shared with the Guild",
      icon: Activity,
      tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    },
    {
      label: "Open opportunities",
      value: data.opportunities,
      detail: "Currently available",
      icon: BriefcaseBusiness,
      tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
    {
      label: "Upcoming events",
      value: data.upcomingEvents,
      detail: "On the Guild calendar",
      icon: CalendarClock,
      tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    {
      label: "Your assigned tasks",
      value: data.workload?.assigned ?? null,
      detail: "Active staff workload",
      icon: ClipboardCheck,
      tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
  ];

  return (
    <section aria-label="Guild operations at a glance" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
        <article key={label} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                {loading && value === null ? (
                  <span className="inline-block h-9 w-14 animate-pulse rounded-lg bg-muted" aria-label="Loading" />
                ) : value ?? "—"}
              </p>
            </div>
            <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
        </article>
      ))}
    </section>
  );
}
