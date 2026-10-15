import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Flag, Info, RefreshCw } from "lucide-react";
import ModerationReviewDialog from "@/components/staff/moderation/ModerationReviewDialog";
import ModerationQueueDirectory from "@/components/staff/moderation/ModerationQueueDirectory";
import StaffModerationSummary from "@/components/staff/moderation/StaffModerationSummary";
import type { ModerationReport, ReportSeverity, ReportStatus } from "@/components/admin/reports-moderation/types";
import { reportSeverities, reportStatuses } from "@/components/admin/reports-moderation/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) { return typeof value === "string" ? value : ""; }
function readDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") { const date = value.toDate(); return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null; }
  return null;
}
function reportFromDocument(id: string, data: Record<string, unknown>): ModerationReport {
  const rawSeverity = stringValue(data.severity);
  const rawStatus = stringValue(data.status);
  return {
    id,
    subject: stringValue(data.subject) || stringValue(data.title),
    details: stringValue(data.details) || stringValue(data.description),
    category: stringValue(data.category) || stringValue(data.reason),
    reporterName: stringValue(data.reporterName),
    reporterEmail: stringValue(data.reporterEmail),
    reportedUserName: stringValue(data.reportedUserName),
    reportedUserId: stringValue(data.reportedUserId),
    severity: reportSeverities.find((value) => value.toLowerCase() === rawSeverity.toLowerCase()) ?? "Medium",
    status: reportStatuses.find((value) => value.toLowerCase() === rawStatus.toLowerCase()) ?? "New",
    moderationNotes: stringValue(data.moderationNotes),
    createdAt: readDate(data.createdAt),
    updatedAt: readDate(data.updatedAt),
  };
}
const severityOrder: Record<ReportSeverity, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
function sortQueue(reports: ModerationReport[]) {
  return [...reports].sort((a, b) => {
    const aActive = a.status === "New" || a.status === "Under review";
    const bActive = b.status === "New" || b.status === "Under review";
    if (aActive !== bActive) return aActive ? -1 : 1;
    const priority = severityOrder[a.severity] - severityOrder[b.severity];
    if (priority) return priority;
    return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
  });
}

export default function StaffModerationQueue() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const snapshot = await getDocs(collection(db, "reports"));
      const rows = sortQueue(snapshot.docs.map((entry) => reportFromDocument(entry.id, entry.data())));
      setReports(rows);
      setSelectedReport((current) => current ? rows.find((report) => report.id === current.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load staff moderation queue:", loadError);
      setError("The moderation queue could not be loaded. Check your connection and staff permissions, then try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(timer); }, [refresh]);

  const filteredReports = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesSearch = !needle || [report.subject, report.details, report.category, report.reporterName, report.reportedUserName, report.reportedUserId].some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (status === "all" || report.status === status) && (severity === "all" || report.severity === severity);
    });
  }, [reports, search, severity, status]);

  function handleSaved(id: string, nextStatus: ReportStatus, notes: string) {
    setReports((current) => sortQueue(current.map((report) => report.id === id ? { ...report, status: nextStatus, moderationNotes: notes, updatedAt: new Date() } : report)));
    setSelectedReport((current) => current?.id === id ? { ...current, status: nextStatus, moderationNotes: notes, updatedAt: new Date() } : current);
  }
  function clearFilters() { setSearch(""); setStatus("all"); setSeverity("all"); }

  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300"><Flag className="size-4" aria-hidden="true" />Staff workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Moderation queue</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Prioritize community concerns, document review decisions, and keep each report moving toward resolution.</p></div><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh queue</Button></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>Try again</Button></div>}
    <StaffModerationSummary reports={reports} loading={loading} />
    <ModerationQueueDirectory reports={filteredReports} allReports={reports} loading={loading} search={search} status={status} severity={severity} onSearch={setSearch} onStatus={setStatus} onSeverity={setSeverity} onClear={clearFilters} onOpen={setSelectedReport} />
    <aside className="flex gap-3 rounded-2xl border border-border bg-muted/30 p-4"><Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">This queue shows reports saved in the platform’s reports collection. Member report submission is not connected to the app yet.</p></aside>
    <ModerationReviewDialog key={selectedReport?.id ?? "closed"} report={selectedReport} onClose={() => setSelectedReport(null)} onSaved={handleSaved} />
  </div>;
}
