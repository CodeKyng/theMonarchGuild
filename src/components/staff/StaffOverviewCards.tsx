import { Activity, BriefcaseBusiness, CalendarDays, type LucideIcon } from "lucide-react";

const styles = [
  "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "bg-amber-500/10 text-amber-700 dark:text-amber-300",
];

export default function StaffOverviewCards({ events, opportunities, posts, loading }: {
  events: number | null;
  opportunities: number | null;
  posts: number | null;
  loading: boolean;
}) {
  const cards: { label: string; value: number | null; detail: string; icon: LucideIcon }[] = [
    { label: "Upcoming events", value: events, detail: "Scheduled for today or later", icon: CalendarDays },
    { label: "Open opportunities", value: opportunities, detail: "Currently available to members", icon: BriefcaseBusiness },
    { label: "Community posts", value: posts, detail: "Published community activity", icon: Activity },
  ];
  return <section aria-label="Staff workspace overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {cards.map(({ label, value, detail, icon: Icon }, index) => <article key={label} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{loading && value === null ? <span className="inline-block h-9 w-14 animate-pulse rounded-lg bg-muted" aria-label="Loading" /> : value ?? "—"}</p></div><span className={`grid size-10 place-items-center rounded-xl ${styles[index]}`}><Icon className="size-5" aria-hidden="true" /></span></div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
    </article>)}
  </section>;
}
