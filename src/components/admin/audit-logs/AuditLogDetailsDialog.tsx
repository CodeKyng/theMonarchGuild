import { Activity, CalendarClock, CircleUserRound, Target } from "lucide-react";
import type { AuditLogEntry } from "@/components/admin/audit-logs/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function pretty(value: unknown) { try { return JSON.stringify(value, null, 2) ?? "Not recorded"; } catch { return String(value); } }
function dateLabel(date: Date | null) { return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "long" }).format(date) : "Timestamp unavailable"; }
export default function AuditLogDetailsDialog({ entry, onClose }: { entry: AuditLogEntry | null; onClose: () => void }) {
  return <Dialog open={Boolean(entry)} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="break-words">{entry?.action || "Audit event"}</DialogTitle><DialogDescription>Recorded administrative activity and available event context.</DialogDescription></DialogHeader>{entry && <ScrollArea orientation="vertical" className="h-[65dvh] min-h-48 w-full pr-3"><div className="space-y-5 pb-4">
    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{entry.category || "General"}</span>{entry.severity && <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{entry.severity} severity</span>}</div>
    <section className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-border p-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><CircleUserRound className="size-3.5" aria-hidden="true" />Actor</p><p className="mt-2 break-words text-sm font-medium">{entry.actorName || "Actor not recorded"}</p><p className="mt-1 break-all text-xs text-muted-foreground">{entry.actorEmail || entry.actorId || "No actor identifier"}</p></div><div className="rounded-xl border border-border p-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><Target className="size-3.5" aria-hidden="true" />Target</p><p className="mt-2 break-words text-sm font-medium">{entry.target || "Target not recorded"}</p><p className="mt-1 break-all text-xs text-muted-foreground">{entry.targetId || "No target identifier"}</p></div></section>
    <section><h3 className="flex items-center gap-2 text-sm font-semibold"><Activity className="size-4 text-primary" aria-hidden="true" />Event details</h3><p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">{entry.description || "No description was recorded for this event."}</p></section>
    <p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarClock className="size-3.5" aria-hidden="true" />{dateLabel(entry.createdAt)}</p>
    {Object.keys(entry.metadata).length > 0 && <section><h3 className="text-sm font-semibold">Additional metadata</h3><pre className="mt-2 overflow-x-auto rounded-xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">{pretty(entry.metadata)}</pre></section>}
    <p className="break-all text-[11px] text-muted-foreground">Event ID: {entry.id}</p>
  </div></ScrollArea>}</DialogContent></Dialog>;
}
