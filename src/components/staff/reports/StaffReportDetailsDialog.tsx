import { ExternalLink, FileText, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { ModerationReport } from "@/components/admin/reports-moderation/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatDate(date: Date | null) { return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(date) : "Date unavailable"; }

export default function StaffReportDetailsDialog({ report, onClose }: { report: ModerationReport | null; onClose: () => void }) {
  return <Dialog open={Boolean(report)} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{report?.subject || "Community report"}</DialogTitle><DialogDescription>Report details and current handling status.</DialogDescription></DialogHeader>{report && <div className="space-y-5">
    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">{report.severity} priority</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{report.status}</span>{report.category && <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{report.category}</span>}</div>
    <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2"><div><p className="flex items-center gap-2 text-xs text-muted-foreground"><UserRound className="size-3.5" aria-hidden="true" />Reporter</p><p className="mt-1 text-sm font-medium">{report.reporterName || "Not provided"}</p></div><div><p className="flex items-center gap-2 text-xs text-muted-foreground"><UserRound className="size-3.5" aria-hidden="true" />Reported account</p><p className="mt-1 text-sm font-medium">{report.reportedUserName || "Not specified"}</p></div><div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Submitted</p><p className="mt-1 text-sm">{formatDate(report.createdAt)}</p></div></div>
    <section><h3 className="flex items-center gap-2 text-sm font-semibold"><FileText className="size-4 text-muted-foreground" aria-hidden="true" />Report details</h3><p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">{report.details || "No additional details provided."}</p></section>
    {report.moderationNotes && <section><h3 className="text-sm font-semibold">Moderator notes</h3><p className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-border p-4 text-sm leading-6 text-muted-foreground">{report.moderationNotes}</p></section>}
    {(report.status === "New" || report.status === "Under review") && <Link to="/staff/moderation-queue" onClick={onClose} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Open moderation queue<ExternalLink className="size-4" aria-hidden="true" /></Link>}
  </div>}</DialogContent></Dialog>;
}
