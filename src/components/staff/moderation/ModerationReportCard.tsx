import { ArrowUpRight, CalendarClock, Flag } from "lucide-react";
import type { ModerationReport } from "@/components/admin/reports-moderation/types";

const severityStyle: Record<ModerationReport["severity"], string> = { Urgent: "bg-rose-500/10 text-rose-700 dark:text-rose-300", High: "bg-orange-500/10 text-orange-700 dark:text-orange-300", Medium: "bg-amber-500/10 text-amber-800 dark:text-amber-200", Low: "bg-muted text-muted-foreground" };
const statusStyle: Record<ModerationReport["status"], string> = { New: "bg-sky-500/10 text-sky-700 dark:text-sky-300", "Under review": "bg-violet-500/10 text-violet-700 dark:text-violet-300", Resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", Dismissed: "bg-muted text-muted-foreground" };
function dateLabel(date: Date | null) { return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date) : "Date unavailable"; }

export default function ModerationReportCard({ report, onOpen }: { report: ModerationReport; onOpen: (report: ModerationReport) => void }) {
  return <button type="button" onClick={() => onOpen(report)} className="group flex h-full w-full flex-col rounded-2xl border border-border/70 bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${severityStyle[report.severity]}`}><Flag className="mr-1 inline size-3" aria-hidden="true" />{report.severity} priority</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle[report.status]}`}>{report.status}</span></div>
    <h3 className="mt-4 line-clamp-2 text-base font-semibold">{report.subject || "Community report"}</h3><p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-muted-foreground">{report.details || "No additional details provided."}</p>
    <div className="mt-auto space-y-3 border-t border-border/70 pt-4"><div className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span className="truncate">{report.category || "General concern"}</span><span className="inline-flex shrink-0 items-center gap-1"><CalendarClock className="size-3.5" aria-hidden="true" />{dateLabel(report.createdAt)}</span></div><div className="flex items-center justify-between gap-2"><span className="truncate text-xs">Reported by <span className="font-medium text-foreground">{report.reporterName || "Guild member"}</span></span><span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">Review<ArrowUpRight className="size-3.5" aria-hidden="true" /></span></div></div>
  </button>;
}
