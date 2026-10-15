import { ClipboardCheck, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StaffQueueCounts } from "@/components/staff/analytics/types";

function QueueRows({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof Flag;
  rows: { label: string; value: number }[];
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">{total} total</span>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => {
          const percentage = total ? Math.round((row.value / total) * 100) : 0;
          return (
            <li key={row.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium tabular-nums">{row.value}</span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={`${row.label} share of ${title.toLocaleLowerCase()}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
              >
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${percentage}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function StaffQueueHealth({ queues }: { queues: StaffQueueCounts }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Review queue health</CardTitle>
        <p className="text-sm text-muted-foreground">Current status of reports and content reviews.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {queues.reports ? (
          <QueueRows
            title="Reports"
            icon={Flag}
            rows={[
              { label: "New", value: queues.reports.new },
              { label: "Under review", value: queues.reports.underReview },
              { label: "Resolved", value: queues.reports.resolved },
              { label: "Dismissed", value: queues.reports.dismissed },
            ]}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Report data is unavailable.</p>
        )}
        <div className="border-t border-border" />
        {queues.content ? (
          <QueueRows
            title="Content reviews"
            icon={ClipboardCheck}
            rows={[
              { label: "Needs review", value: queues.content.needsReview },
              { label: "Reviewed", value: queues.content.reviewed },
              { label: "Follow-up needed", value: queues.content.followUp },
            ]}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Content review data is unavailable.</p>
        )}
      </CardContent>
    </Card>
  );
}
