import { AlertCircle, CalendarDays, UserRound } from "lucide-react";

import type { ModerationReport } from "@/components/admin/reports-moderation/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const severityTone: Record<ModerationReport["severity"], string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  High: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
  Urgent: "bg-destructive/10 text-destructive",
};

const statusTone: Record<ModerationReport["status"], string> = {
  New: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "Under review": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Dismissed: "bg-muted text-muted-foreground",
};

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date) : "Date unavailable";
}

export default function ReportCard({ report, onView }: { report: ModerationReport; onView: (report: ModerationReport) => void }) {
  return (
    <Card className="border-border/70 shadow-sm transition-colors hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityTone[report.severity]}`}><span className="inline-flex items-center gap-1"><AlertCircle className="size-3.5" aria-hidden="true" />{report.severity}</span></span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[report.status]}`}>{report.status}</span>
          {report.category && <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{report.category}</span>}
        </div>

        <h3 className="mt-4 line-clamp-2 font-semibold">{report.subject || "Community report"}</h3>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{report.details || "No additional details provided."}</p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5"><UserRound className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{report.reporterName || report.reporterEmail || "Unknown reporter"}</span></span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDate(report.createdAt)}</span>
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-4 w-full" onClick={() => onView(report)}>Review report</Button>
      </CardContent>
    </Card>
  );
}
