import { BriefcaseBusiness, CalendarClock, CircleDollarSign, Globe2 } from "lucide-react";
import type { AdminOpportunity } from "@/components/admin/opportunities/types";

export default function StaffOpportunitySummary({ opportunities, loading }: { opportunities: AdminOpportunity[]; loading: boolean }) {
  const open = opportunities.filter((item) => item.status === "Open");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const metrics = [
    { label: "Open opportunities", value: open.length, detail: "Accepting applications", icon: BriefcaseBusiness, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
    { label: "Closing this week", value: open.filter((item) => item.deadline && item.deadline >= today && item.deadline <= nextWeek).length, detail: "Open listings due in 7 days", icon: CalendarClock, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { label: "Remote friendly", value: open.filter((item) => /remote/i.test(`${item.arrangement} ${item.location}`)).length, detail: "Remote or distributed", icon: Globe2, color: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    { label: "Pay details included", value: open.filter((item) => item.compensation.trim()).length, detail: "Compensation is listed", icon: CircleDollarSign, color: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  ];
  return <section aria-label="Opportunity overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold">{loading ? <span className="inline-block h-7 w-9 animate-pulse rounded-md bg-muted" aria-label="Loading" /> : value}</p><p className="text-xs text-muted-foreground">{detail}</p></div></article>)}</section>;
}
