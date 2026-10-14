import { Activity, AlertTriangle, CalendarClock, FileClock } from "lucide-react";
import type { AuditLogEntry } from "@/components/admin/audit-logs/types";

export default function AuditLogSummary({ entries, loading, asOf }: { entries: AuditLogEntry[]; loading: boolean; asOf: Date | null }) {
  const dayAgo = (asOf?.getTime() ?? 0) - 24 * 60 * 60 * 1000;
  const recent = entries.filter((entry) => entry.createdAt && entry.createdAt.getTime() >= dayAgo).length;
  const sensitive = entries.filter((entry) => ["high", "urgent", "critical"].includes(entry.severity.toLowerCase())).length;
  const actors = new Set(entries.map((entry) => entry.actorId || entry.actorEmail).filter(Boolean)).size;
  const cards = [
    { label: "Recorded events", value: entries.length, icon: FileClock, tone: "text-sky-700 bg-sky-500/10" },
    { label: "Last 24 hours", value: recent, icon: Activity, tone: "text-amber-700 bg-amber-500/10" },
    { label: "Elevated severity", value: sensitive, icon: AlertTriangle, tone: "text-red-700 bg-red-500/10" },
    { label: "Unique actors", value: actors, icon: CalendarClock, tone: "text-violet-700 bg-violet-500/10" },
  ];
  return <section aria-label="Audit log overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-4" aria-hidden="true" /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight">{loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" /> : value.toLocaleString()}</p></article>)}</section>;
}
