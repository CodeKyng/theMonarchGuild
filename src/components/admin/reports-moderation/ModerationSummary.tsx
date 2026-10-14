import { AlertTriangle, CircleCheck, CircleDashed, ShieldCheck } from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";
import type { ModerationReport } from "@/components/admin/reports-moderation/types";

export default function ModerationSummary({ reports, loading }: { reports: ModerationReport[]; loading: boolean }) {
  const active = reports.filter((report) => report.status === "New" || report.status === "Under review");
  const priority = active.filter((report) => report.severity === "High" || report.severity === "Urgent").length;
  const resolved = reports.filter((report) => report.status === "Resolved").length;
  const dismissed = reports.filter((report) => report.status === "Dismissed").length;

  return (
    <section aria-label="Moderation queue summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard label="Needs review" value={active.length} detail="New and in-review reports" icon={CircleDashed} loading={loading && reports.length === 0} />
      <AdminStatCard label="Priority reports" value={priority} detail="High or urgent and unresolved" icon={AlertTriangle} loading={loading && reports.length === 0} />
      <AdminStatCard label="Resolved" value={resolved} detail="Reports with a resolution" icon={CircleCheck} loading={loading && reports.length === 0} />
      <AdminStatCard label="Dismissed" value={dismissed} detail="Reports reviewed and dismissed" icon={ShieldCheck} loading={loading && reports.length === 0} />
    </section>
  );
}
