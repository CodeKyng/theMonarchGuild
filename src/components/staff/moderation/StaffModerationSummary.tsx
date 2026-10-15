import { AlertTriangle, CheckCircle2, CircleDashed, Eye } from "lucide-react";
import type { ModerationReport } from "@/components/admin/reports-moderation/types";

export default function StaffModerationSummary({ reports, loading }: { reports: ModerationReport[]; loading: boolean }) {
  const pending = reports.filter((report) => report.status === "New" || report.status === "Under review");
  const urgent = pending.filter((report) => report.severity === "Urgent" || report.severity === "High").length;
  const items = [
    { label: "Needs attention", value: pending.length, detail: "New or under review", icon: CircleDashed, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { label: "High priority", value: urgent, detail: "High and urgent reports", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
    { label: "Under review", value: reports.filter((report) => report.status === "Under review").length, detail: "Currently being handled", icon: Eye, color: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
    { label: "Resolved", value: reports.filter((report) => report.status === "Resolved" || report.status === "Dismissed").length, detail: "Resolved or dismissed", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  ];
  return <section aria-label="Moderation queue summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold">{loading ? <span className="inline-block h-7 w-9 animate-pulse rounded-md bg-muted" aria-label="Loading" /> : value}</p><p className="text-xs text-muted-foreground">{detail}</p></div></article>)}</section>;
}
