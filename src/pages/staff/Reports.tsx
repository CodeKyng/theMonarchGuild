import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Download, FileText, RefreshCw } from "lucide-react";
import type { ModerationReport, ReportSeverity, ReportStatus } from "@/components/admin/reports-moderation/types";
import { reportSeverities, reportStatuses } from "@/components/admin/reports-moderation/types";
import ReportCategoryBreakdown from "@/components/staff/reports/ReportCategoryBreakdown";
import StaffReportDetailsDialog from "@/components/staff/reports/StaffReportDetailsDialog";
import StaffReportDirectory from "@/components/staff/reports/StaffReportDirectory";
import StaffReportSummary from "@/components/staff/reports/StaffReportSummary";
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
    id, subject: stringValue(data.subject) || stringValue(data.title),
    details: stringValue(data.details) || stringValue(data.description),
    category: stringValue(data.category) || stringValue(data.reason),
    reporterName: stringValue(data.reporterName), reporterEmail: stringValue(data.reporterEmail),
    reportedUserName: stringValue(data.reportedUserName), reportedUserId: stringValue(data.reportedUserId),
    severity: reportSeverities.find((value) => value.toLowerCase() === rawSeverity.toLowerCase()) ?? "Medium",
    status: reportStatuses.find((value) => value.toLowerCase() === rawStatus.toLowerCase()) ?? "New",
    moderationNotes: stringValue(data.moderationNotes), createdAt: readDate(data.createdAt), updatedAt: readDate(data.updatedAt),
  };
}

export default function StaffReports() {
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
      const rows = snapshot.docs.map((entry) => reportFromDocument(entry.id, entry.data())).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
      setReports(rows);
      setSelectedReport((current) => current ? rows.find((report) => report.id === current.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load staff reports:", loadError);
      setError("Reports could not be loaded. Check your connection and staff permissions, then try again.");
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

  function clearFilters() { setSearch(""); setStatus("all"); setSeverity("all"); }
  function exportCsv() {
    const columns = ["subject", "category", "severity", "status", "reporter", "reportedAccount", "submitted", "moderationNotes"] as const;
    const rows = filteredReports.map((report) => ({ subject: report.subject, category: report.category, severity: report.severity, status: report.status, reporter: report.reporterName, reportedAccount: report.reportedUserName, submitted: report.createdAt?.toISOString() ?? "", moderationNotes: report.moderationNotes }));
    const escape = (value: unknown) => { const text = String(value ?? ""); const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text; return `"${safe.replaceAll('"', '""')}"`; };
    const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "monarch-guild-reports.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300"><FileText className="size-4" aria-hidden="true" />Staff workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Reports</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Track incoming concerns, review report patterns, and find a report’s current resolution.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={exportCsv} disabled={!filteredReports.length}><Download className="size-4" aria-hidden="true" />Export CSV</Button><Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</Button></div></header>
    {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>Try again</Button></div>}
    <StaffReportSummary reports={reports} loading={loading} />
    <section className="grid items-start gap-5 xl:grid-cols-[0.8fr_1.2fr]"><ReportCategoryBreakdown reports={reports} /><div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-400/10 to-card p-5 sm:p-6"><p className="text-sm font-medium text-amber-800 dark:text-amber-200">From report to resolution</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Keep a clear record of each concern.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Use the report history to follow recurring issues and export a filtered snapshot for team review. Open items can be handled in the moderation queue.</p></div></section>
    <StaffReportDirectory reports={filteredReports} loading={loading} search={search} status={status} severity={severity} onSearch={setSearch} onStatus={setStatus} onSeverity={setSeverity} onClear={clearFilters} onView={setSelectedReport} />
    <StaffReportDetailsDialog report={selectedReport} onClose={() => setSelectedReport(null)} />
  </div>;
}
