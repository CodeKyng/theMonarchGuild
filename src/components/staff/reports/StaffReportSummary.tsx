import { AlertTriangle, CheckCircle2, FileText, Timer } from "lucide-react";
import type { ModerationReport } from "@/components/admin/reports-moderation/types";

export default function StaffReportSummary({ reports, loading }: { reports: ModerationReport[]; loading: boolean }) {
  const open = reports.filter((report) => report.status === "New" || report.status === "Under review").length;
  const settled = reports.filter((report) => report.status === "Resolved" || report.status === "Dismissed").length;
  const priority = reports.filter((report) => (report.severity === "Urgent" || report.severity === "High") && report.status !== "Resolved" && report.status !== "Dismissed").length;
  const items = [
    { label: "Reports received", value: reports.length, hint: "All submitted reports", icon: FileText, color: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    { label: "Awaiting resolution", value: open, hint: "New or under review", icon: Timer, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { label: "High priority", value: priority, hint: "Open high or urgent reports", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
    { label: "Closed", value: settled, hint: "Resolved or dismissed", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  ];
  return <section aria-label="Reports overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value, hint, icon: Icon, color }) => <article key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold">{loading ? <span className="inline-block h-7 w-9 animate-pulse rounded-md bg-muted" aria-label="Loading" /> : value}</p><p className="text-xs text-muted-foreground">{hint}</p></div></article>)}</section>;
}
