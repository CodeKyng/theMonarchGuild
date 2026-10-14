import { ShieldCheck } from "lucide-react";

import ModerationFilters from "@/components/admin/reports-moderation/ModerationFilters";
import ReportCard from "@/components/admin/reports-moderation/ReportCard";
import type { ModerationReport } from "@/components/admin/reports-moderation/types";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportsDirectory({
  reports,
  loading,
  search,
  status,
  severity,
  onSearchChange,
  onStatusChange,
  onSeverityChange,
  onReview,
}: {
  reports: ModerationReport[];
  loading: boolean;
  search: string;
  status: string;
  severity: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onReview: (report: ModerationReport) => void;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <ModerationFilters search={search} status={status} severity={severity} onSearchChange={onSearchChange} onStatusChange={onStatusChange} onSeverityChange={onSeverityChange} />

        {loading && reports.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading reports">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : reports.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => <ReportCard key={report.id} report={report} onView={onReview} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
            <ShieldCheck className="mx-auto size-8 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="mt-3 font-semibold">No reports match this view</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Try another filter. New community reports will appear here for admin review.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
