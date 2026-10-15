import { AlertTriangle, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StaffWorkloadCounts } from "@/components/staff/analytics/types";

export default function StaffWorkloadPanel({ workload }: { workload: StaffWorkloadCounts | null }) {
  const metrics = workload
    ? [
        { label: "Assigned", value: workload.assigned, icon: ClipboardList, tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
        { label: "In progress", value: workload.inProgress, icon: Clock3, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
        { label: "Completed", value: workload.completed, icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
        { label: "Overdue", value: workload.overdue, icon: AlertTriangle, tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
      ]
    : [];

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your workload</CardTitle>
        <p className="text-sm text-muted-foreground">Progress across tasks assigned to you.</p>
      </CardHeader>
      <CardContent>
        {workload ? (
          <div className="grid grid-cols-2 gap-3">
            {metrics.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-xl border border-border/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Your task metrics are unavailable.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
