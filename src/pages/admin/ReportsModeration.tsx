import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Flag, RefreshCw } from "lucide-react";

import ModerationSummary from "@/components/admin/reports-moderation/ModerationSummary";
import ReportReviewDialog from "@/components/admin/reports-moderation/ReportReviewDialog";
import ReportsDirectory from "@/components/admin/reports-moderation/ReportsDirectory";
import type { ModerationReport, ReportSeverity, ReportStatus } from "@/components/admin/reports-moderation/types";
import { reportSeverities, reportStatuses } from "@/components/admin/reports-moderation/types";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
}

function toSeverity(value: unknown): ReportSeverity {
  const severity = stringValue(value);
  return reportSeverities.find((item) => item.toLowerCase() === severity.toLowerCase()) ?? "Medium";
}

function toStatus(value: unknown): ReportStatus {
  const status = stringValue(value);
  return reportStatuses.find((item) => item.toLowerCase() === status.toLowerCase()) ?? "New";
}

function reportFromDocument(id: string, data: Record<string, unknown>): ModerationReport {
  return {
    id,
    subject: stringValue(data.subject) || stringValue(data.title),
    details: stringValue(data.details) || stringValue(data.description),
    category: stringValue(data.category) || stringValue(data.reason),
    reporterName: stringValue(data.reporterName),
    reporterEmail: stringValue(data.reporterEmail),
    reportedUserName: stringValue(data.reportedUserName),
    reportedUserId: stringValue(data.reportedUserId),
    severity: toSeverity(data.severity),
    status: toStatus(data.status),
    moderationNotes: stringValue(data.moderationNotes),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

const severityOrder: Record<ReportSeverity, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

function sortQueue(reports: ModerationReport[]) {
  return [...reports].sort((a, b) => {
    const aActive = a.status === "New" || a.status === "Under review";
    const bActive = b.status === "New" || b.status === "Under review";
    if (aActive !== bActive) return aActive ? -1 : 1;
    const urgency = severityOrder[a.severity] - severityOrder[b.severity];
    if (urgency) return urgency;
    return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
  });
}

export default function AdminReportsModeration() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "reports"));
      const rows = sortQueue(snapshot.docs.map((entry) => reportFromDocument(entry.id, entry.data())));
      setReports(rows);
      setSelectedReport((current) => current ? rows.find((report) => report.id === current.id) ?? null : null);
    } catch (loadError) {
      console.error("Failed to load moderation reports:", loadError);
      setError("Reports could not be loaded. Check your connection and permissions, then try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const filteredReports = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesSearch = !needle || [report.subject, report.details, report.category, report.reporterName, report.reporterEmail, report.reportedUserName, report.reportedUserId]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesSearch && (status === "all" || report.status === status) && (severity === "all" || report.severity === severity);
    });
  }, [reports, search, severity, status]);

  function handleSaved(id: string, nextStatus: ReportStatus, moderationNotes: string) {
    setReports((current) => sortQueue(current.map((report) => report.id === id ? { ...report, status: nextStatus, moderationNotes, updatedAt: new Date() } : report)));
    setSelectedReport((current) => current?.id === id ? { ...current, status: nextStatus, moderationNotes, updatedAt: new Date() } : current);
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><Flag className="size-4" aria-hidden="true" />Guild administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Reports &amp; Moderation</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Review community reports consistently, prioritize urgent concerns, and document moderation outcomes.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh queue</Button>
      </header>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button></div>}

      <ModerationSummary reports={reports} loading={loading} />
      <ReportsDirectory reports={filteredReports} loading={loading} search={search} status={status} severity={severity} onSearchChange={setSearch} onStatusChange={setStatus} onSeverityChange={setSeverity} onReview={setSelectedReport} />

      <p className="rounded-xl border border-border bg-muted/35 px-4 py-3.5 text-sm leading-6 text-muted-foreground">This queue reads report records from the <code className="rounded bg-muted px-1 py-0.5">reports</code> collection. Member report submission is not connected to the app yet.</p>

      <ReportReviewDialog key={selectedReport?.id ?? "closed"} report={selectedReport} onClose={() => setSelectedReport(null)} onSaved={handleSaved} />
    </div>
  );
}
